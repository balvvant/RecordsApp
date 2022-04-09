import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router";
import { LeftArrow } from '../Constants/svgIcons';
import { changeBasketView, changeCategoryId, changeParentCategoryId, changeShowCategories, errorLogger, toggleMobileMenu, updateArchiveStatus, verifyRoute } from "../actions/commonActions";
import { DashboardStatus, GLOBAL_API, ROLES, ROUTE_COMPONENTS } from "../Constants/types";
import { getResourceValue } from '../Functions/CommonFunctions';

const SidebarComponent = React.memo((props) => {
    const [headerHeight, setHeaderHeight] = useState(0);
    const [subMenuOpen, setSubMenuOpen] = useState(false);
    const [menuVal, setMenuval] = useState(null);
    const [top, setTop] = useState(0);
    const [sideBarList, setSideBarList] = useState([]);
    const [languageId, setLanguageId] = useState(props.languageId);
    const [parentCatId, setParentCatId] = useState(0);
    const history = useHistory();

    useEffect(() => {
        if (props.mobileMenuOpen) {
            toggleMobileMenu();
        }
        processSidebarMenus();
    }, [props.features]);
    useEffect(() => {
        if (props.languageId !== languageId) {
            setLanguageId(props.languageId);
        }
    }, [props.languageId]);

    useEffect(() => {
        let headerHeight = document.getElementById("loggedHeader");
        if (headerHeight && window.innerWidth > 992) {
            headerHeight = headerHeight.clientHeight;
            setHeaderHeight(headerHeight);
            setTop(-window.scrollY);
        }
    }, [props.logoLoad]);

    useEffect(() => {
        processSidebarMenus();
    }, [props.showCategories]);

    useEffect(() => {
        try {
            // window.addEventListener("scroll", windowScroll);
            if (props.subMenu) {
                setSubMenuOpen(true);
            }

            return () => {
                // window.removeEventListener("scroll", windowScroll);
            };
        } catch (error) {
            let errorObject = {
                methodName: "sidebar/useEffect",
                errorStake: error.toString(),
                history: history
            };

            errorLogger(errorObject);
        }
    });

    const processSidebarMenus = () => {
        var tempSidebar = [];
        for (let val of props.features) {
            if (val.location == 'LeftMenu') {
                if(val.parent_category_id > 0) {
                    if(props.showCategories) {
                        tempSidebar.push(val);
                    }
                } else if (!props.showCategories) {
                    tempSidebar.push(val);
                }
                
            }
        }
        setSideBarList(tempSidebar);
        // changeCategoryId(0);
        changeParentCategoryId(tempSidebar && tempSidebar[0]?.parent_category_id ? tempSidebar[0].parent_category_id : 0);
    }

    const openMenu = (menu) => {
        if (menu.route_name) {
            if (menu?.is_archive) {
                updateArchiveStatus(true);
            } else {
                updateArchiveStatus(false);
                setMenuval(null);
            }
            if (menu.component == ROUTE_COMPONENTS.SEND_CONTENT) {
                changeShowCategories(true);
            }
            verifyRoute(history, menu.route_name);
        }
    };

    const checkFooterisOpen = (parentId) => {
        if(parentId){
            if(history.location.pathname !=`/dashboard` && history.location.pathname != `/send-content`) {       
                if(props.features?.findIndex(e => e.component == ROUTE_COMPONENTS.SEND_CONTENT) >= 0) {
                    verifyRoute(history,`/send-content`)
                }else {
                    verifyRoute(history,`/dashboard`)
                }
            }
        }
    }
    const changeCategories = (parentId, childId) => {
        setParentCatId(parentId);
        changeParentCategoryId(parentId);
        changeCategoryId(childId > 0 ? childId : 0);
        changeBasketView(false);
        
    }

    const OpenHomePage = () => {
        changeShowCategories(false);
        changeBasketView(false);
        verifyRoute(history, '/dashboard')
    }

    const leftMenuRow = (menu, index) => {
        return (
            <li
                key={index}
                className={`cursor ${(menu.parent_category_id > 0 && menu.parent_category_id == props.parentCategoryId) || menu.feature_id == props.featureID ? 'dropdown-wrapper active dropdown-open' : ''}  `}
            >
                <>
                    {menu.child_menus ? (
                        <div
                            data-toggle="collapse" href={`#collapseExample${menu.parent_category_id ? menu.parent_category_id : menu.feature_id}`} role="button" aria-expanded="true" aria-controls={`collapseExample${menu.parent_category_id ? menu.parent_category_id : menu.feature_id}`} className={`cursor d-flex flex-wrap align-items-center menu-inner-wrapper sideBarColBot  ${index == menuVal ? "collapsed" : 'collapse'}`}
                            onClick={() => {
                                setSubMenuOpen(!subMenuOpen);
                                setMenuval(index == menuVal ? null : index);
                            }}
                        >
                            {
                                menu.icon &&
                                <div className="sidebar-icon-wrapper">
                                    <img
                                        src={`${GLOBAL_API}/uploads/icons/${menu.icon}`}
                                        alt="icon"
                                    />
                                </div>
                            }

                            <div className="list-txt-wrapper flex-1"  >
                                {menu.label}
                                <i className="fa" aria-hidden="true"
                                    style={{ position: 'relative', left: 10 }}></i>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => { openMenu(menu); setParentCatId(menu.parent_category_id) }}
                            className="d-flex flex-wrap align-items-center menu-inner-wrapper"
                        >
                            <div className="sidebar-icon-wrapper">
                                {
                                    menu.icon &&
                                    <img
                                        src={`${GLOBAL_API}/uploads/icons/${menu.icon}`}
                                        alt="icon"
                                    />
                                }
                            </div>
                            <div className="list-txt-wrapper flex-1">
                                {menu.label}
                            </div>
                        </div>
                    )}
                </>

                {menu.child_menus &&
                    (index == menuVal || props.menu == menu.value) ? (
                    <ul className={`list-unstyled sidebar-submenu-list-wrapper w-100 collapse ${props.parentCategoryId > 0 ? "show" : ""}`} id={`collapseExample${menu.parent_category_id ? menu.parent_category_id : menu.feature_id}`}>
                        {menu.child_menus.map((subMenu, index) => {
                            return (
                                <li
                                    key={index}
                                    className={props.parentCategoryId > 0 ? props.categoryId == 0 ? `${menu.parent_category_id == props.parentCategoryId && subMenu.category_id == props.categoryId ? "active" : ""}` : `${subMenu.category_id == props.categoryId ? "active" : ""}` : `${subMenu.feature_id == props.featureID ? "active" : ""
                                }`}
                                >
                                    <div
                                        onClick={() => { openMenu(subMenu); changeCategories(menu.parent_category_id, subMenu.category_id); checkFooterisOpen(menu.parent_category_id, subMenu.category_id)  }}
                                        className={`d-flex flex-wrap align-items-center submenu-inner-wrapper `}
                                    >
                                        <div className="sidebar-icon-wrapper">
                                            {
                                                subMenu.icon &&
                                                <img
                                                    src={`${GLOBAL_API}/uploads/icons/${subMenu.icon}`}
                                                    alt="icon"
                                                />
                                            }
                                        </div>
                                        <div className="list-txt-wrapper flex-1">
                                            {subMenu.label}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
            </li>
        );
    }

    let scroll = top;
    return (
        <>
            {
                sideBarList.length > 0 ? 
                    <div className={sideBarList.length > 0 && `left-sidebar-wrapper ${props.mobileMenuOpen ? "mobile-menu-open" : ""}`} style={{ paddingTop: headerHeight, borderTop: "0px", top: scroll }}>
                        <div className="sidebar-inner-wrapper position-relative w-100">
                            <div className="cross-bar-menu d-lg-none" onClick={toggleMobileMenu}>
                                <img src="/assets/img/cross.png" alt="icon" />
                            </div>
                            <ul className="list-unstyled sidebar-list-wrapper w-100">
                                {props.showCategories && props.features?.findIndex(e => e.component == ROUTE_COMPONENTS.SEND_CONTENT) >= 0 && <div onClick={() => OpenHomePage()} className=" cursor d-flex flex-wrap align-items-center menu-inner-wrapper content-category border-bottom">
                                    <div className="list-txt-wrapper flex-1 font-18">
                                        <LeftArrow /> {getResourceValue(props.resources, 'AdminDashboard')}
                                    </div>
                                </div>}
                                {sideBarList.map((menu, index) => {
                                    if(menu.parent_category_id > 0) {
                                        if(props.showCategories) {
                                            return leftMenuRow(menu, index);
                                        }
                                    } else if (!props.showCategories) {
                                        return leftMenuRow(menu, index);
                                    }
                                })}
                            </ul>
                        </div>
                    </div>
                : null
            }
        </>
        
    );
});

const mapStateToProps = (state) => ({
    mobileMenuOpen: state.common.mobileMenuOpen,
    logoLoad: state.common.logoLoad,
    languageId: state.common.languageId,
    routes: state.common.routes,
    features: state.common.features,
    featureID: state.common.featureID,
    categoryId: state.common.categoryId,
    parentCategoryId: state.common.parentCategoryId,
    roleKey: state.common.roleKey,
    showCategories: state.common.showCategories,
});

export default connect(mapStateToProps)(SidebarComponent);
