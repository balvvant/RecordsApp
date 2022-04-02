import { MenuItem, Select } from '@material-ui/core';
import React, { Component } from 'react';
import { connect } from "react-redux";
import { Link, withRouter } from 'react-router-dom';
import { changeBasketView, changeCategoryId, changeParentCategoryId, changeShowCategories, updateLanguageId, verifyRoute } from '../actions/commonActions';
import { OptOutStatus } from "../Constants/types";
import { getResourceValue } from '../Functions/CommonFunctions';
import { BasketIcon } from "../Constants/svgIcons";

class LanguageComponent extends Component {
    constructor(props) {
        super(props);

        let roles = localStorage.getItem('roles');

        if (roles) {
            roles = JSON.parse(localStorage.getItem('roles'));
        }

        const userRole = localStorage.getItem('userRole');

        let user = localStorage.getItem('userDetail');

        let multiple = false;
        if (user) {
            user = JSON.parse(user);
            multiple = user.multiple_organizations;
        } else {
            multiple = false;
        }

        this.state = {
            userRole: userRole,
            roles: roles,
            optOut: props.optOutStatus,
            multiple: multiple,
            basketCount: 0,
        };
    }

    componentDidUpdate = () => {
        if (this.props.optOutStatus != this.state.optOut) {
            this.setState({ optOut: this.props.optOutStatus });
        }
        if (this.props.contentBaskets.length != this.state.basketCount) {
            this.setState({ basketCount: this.props.contentBaskets.length });
        }
    }

    changeLanguage = (languageId) => {

        localStorage.setItem('language_id', languageId);
        updateLanguageId(languageId);
    }
    toggleDropdown = () => {
        this.setState(prevProps => {
            return {
                openProfileDropdown: !prevProps.openProfileDropdown
            }
        })
    }

    handleBasketView = () => {
        if(this.state.userRole == this.state.roles.Clinician){
            verifyRoute(this.props.history, `/dashboard`);
        } else if (this.state.userRole == this.state.roles.Admin){
            verifyRoute(this.props.history, `/send-content`);
            changeShowCategories(true);
        }
        changeParentCategoryId(null);
        changeCategoryId(null);
        changeBasketView(true);
    }

    render() {

        return (
            <>
                {

                    <div style={{ display: 'flex', listStyle: 'none', }}>
                        {this.state.userRole && this.props.userDetail &&
                            <>
                                <div className="user-details position-relative  color-black font-16" style={{ marginRight: 10, marginLeft: 10, display: 'grid', textAlign: 'right', alignItems: 'center' }}>
                                    <span style={{ color: '#000000DE' }}>{this.props.userDetail && this.props.userDetail ? <> {this.props.userDetail.first_name} {this.props.userDetail.last_name}</> : <></>}</span>
                                    {/* <span style={{color:'#000000DE',fontSize:10}}>{this.state.userRole ? <> {this.state.userRole.replace('_',' ')}</> : <></>}</span> */}
                                </div>
                                {(this.state.userRole === this.state.roles.Patient && this.props.languageList.length > 0) &&
                                    <Select
                                        labelId="languages"
                                        id="select_languuage"
                                        value={this.props.languageId}
                                        onChange={(ev) => this.changeLanguage(ev.target.value)}
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
                                <div className="user-details position-relative cursor color-black font-16" style={{ paddingTop: 15, paddingBottom: 15, marginRight: 10, marginLeft: 10 }}>
                                    <div onClick={this.toggleDropdown}>
                                        <img src="/assets/img/setting.png" style={{ width: 20, height: 20 }} />
                                    </div>
                                    {this.state.openProfileDropdown ?
                                        <div className="user-profile-dropdown">
                                            <ul className="list-unstyled profile-dropdown-list mb-0">
                                                <li onClick={() =>  verifyRoute(this.props.history, `/change-password`)}>
                                                    <span className="menu-list-txt">{getResourceValue(this.props.resources, "CHANGE_PASSWORD")}</span>
                                                </li>
                                                <li onClick={() => verifyRoute(this.props.history, `/manage-profile`)}>
                                                   <span className="menu-list-txt">{getResourceValue(this.props.resources, "ManageProfile")}</span>
                                                </li>

                                                {this.state.userRole === this.state.roles.Clinician && <li onClick={() => verifyRoute(this.props.history, `/change-email`)}>
                                                    <span className="menu-list-txt">{getResourceValue(this.props.resources, "EmailMessage")}</span>
                                                </li>}

                                                {this.state.userRole == this.state.roles.Patient && this.state.optOut == OptOutStatus.NotOptOut ?
                                                    <li onClick={() => verifyRoute(this.props.history, `/delete-account`)}>
                                                        <span className="menu-list-txt">{getResourceValue(this.props.resources, "OPT_OUT")}</span>
                                                    </li> : null}

                                                {this.state.userRole == this.state.roles.Clinician ?
                                                    <li onClick={() => verifyRoute(this.props.history, `/delete-account`)}>
                                                        <span className="menu-list-txt">{getResourceValue(this.props.resources, "DeleteAccount")}</span>
                                                    </li> : null}

                                                {(this.state.userRole == this.state.roles.Clinician && this.state.multiple) ?
                                                    <li onClick={() => verifyRoute(this.props.history, "/organisations")}>
                                                        <span className="menu-list-txt">{getResourceValue(this.props.resources, 'SwitchOrganization')}</span>
                                                    </li> : null}

                                                {(!this.props.isSSOUser && this.state.userRole === this.state.roles.Clinician) &&
                                                    <li onClick={() => verifyRoute(this.props.history, "/ssolink")}>
                                                        <span className="menu-list-txt">{getResourceValue(this.props.resources, "SSOLink")} </span>
                                                    </li>
                                                }

                                                <li onClick={() => verifyRoute(this.props.history, `/support`)}>
                                                    <span className="menu-list-txt">{getResourceValue(this.props.resources, "Support")}</span>
                                                </li>
                                                {this.state.userRole === this.state.roles.Super_admin ?
                                                    <>
                                                        <li>
                                                            <Link to={`/configuration`}><span className="menu-list-txt">{getResourceValue(this.props.resources, "AdminConfiguration")}</span></Link>
                                                        </li>
                                                        <li>
                                                            <Link to={`/create-article`}><span className="menu-list-txt">{getResourceValue(this.props.resources, "CreateArticles")}</span></Link>
                                                        </li>
                                                        <li>
                                                            <Link to={`/website-menu`}><span className="menu-list-txt">{getResourceValue(this.props.resources, "WebsiteMenus")}</span></Link>
                                                        </li>
                                                    </> : null}

                                                <li className="logout cursor" onClick={this.props.openLogoutModal}>
                                                    <span className="menu-list-txt" >{getResourceValue(this.props.resources, "LOGOUT")}</span>
                                                </li>
                                            </ul>
                                        </div> : null}
                                </div>
                            </>
                        }

                        {(this.state.userRole === this.state.roles.Clinician || this.state.userRole === this.state.roles.Admin) && <div className='cursor' onClick={() => this.handleBasketView()} style={{ paddingTop: 15, paddingBottom: 15, marginLeft: 10 }} >
                            {!this.props.showBasketView &&
                                <>
                                    <BasketIcon />
                                    {this.state.basketCount > 0 &&
                                        <div className='basket-tag' >
                                            <p className='m-0 basket-text'>{this.state.basketCount}</p>
                                        </div>
                                    }
                                </>
                            }
                        </div>}
                    </div>

                }
            </>
        )
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
    languageList: state.common.languageList,
    optOutStatus: state.common.optOutStatus,
    showBasketView: state.common.showBasketView,
    contentBaskets: state.common.contentBaskets,
    reRender: state.common.reRender,
    showCategories: state.common.showCategories,
});

export default connect(mapStateToProps)(withRouter(LanguageComponent));