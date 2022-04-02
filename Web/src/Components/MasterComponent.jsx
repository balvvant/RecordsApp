import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { withRouter } from 'react-router-dom';
import { Link } from 'react-scroll';
import { changeOldResourceKey, changeOpenComponent, changeResourceKey, changeTheScreen, errorLogger, globalAlert, globalLoader, updateLanguageId, updateLanguageList, verifyRoute, changeFeatures, changeHeaderContent } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, defaultLanguage, GLOBAL_API, PRIMARY_COLOR, PRIMARY_FONT_COLOR, resourceGroups, RESOURCE_KEYS, SCREENS, MENUS_TYPE, CUSTOM_RESOURCES, ACTIONS } from '../Constants/types';
import Blogs from '../Pages/blogs';
import ForgotPassword from '../Pages/forgotPaasword';
import Login from '../Pages/Login';
import ResetPassword from '../Pages/resetPassword';
import StaticPage from '../Pages/staticPage';
import Support from '../Pages/support';
import ManageProfileComponent from '../Components/ManageProfileComponent';
import { CallApiAsync, getOrg } from '../Functions/CommonFunctions';
import FooterComponent from './FooterComponent';
import HeaderComponent from './HeaderComponent';
import SidebarComponent from './SidebarComponent';

class MasterComponent extends Component {
    constructor(props) {
        super(props);
        this.currentPathname = null;
        this.currentSearch = null;
        let token = localStorage.getItem('token');
        this.state = {
            resources: [],
            websiteData: [],
            footerHeader: [],
            navigations: [],
            urlLink: '',
            iframeHeight: "100vh",
            iframeResize: false,
            active: '',
            indexLink: null,
            isDropdown: false,
            token: token,
            languageId: props.languageId,
            orgId: props.orgId
        }
    }

    componentDidMount = () => {
        const { history } = this.props;

        history.listen((newLocation, action) => {
          if (action === "PUSH") {
            if (newLocation.pathname !== this.currentPathname || newLocation.search !== this.currentSearch) {
              this.currentPathname = newLocation.pathname;
              this.currentSearch = newLocation.search;
              history.push({
                pathname: newLocation.pathname,
                search: newLocation.search
              });
            }
          } else {
            console.log(history)
            history.go(1);
          }
        });
        
        this.FetchData();

    }

    componentDidUpdate() {
        const { languageId, orgId } = this.props;
        let token = localStorage.getItem("token");
        if (orgId?.organization_id != this.state.orgId?.organization_id) {
            if (token !== this.state.token) {
                if (token) {
                    changeOpenComponent(false);
                }
                this.setState({ token: token });
                this.getWebsiteContent();
            }
            if (this.props.createUserData?.userInfo) {
                if (!this.props.openComponent) {
                    changeOpenComponent(true)
                    this.FetchData()
                }
            }
            if (languageId !== this.state.languageId) {
                this.setState({ languageId: languageId }, () => { this.getWebsiteContent(); });
            }
        } else if (this.state.token && !token) {
            this.setState({ token: token });
            this.getWebsiteContent();
        }
    } 

    FetchData = () => {
        let org = getOrg();
        let token = localStorage.getItem("token");
        if (org?.organization_id || !token) {
            //get login resources
            this.getWebsiteContent();
            // reverse back to default primary color
            document.body.style.setProperty('--primary-color', PRIMARY_COLOR);
            document.body.style.setProperty('--primary-font-color', PRIMARY_FONT_COLOR);

            let isLockout = JSON.parse(localStorage.getItem('isLockout'));
            let timeEnd = JSON.parse(localStorage.getItem('endTime'));

            if (timeEnd || (isLockout && isLockout > 2)) {
                this.setState({ isLockout: true });
            }
        }
    }

    openPage = (resourceKey) => {
        changeOpenComponent(true)
        changeResourceKey(resourceKey);
        if (resourceKey == RESOURCE_KEYS.BLOG) {
            changeOldResourceKey(null);
            changeTheScreen(SCREENS.BLOGS)
        } else {
            changeTheScreen(SCREENS.STATIC_PAGE)
        }
    }

    openLoginScreen = () => {
        changeOpenComponent(true)
        changeOldResourceKey(null);
        changeTheScreen(SCREENS.LOGIN);
    }

    onClickLogo = (val) => {
        changeOpenComponent(val)
        if (this.state.token) {
            verifyRoute(this.props.history, `/dashboard`);
        } else {
            this.props.history.push('/')
        }
    }

    getWebsiteContent = async () => {
        try {
            globalLoader(true);

            //get language data
            let languageId = localStorage.getItem('language_id');
            if (!languageId) {
                languageId = defaultLanguage;
            }

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-landing-page-menus',
                body: {
                    group_ids: [resourceGroups.COMMON, resourceGroups.MENUS, resourceGroups.MENU_GROUPS, resourceGroups.FOOTER_MENU_HEADER_GROUPS, resourceGroups.WEBSITE_MENU, resourceGroups.SUPPORT, resourceGroups.FEATURE_MENU],
                    languageFlag: true
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {

                let resources = resourcesResult.data.data.pageResources;
                let languages = resourcesResult.data.data.languages;

                let footerHeaderResources = resources.filter((e) => e.group_id == resourceGroups.FOOTER_MENU_HEADER_GROUPS);
                this.setState({ resources: resources, footerHeader: footerHeaderResources });

                if (resourcesResult.data.data.defaultLanguage > 0) {
                    localStorage.setItem('language_id', resourcesResult.data.data.defaultLanguage);
                    localStorage.setItem('default_language_id', resourcesResult.data.data.defaultLanguage);
                    updateLanguageId(resourcesResult.data.data.defaultLanguage);
                }

                if (languages.length > 0) {
                    updateLanguageList(languages);
                    localStorage.setItem('languageList', JSON.stringify(languages))
                }
                let webMenus = [];
                let navigations = [];
                let menus = [];
                // parent_menu_id
                for (let record of resourcesResult.data.data.webMenus) {
                    if (typeof webMenus[record.location] == "undefined") {
                        webMenus[record.location] = [];
                    }
                    if (record.group_resource_key) {
                        if (typeof webMenus[record.location][record.group_resource_key] == "undefined") {
                            webMenus[record.location][record.group_resource_key] = [];
                        }
                        webMenus[record.location][record.group_resource_key].push({
                            website_menu_id: record.website_menu_id,
                            menu_resource_key: record.menu_resource_key,
                            resource_value: record.resource_value,
                            info_value: record.info_value,
                            image_name: record.image_name,
                            place_holder_value: record.place_holder_value
                        });
                    } else {
                        if (record.location == "HEADER") {
                            if (record.parent_menu_id) {
                                let nevigationIndex = navigations.findIndex(e => e.website_menu_id == record.parent_menu_id);
                                if (nevigationIndex >= 0) {
                                    navigations[nevigationIndex].data.push({
                                        website_menu_id: record.website_menu_id,
                                        place_holder_value: record.place_holder_value,
                                        resource_value: record.resource_value,
                                        info_value: record.info_value,
                                    });
                                } else {
                                    navigations.push({
                                        website_menu_id: record.parent_menu_id,
                                        place_holder_value: null,
                                        resource_value: null,
                                        info_value: null,
                                        data: [{
                                            website_menu_id: record.website_menu_id,
                                            place_holder_value: record.place_holder_value,
                                            resource_value: record.resource_value,
                                            info_value: record.info_value,
                                        }]
                                    });
                                }

                            } else {
                                let nevigationIndex = navigations.findIndex(e => e.website_menu_id == record.website_menu_id);
                                if (nevigationIndex >= 0) {
                                    navigations[nevigationIndex].place_holder_value = record.place_holder_value;
                                    navigations[nevigationIndex].resource_value = record.resource_value;
                                    navigations[nevigationIndex].info_value = record.info_value;
                                } else {
                                    navigations.push({
                                        website_menu_id: record.website_menu_id,
                                        place_holder_value: record.place_holder_value,
                                        resource_value: record.resource_value,
                                        info_value: record.info_value,
                                        data: []
                                    });
                                }
                            }
                        }
                        if (record.location == MENUS_TYPE.HEADER_MENU || record.location == MENUS_TYPE.LEFT_MENU) {
                            menus.push(record);
                        }
                        webMenus[record.location].push({
                            website_menu_id: record.website_menu_id,
                            resource_value: record.resource_value,
                            info_value: record.info_value,
                            image_name: record.image_name,
                            place_holder_value: record.place_holder_value
                        });
                    }
                }
                if (navigations && navigations.length > 0) {
                    changeHeaderContent(navigations);
                }

                if (menus && menus.length > 0) {
                    localStorage.setItem('featureList', JSON.stringify(menus));
                    changeFeatures(menus);
                }

                this.setState({ websiteData: webMenus, navigations: navigations })
            }
            else {
                globalAlert(CONSTANTS.ERROR, CUSTOM_RESOURCES[resourcesResult.data.status]);
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "websiteMenu/getWebsiteContent",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    onClickLoginButton = (openComponent, oldResKey, screenType) => {
        changeOpenComponent(openComponent)
        changeOldResourceKey(oldResKey);
        changeTheScreen(screenType);
    }

    changeLanguage = (languageId) => {
        localStorage.setItem('language_id', languageId);
        updateLanguageId(languageId);
    }

    render() {
        return (
            <React.Fragment>
                <div class="parent">
                    <div >
                        <HeaderComponent onClickLogo={this.onClickLogo} onClickLoginButton={this.onClickLoginButton} navigations={this.state.navigations} resources={this.state.resources} history={this.props.history} websiteData={this.state.websiteData} changeLanguage={this.changeLanguage} />
                    </div>
                    <div class="main">
                        <div class="">
                            <SidebarComponent websiteData={this.state.websiteData} resources={this.state.resources} />
                        </div>
                        <div class="content" style={{ backgroundColor: !this.state.token ? '#fff' : '#e3eaef', overflow: 'hidden' }}>
                            {
                                !this.state.token && window.location.pathname == '/' && !this.props.openComponent && (this.state.websiteData["SLIDER"] && this.state.websiteData["SLIDER"].length > 0) &&
                                <div className="div-container" style={{ background: '#fff' }}>
                                    <section className="login-comp-wrapper" >
                                        <Carousel showThumbs={false} showStatus={false} >
                                            {
                                                this.state.websiteData["SLIDER"].map((slide, slideIndex) => {
                                                    var urlRegex = /(https?:\/\/[^ ]*)"/;
                                                    if (slide.resource_value) {
                                                        var url = slide.resource_value.match(urlRegex);
                                                        if (url) {
                                                            return <div key={slideIndex}>
                                                                <img src={`${GLOBAL_API}/${slide.image_name}`} height={'600px'} />
                                                                {(slide.place_holder_value || slide.info_value) && <Link onClick={() => this.setState({ openComponent: false, urlLink: url[1] })} to="" smooth={true} duration={1000}>
                                                                    <div className='carousel-div legend legend-overlay'>
                                                                        <div className="carousel-content-div">
                                                                            <p className='legend-header'>{slide.place_holder_value}</p>
                                                                            <p className="legend-text">{slide.info_value}</p>
                                                                        </div>
                                                                    </div>
                                                                </Link>}
                                                            </div>
                                                        }
                                                    }

                                                    return <div>
                                                        <img src={`${GLOBAL_API}/${slide.image_name}`} height={'600px'} />
                                                        {(slide.place_holder_value || slide.info_value) && <div className='carousel-div legend legend-overlay'>
                                                            <div className="carousel-content-div">
                                                                <p className='legend-header'>{slide.place_holder_value}</p>
                                                                <p className="legend-text">{slide.info_value}</p>
                                                            </div>
                                                        </div>}
                                                    </div>

                                                })
                                            }
                                        </Carousel>
                                    </section>
                                </div>
                            }

                            {
                                !this.props.openComponent &&
                                <div style={{ margin: this.state.token ? 10 : 0 }}>
                                    {this.props.children}
                                </div>
                            }
                            {
                                this.props.openComponent &&
                                <div>
                                    {
                                        this.props.openedScreen == SCREENS.LOGIN && <Login />
                                    }
                                    {
                                        this.props.openedScreen == SCREENS.FORGOT_PASSWORD && <ForgotPassword />
                                    }
                                    {
                                        this.props.openedScreen == SCREENS.SUPPORT && <Support />
                                    }
                                    {
                                        this.props.openedScreen == SCREENS.RESET_PASSWORD && <ResetPassword />
                                    }
                                    {
                                        this.props.openedScreen == SCREENS.STATIC_PAGE && <StaticPage />
                                    }
                                    {
                                        this.props.openedScreen == SCREENS.BLOGS && <Blogs />
                                    }
                                    {
                                        (this.props.openedScreen == SCREENS.ACTIVATE_USER && this.props.createUserData.userInfo) && <div style={{ padding: "40px 90px", marginTop: 'auto' }}><ManageProfileComponent userInfo={this.props.createUserData.userInfo} roleType={this.props.createUserData.role} roleAction={this.props.createUserData.role} currentAction={ACTIONS.CREATE} /></div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    <div class="">
                        <FooterComponent openPage={this.openPage} resources={this.state.resources} websiteData={this.state.websiteData} footerHeader={this.state.footerHeader} />
                    </div>
                </div>
            </React.Fragment>
        )
    }

}
const mapStateToProps = state => ({
    languageId: state.common.languageId,
    languageList: state.common.languageList,
    openedScreen: state.screen.openedScreen,
    createUserData: state.screen.createUserData,
    resourceKey: state.screen.resourceKey,
    openComponent: state.common.openComponent,
    showCategories: state.common.showCategories,
    orgId: state.user.orgId
});

export default connect(mapStateToProps)(withRouter(MasterComponent));
