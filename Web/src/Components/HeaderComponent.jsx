import { MenuItem, Select } from '@material-ui/core';
import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { Link } from 'react-scroll';
import { changeBasketView, changeCategoryId, changeCurrentSidebarSubMenu, changeOpenComponent, changeOrgId, changeParentCategoryId, changeShowCategories, verifyRoute } from '../actions/commonActions';
import { GLOBAL_API, HEADR_MENU, PRIMARY_COLOR, PRIMARY_FONT_COLOR, ROLES, SCREENS, PATIENT_OPT_OUT_COMPONENT, CLINICIAN_SWITCH_ORGANIZATION_COMPONENT } from '../Constants/types';
import LogoutModal from '../Modals/logoutModal';
import { getResourceValue } from '../Functions/CommonFunctions';
import { BasketIcon } from "../Constants/svgIcons";
class HeaderComponent extends Component {
    constructor(props) {
        super(props);
        let token = localStorage.getItem('token');
        this.state = {
            menus: [],
            active: '',
            features: [],
            indexLink: null,
            token: token,
            // isDropdown: true
            logoutModal: false,
            basketCount: 0,
        }
    }
    componentDidMount = () => {
        var tempSidebar = []
        for (let val of this.props.features) {
            if (val.location === HEADR_MENU) {
                tempSidebar.push(val);
            }
        }
        this.setState({ menus: tempSidebar });
    }

    componentDidUpdate = () => {
        let token = localStorage.getItem("token");
        if (token !== this.state.token) {
            this.setState({ token: token })
        }
        if (this.props.features != this.state.features) {
            this.setState({ features: this.props.features }, () => this.SetupHeaderFeature());
        }
        if (this.props.contentBaskets.length != this.state.basketCount) {
            this.setState({ basketCount: this.props.contentBaskets.length });
        }
    }

    SetupHeaderFeature = () => {
        var tempSidebar = []
        for (let val of this.props.features) {
            if (val.location === HEADR_MENU) {
                tempSidebar.push(val);
            }
        }
        this.setState({ menus: tempSidebar });
    }

    handleBasketView = () => {
        if (this.props.roleKey == ROLES.ADMIN) {
            verifyRoute(this.props.history, `/send-content`);
            changeShowCategories(true);
        } else {
            verifyRoute(this.props.history, `/dashboard`);
        }
        changeParentCategoryId(null);
        changeCategoryId(null);
        changeBasketView(true);
    }

    render() {
        return (
            <>
                <div className="header-container landing-header-container" style={{ padding: this.state.token ? 0 : '' }}>
                    <div className="header-fix-strap" id="strapHeader" >
                        <nav className="navbar navbar-expand-md  navbar-light">
                            <a className="navbar-brand" herf="/">
                                <img className='cursor' src="/assets/img/logo.png" alt="logo" onClick={() => this.props.onClickLogo(false)} />
                            </a>

                            <button className="navbar-toggler nav-bar-tggl mw-100" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                                <span className="navbar-toggler-icon"></span>
                            </button>

                            <div className=" navbar-collapse" id="collapsibleNavbar">
                                <ul className="nav navbar-nav ml-auto">
                                    {this.props?.userDetail &&
                                        <div className="user-details position-relative  color-black font-16" style={{ marginRight: 10, marginLeft: 10, display: 'grid', textAlign: 'right', alignItems: 'center' }}>
                                            <span style={{ color: '#000000DE' }}>{this.props.userDetail && this.props.userDetail ? <> {this.props.userDetail.first_name} {this.props.userDetail.last_name}</> : <></>}</span>
                                        </div>
                                    }
                                    {(this.props?.showLanguage && this.props?.languageList && this.props.languageList.length > 0) &&
                                        <Select
                                            labelId="languages"
                                            id="select_languuage"
                                            value={this.props.languageId}
                                            onChange={(ev) => this.props.changeLanguage(ev.target.value)}
                                            label="Select Language"
                                            name="language"
                                            disableUnderline
                                            style={{ marginRight: 5, marginLeft: 10, position: 'relative', }}
                                        >
                                            {this.props.languageList.map((data, index) => (
                                                <MenuItem value={data.language_id} key={index}>{data.language_name}</MenuItem>
                                            ))}
                                        </Select>
                                    }
                                    {
                                        <div className=" navbar-collapse" id="collapsibleNavbar">
                                            <ul className="nav navbar-nav mr-auto">
                                                {
                                                    this.props.navigations?.length > 0 && this.props.navigations.map((header, index) => {
                                                        if (header.place_holder_value && (header.info_value || header.resource_value || (header.data && header.data.length > 0))) {
                                                            return <>
                                                                <div className="navigation" >
                                                                    <Link to={`${header.place_holder_value.toLowerCase().replace(" ", "-")}`} onClick={() => { changeOpenComponent(false); this.props.history.push('/')} } smooth={true} duration={1000} key={index} ><span className="landing-menu-text">{header.place_holder_value}</span> {header.data.length > 0 && <i className="fa fa-angle-down" aria-hidden="true"></i>}</Link>
                                                                    {
                                                                        <div className="navigation-content">
                                                                            {
                                                                                header.data.length > 0 && header.data.map((subHeader, subIndex) => {
                                                                                    if (subHeader.place_holder_value) {
                                                                                        return <Link to={`${subHeader.place_holder_value.toLowerCase().replace(" ", "-")}`} onClick={() => { changeOpenComponent(false); this.props.history.push('/') }} smooth={true} duration={1000} key={subIndex}><span className="landing-menu-text">{subHeader.place_holder_value}</span></Link>
                                                                                    }
                                                                                })
                                                                            }
                                                                        </div>

                                                                    }
                                                                </div>
                                                            </>
                                                        }
                                                    })
                                                }
                                                {!this.state.token && <a href={`#`} onClick={() => {this.props.history.push('/'); this.props.onClickLoginButton(true, null, SCREENS.LOGIN)}} className="login-button"><span className="login-button-text">{getResourceValue(this.props.resources, "LOGIN")}</span></a>}
                                            </ul>
                                        </div>
                                    }

                                    {

                                        this.state.menus.length > 0 && this.state.menus.map((header, index) => {
                                            return <>

                                                <div className={`navigation ${header?.child_menus?.length > 0 ? 'showDropDown' : ''}`}>
                                                    <Link to={`${header.route_name}`} smooth={true} duration={1000} onClick={() => changeOpenComponent(false)} key={index} >
                                                        <img
                                                            src={`${GLOBAL_API}/uploads/icons/${header.icon}`}
                                                            alt="icon"
                                                            style={{ width: 20 }}

                                                        />
                                                        <span className="landing-menu-text links-menu" >{header.label}</span> {header.label && header.child_menus && header.child_menus.length > 0 && <i className="fa fa-angle-down" aria-hidden="true"></i>}</Link>

                                                    <div className="user-profile-dropdown">
                                                        <ul className="list-unstyled profile-dropdown-list mb-0">
                                                            {
                                                                header.child_menus && header.child_menus.length > 0 && header.child_menus.map((subHeader, subIndex) => {
                                                                    return <>
                                                                        {
                                                                            subHeader.component == PATIENT_OPT_OUT_COMPONENT ? 
                                                                                this.props?.optOutStatus == 1 ? 
                                                                                null : 
                                                                                <li className="menu-list-txt">
                                                                                    <Link to={`${subHeader.route_name}`} smooth={true} duration={1000} onClick={() => { changeOpenComponent(false); verifyRoute(this.props.history, subHeader.route_name) }} key={subIndex}><span className="landing-menu-text">{subHeader.label}</span></Link>
                                                                                </li>
                                                                            : 
                                                                            subHeader.component == CLINICIAN_SWITCH_ORGANIZATION_COMPONENT ?
                                                                                this.props?.userDetail?.organizations?.length > 1 ?
                                                                                <li className="menu-list-txt">
                                                                                    <Link to={`${subHeader.route_name}`} smooth={true} duration={1000} onClick={() => { changeOpenComponent(false); verifyRoute(this.props.history, subHeader.route_name) }} key={subIndex}><span className="landing-menu-text">{subHeader.label}</span></Link>
                                                                                </li>
                                                                                : null
                                                                            :
                                                                            <li className="menu-list-txt">
                                                                                <Link to={`${subHeader.route_name}`} smooth={true} duration={1000} onClick={() => { changeOpenComponent(false); verifyRoute(this.props.history, subHeader.route_name) }} key={subIndex}><span className="landing-menu-text">{subHeader.label}</span></Link>
                                                                            </li>
                                                                            }
                                                                    </>
                                                                })
                                                            }
                                                            <li className="menu-list-txt">
                                                                <Link to={``} smooth={true} duration={1000} onClick={() => this.setState({ logoutModal: true })} ><span className="landing-menu-text">{getResourceValue(this.props.resources, "LOGOUT")}</span></Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </>

                                        })
                                    }
                                    {this.props?.showBasket && !this.props.showBasketView &&
                                        <>
                                            <div style={{ margin: '12px' }} onClick={() => this.handleBasketView()} >
                                                <BasketIcon />
                                                {this.state.basketCount > 0 &&
                                                    <div className='basket-tag cursor' >
                                                        <p className='m-0 basket-text'>{this.state.basketCount}</p>
                                                    </div>
                                                }
                                            </div>
                                        </>
                                    }

                                </ul>
                            </div>
                        </nav>
                    </div>
                </div >
                <div id="strapHeader" className="black-strap-box d-flex flex-wrap justify-content-end align-items-center px-3">
                </div>
                {this.state.logoutModal ? <LogoutModal open={this.state.logoutModal} roleType={this.props.roleType} onCloseLogoutModal={() => this.setState({ logoutModal: false })} /> : null}

            </>
        )
    }

}

const mapStateToProps = state => ({

    openedScreen: state.screen.openedScreen,
    createUserData: state.screen.createUserData,
    resourceKey: state.screen.resourceKey,
    routes: state.common.routes,
    features: state.common.features,
    languageId: state.common.languageId,
    languageList: state.common.languageList,
    optOutStatus: state.common.optOutStatus,
    showBasketView: state.common.showBasketView,
    contentBaskets: state.common.contentBaskets,
    reRender: state.common.reRender,
    showCategories: state.common.showCategories,
    showLanguage: state.common.showLanguage,
    showBasket: state.common.showBasket,
    openComponent: state.common.openComponent,
    userDetail: state.user.userDetail,
    roleKey: state.common.roleKey,
});

export default connect(mapStateToProps)(withRouter(HeaderComponent));