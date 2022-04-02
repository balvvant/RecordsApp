import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { Link } from 'react-scroll';
import { changeCurrentSidebarSubMenu, changeOldResourceKey, changeOrgId, changeResourceKey, changeTheScreen, verifyRoute } from '../actions/commonActions';
import { PRIMARY_COLOR, PRIMARY_FONT_COLOR, RESOURCE_KEYS, SCREENS } from '../actionsTypes/types';
import { clearSSOUser } from '../_shared/commonFunction';

class FooterComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            resources: [],
            websiteData: [],
            footerHeader: [],
            navigations: [],
            openComponent: false,
            urlLink: '',
            iframeHeight: "100vh",
            iframeResize: false,
            active: '',
            indexLink: null,
            isDropdown: false
        }
    }


    componentDidMount = () => {
        if (localStorage.getItem('token')) {
            let isSSOUser = localStorage.getItem('isSSOUser');
            if (isSSOUser) {
                clearSSOUser(this.props.history, '/')
                this.fetchData();
            } else {
                verifyRoute(this.props.history, `/dashboard`);
            }

        } else {
            this.fetchData();
        }
    }

    fetchData = () => {
        //get login resources
        this.getWebsiteContent();

        changeOrgId(null)
        changeCurrentSidebarSubMenu(null);

        // reverse back to default primary color
        document.body.style.setProperty('--primary-color', PRIMARY_COLOR);
        document.body.style.setProperty('--primary-font-color', PRIMARY_FONT_COLOR);

        let isLockout = JSON.parse(localStorage.getItem('isLockout'));
        let timeEnd = JSON.parse(localStorage.getItem('endTime'));

        if (timeEnd || (isLockout && isLockout > 2)) {
            this.setState({ isLockout: true });
            // this.timeCount();
        }
    }

    componentDidUpdate() {
        if (this.props.createUserData?.userInfo) {
            if (!this.state.openComponent) {
                this.setState({ openComponent: true });
            }
        }
    }

    openPage = (resourceKey) => {
        this.setState({ openComponent: true }, () => {
            changeResourceKey(resourceKey);
            if (resourceKey == RESOURCE_KEYS.BLOG) {
                changeOldResourceKey(null);
                changeTheScreen(SCREENS.BLOGS)
            } else {
                changeTheScreen(SCREENS.STATIC_PAGE)
            }
        });
    }

    getFooters = () => {
        const activeStyle = { color: '#3366cc' };
        return this.state.footerHeader.map((resource, index) => {
            if (this.state.websiteData["FOOTER"] && this.state.websiteData["FOOTER"][resource.resource_key]) {
                return (
                    <>
                        <div className="col-xs-6 col-md-2 p-0 site-foot-col" key={index}>
                            <h6>{resource.resource_value}</h6>
                            <ul className="footer-links">
                                {
                                    this.state.websiteData["FOOTER"][resource.resource_key].length > 0 && this.state.websiteData["FOOTER"][resource.resource_key].map((footer, footerIndex) => {
                                        if (footer.resource_value) {
                                            return <li key={footerIndex} >
                                                <Link to="#" smooth={true} duration={1000} onClick={() => { window.scrollTo(0, 0); changeResourceKey(null); this.setState({ openComponent: false, active: footer.place_holder_value, indexLink: footerIndex }, () => this.openPage(footer.menu_resource_key)) }} style={this.state.active == footer.place_holder_value && this.state.indexLink == footerIndex ? activeStyle : {}} >{footer.place_holder_value}
                                                </Link>
                                            </li>
                                        }
                                        return <li style={{ cursor: 'auto' }} key={footerIndex}><h5>{footer.place_holder_value}</h5><p>{footer.info_value}</p></li>
                                    })
                                }

                            </ul>
                        </div>
                    </>
                )
            } else {
                return null;
            }
        })

    }

    openLoginScreen = () => {
        this.setState({ openComponent: true });
        changeOldResourceKey(null);
        changeTheScreen(SCREENS.LOGIN);
    }

    onIframeLoad = () => {
        try {
            let scrollHight = document.getElementById("Iframe").contentWindow.document.body.scrollHeight;
            this.setState({ iframeHeight: scrollHight + "px", iframeResize: true })
        } catch (error) {
            this.setState({ iframeHeight: "100vh", iframeResize: false })
        }

    }
    render() {
        return (
            <>
                <section className="login-comp-wrapper" >
                    {
                        !this.state.openComponent && this.state.navigations.length > 0 && this.state.navigations.map((header, index) => {
                            if (header.place_holder_value) {
                                return <>
                                    {
                                        (header.info_value || header.resource_value || (header.data && header.data.length > 0)) && <div id={header.place_holder_value.toLowerCase().replace(" ", "-")} key={index} className="landing-content-div">
                                            <p className="content-header">{header.place_holder_value}</p>
                                            <h6>{header.info_value}</h6>
                                            <div dangerouslySetInnerHTML={{ __html: header.resource_value }} ></div>
                                        </div>
                                    }
                                    {
                                        header.data && header.data.length > 0 && header.data.map((subHeader, subIndex) => {
                                            if (subHeader.place_holder_value) {
                                                return <>
                                                    <div id={subHeader.place_holder_value.toLowerCase().replace(" ", "-")} key={subIndex} className="mt-4 landing-content-div">
                                                        <p className="content-sub-header">{subHeader.place_holder_value}</p>
                                                        <h6>{subHeader.info_value}</h6>
                                                        <div dangerouslySetInnerHTML={{ __html: subHeader.resource_value }} ></div>
                                                    </div>
                                                </>
                                            }
                                        })
                                    }
                                </>
                            }
                        })
                    }
                    {
                        this.state.openComponent &&
                        <div>
                            {
                                this.props.openedScreen == SCREENS.LOGIN && <LoginComponent />
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
                                (this.props.openedScreen == SCREENS.ACTIVATE_USER && this.props.createUserData.userInfo) && <div style={{ padding: "40px 90px", marginTop: 'auto' }}><ManageProfileComponent userInfo={this.props.createUserData.userInfo} roleType={this.props.createUserData.role} roleAction={this.props.createUserData.role} currentAction="create" /></div>
                            }
                        </div>
                    }
                </section >
                {
                    this.state.websiteData["FOOTER"] &&
                    <div className="site-footer" style={{ padding: "60px 90px", marginTop: 'auto' }}>
                        <div className="container-fluid">
                            <div className="row justify-content-between">
                                {this.state.footerHeader.length > 0 ? this.getFooters() : null}
                            </div>
                        </div>
                        <div className="footer-logo">
                            <img src="/assets/img/cyber-essentials-logo.png" alt="cyber essentials" />
                        </div>
                    </div>
                }
            </>
        )
    }

}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
    openedScreen: state.screen.openedScreen,
    createUserData: state.screen.createUserData,
    resourceKey: state.screen.resourceKey
});

export default connect(mapStateToProps)(withRouter(FooterComponent));