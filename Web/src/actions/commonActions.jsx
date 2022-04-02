import {
    OPEN_COMPONENT,GLOBAL_LOADER, GLOBAL_ALERT, GLOBAL_ALERT_REMOVE, GLOBAL_API,API_METHODS, USER_DETAIL,
    OPT_OUT_STATUS, MOBILE_MENU, PARENT_CATEGORY_ID, ROUTES, CATEGORY_ID, SIDEBAR_LIST_TYPE, ORG_ID, METHODLOCATION,
    LOGOLOAD, STARTTIME, ENDTIME, LANGUAGEID, IS_ARCHIVE, LANGUAGELIST, STATUS_CODES, TokenStatusValues,
    CHANGED_SCREEN, RESET_PARAM, ACTIVATE_PARAM, CURRENT_SIDEBAR, CURRENT_SIDEBAR_SUBMENU, ROLE_KEY, RESOURCE_KEY,
    CATEGORY_TYPE, FILTER_TYPES, IS_CATEGORY_TYPE_SHOW, CONTENT_BASKET, SHOW_BASKET_VIEW, VIEW_TYPE, SHOW_CATEGORIES,
    GLOBAL_RENDER, OLD_RESOURCE_KEY, FEATURES, OPERATION_LIST, FEATURE_ID, SHOW_LANGUAGE, SHOW_BASKET,
    HEADER_CONTENT,
    OTHER_USER_DATA,
    ORGANIZATIONS_LIST
} from '../Constants/types';
import Axios from "axios";
import { httpHeaderOwn, logOut, CallApiAsync, clearStorage } from '../Functions/CommonFunctions';
import platform from "platform";


import { appstore } from '../store/index';

export const globalLoader = (value) => {

    appstore.dispatch({
        type: GLOBAL_LOADER,
        payload: value,
    })

}
export const operationList = (value) => {
    appstore.dispatch({
        type: OPERATION_LIST,
        payload: value,
    })

}

export const showLanguage = (val) => {
    appstore.dispatch({
        type: SHOW_LANGUAGE,
        payload: val,
    })
}

export const changeRoleKey = (val) => {
    localStorage.getItem('roleKey', val);
    appstore.dispatch({
        type: ROLE_KEY,
        payload: val,
    })
}

export const showBasket = (val) => {
    appstore.dispatch({
        type: SHOW_BASKET,
        payload: val,
    })
}


export const changeHeaderContent = (val) => {
    appstore.dispatch({
        type: HEADER_CONTENT,
        payload: val,
    })
}

export const teachStartTime = (val) => {

    appstore.dispatch({
        type: STARTTIME,
        payload: val,
    })

}

export const changeBasketView = (val) => {
    appstore.dispatch({
        type: SHOW_BASKET_VIEW,
        payload: val,
    })
}

export const changeShowCategories = (val) => {
    appstore.dispatch({
        type: SHOW_CATEGORIES,
        payload: val,
    })
}

export const changeViewType = (val) => {
    appstore.dispatch({
        type: VIEW_TYPE,
        payload: val,
    })
}

export const changeTheScreen = (val) => {
    appstore.dispatch({
        type: CHANGED_SCREEN,
        payload: val,
    })
}

export const changeGlobalRender = (val) => {
    appstore.dispatch({
        type: GLOBAL_RENDER,
        payload: val,
    })
}

export const changeCategoryType = (val) => {
    appstore.dispatch({
        type: CATEGORY_TYPE,
        payload: val,
    })
}

export const changeCategoryTypeShow = (val) => {
    appstore.dispatch({
        type: IS_CATEGORY_TYPE_SHOW,
        payload: val,
    })
}

export const changeFilterType = (val) => {
    appstore.dispatch({
        type: FILTER_TYPES,
        payload: val,
    })
}

export const changeResourceKey = (val) => {
    appstore.dispatch({
        type: RESOURCE_KEY,
        payload: val,
    })
}

export const changeOldResourceKey = (val) => {
    appstore.dispatch({
        type: OLD_RESOURCE_KEY,
        payload: val,
    })
}

export const changeContentBasket = (val) => {
    appstore.dispatch({
        type: CONTENT_BASKET,
        payload: val,
    });
}

export const storeResetParam = (val) => {
    appstore.dispatch({
        type: RESET_PARAM,
        payload: val,
    })
}

export const storeActivateParam = (val) => {
    appstore.dispatch({
        type: ACTIVATE_PARAM,
        payload: val,
    })
}
export const teachEndTime = (val) => {

    appstore.dispatch({
        type: ENDTIME,
        payload: val,
    })

}

export const updateLanguageId = (val) => {
    appstore.dispatch({
        type: LANGUAGEID,
        payload: val,
    });

    return true;

}

export const updateArchiveStatus = (val) => {
    appstore.dispatch({
        type: IS_ARCHIVE,
        payload: val,
    });

    return true;
}

export const updateLanguageList = (val) => {

    appstore.dispatch({
        type: LANGUAGELIST,
        payload: val,
    })

}

export const changeOrgId = (val) => {
    appstore.dispatch({
        type: ORG_ID,
        payload: val,
    })
}

export const setUserDetail = (val) => {
    appstore.dispatch(
        {
            type: USER_DETAIL,
            payload: val,
        }
    )

}
export const toggleMobileMenu = () => {

    appstore.dispatch({
        type: MOBILE_MENU,
    })

}


export const changeHeaderHeight = () => {

    appstore.dispatch({
        type: LOGOLOAD
    })

}

export const updateOptOut = (val) => {

    appstore.dispatch({
        type: OPT_OUT_STATUS,
        payload: val,
    })

}

export const changeParentCategoryId = (val) => {
    appstore.dispatch({
        type: PARENT_CATEGORY_ID,
        payload: val,
    })
}

export const changeCategoryId = (val) => {
    appstore.dispatch({
        type: CATEGORY_ID,
        payload: val,
    })
}

export const changeRoutes = (val) => {
    appstore.dispatch({
        type: ROUTES,
        payload: val,
    })
}
export const changeFeatures = (val) => {
    appstore.dispatch({
        type: FEATURES,
        payload: val,
    })
}

export const changeFeatureId = (val) => {
    appstore.dispatch({
        type: FEATURE_ID,
        payload: val,
    })
}
export const changeOpenComponent = (val) => {
    appstore.dispatch({
        type: OPEN_COMPONENT,
        payload: val,
    });

    return true;
}
export const changeCurrentSidebar = (val) => {
    appstore.dispatch({
        type: CURRENT_SIDEBAR,
        payload: val,
    })
}

export const changeSidebarListType = (val) => {
    appstore.dispatch({
        type: SIDEBAR_LIST_TYPE,
        payload: val,
    })
}

export const changeCurrentSidebarSubMenu = (val) => {

    appstore.dispatch({
        type: CURRENT_SIDEBAR_SUBMENU,
        payload: val,
    })
}
export const globalAlert = (alertType, msg) => {
    appstore.dispatch({
        type: GLOBAL_ALERT,
        payload: alertType,
        msg: msg,
    })
}

export const globalAlertRemove = () => {
    appstore.dispatch({
        type: GLOBAL_ALERT_REMOVE,

    })
}

export const otherUserData = (val) => {
    appstore.dispatch({
        type: OTHER_USER_DATA,
        payload: val,
    })
}

export const organizationsArray = (val) => {
    appstore.dispatch({
        type: ORGANIZATIONS_LIST,
        payload: val,
    })
}


export const checkRefreshTokenApi = async (value, link) => {
    try {

        let refresh_token = localStorage.getItem('refresh_token');
        return Axios.post(`${GLOBAL_API}/validate-refresh-token`, {}, {
            headers: {
                refresh_token: refresh_token,
                device: platform.name
            }
        }).then(res => {
            if (res.data.status == STATUS_CODES.OK) {
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('refresh_token', res.data.data.refresh_token);
                localStorage.setItem('token_status', TokenStatusValues.ALIVE);
                return true;
            }
            else {
                localStorage.setItem('token_status', TokenStatusValues.EXPIRED);
                logOut(value, link)
            }
        });

    } catch (error) {
        let errorObject = {
            methodName: "checkRefreshTokenApi",
            errorStake: error.toString(),
        };

        errorLogger(errorObject);
    }
}
export const errorLogger = async (obj) => {

    // system information
    let systemInfo = `${platform.os}/${platform.name}/${platform.version}`;

    // default values
    let defaultObj = {
        methodLocation: METHODLOCATION,
        systemInfo: systemInfo
    };

    // merge
    obj = { ...obj, ...defaultObj };

    // header
    let headers = {};

    let token = localStorage.getItem('token');
    if (token) {
        let device = platform.name;
        headers = { token: token, device: device };
    }
    let newObj = {
        method: API_METHODS.GET,
        history: obj.history,
        api: '/error-logger',
        body: obj,
        header: headers
    }
    return CallApiAsync(newObj).then(res => {
        // console.log(res);
        return res
    }).catch(err => {
        // console.log(err)
    })
}

/**
 * verify Routes using route name
 * 
 * @param {*} routeName 
 */
export const verifyRoute = async (history, routeName) => {
    let routes = localStorage.getItem('routeList');

    if (routes) {
        routes = JSON.parse(routes);
    } else {
        routes = [];
    }

    let index = routes.findIndex(e => e.route_name === routeName);
    changeOpenComponent(false);
    if (index >= 0) {
        let featureId = routes[index].feature_id;
        localStorage.setItem('featureId', featureId);
        changeFeatureId(featureId);
        if (routeName != '/dashboard' && routeName != '/send-content') {
            changeBasketView(false);
        }
        if (routeName == '/send-content') {
            changeShowCategories(true);
        } else {
            changeShowCategories(false);
        }
        await FetchOperationList(history);
        history.push(routeName);
    } else {
        history.push('/page-not-found');
    }
}

const FetchOperationList = async (history) => {
    try {
        let obj = {
            method: API_METHODS.GET,
            history: history,
            api: '/get-operation-list',
        }
        let recordResult = await CallApiAsync(obj);
        if (recordResult) {
            if (recordResult.data.status === 200) {
                let operation = recordResult.data?.data?.operation_list;
                if(operation && operation.length > 0){
                    localStorage.setItem('operationList', JSON.stringify(operation));
                    operationList(operation);
                }
            }
        }
    } catch (error) {
        let errorObject = {
            methodName: "SidebarComponent/FetchOperationlist",
            errorStake: error.toString(),
        };
        errorLogger(errorObject);
    }
}

/**
 * Logout user when user click on logout button
 * 
 * @param {*} value 
 * @param {*} link 
 * @returns 
 */
export const logoutUser = async (value, link) => {
    try {
        let proceedApi = await getTokenStatus(value, link);

        if (proceedApi) {
            let header = await httpHeaderOwn(value, link);
            return Axios.post(`${GLOBAL_API}/logout`, {}, {
                headers: header
            }).then(res => {
                return res
            }).catch(err => {
                // console.log(err)
            })
        }
    } catch (error) {
        let errorObject = {
            methodName: "logoutUser",
            errorStake: error.toString(),
        };

        errorLogger(errorObject);
    }
}

export const getTokenStatus = async (value, link) => {
    try {

        return new Promise(async (resolve) => {
            let tokenStatus = localStorage.getItem('token_status');
            let proceedApi = false;

            if (tokenStatus == TokenStatusValues.ALIVE) {
                proceedApi = true;
                resolve(true);
            }
            else if (tokenStatus == TokenStatusValues.USING_REFRESH_TOKEN) {

                const checkStatusTimer = setInterval(() => {
                    let tokenStatus = localStorage.getItem('token_status');

                    if (tokenStatus == TokenStatusValues.ALIVE) {
                        clearInterval(checkStatusTimer);
                        proceedApi = true;
                        resolve(true);
                    } else if (tokenStatus == TokenStatusValues.EXPIRED) {
                        clearInterval(checkStatusTimer);
                        proceedApi = false;
                        logOut(value, link);
                        resolve(false);
                    }

                }, 1000);
            }
            else {
                logOut(value, link);
                resolve(false);
            }
        });
    } catch (error) {
        let errorObject = {
            methodName: "getTokenStatus",
            errorStake: error.toString(),
        };

        errorLogger(errorObject);
    }
}

/**
 * 
 * Reset user token
 * 
 * @param {*} value 
 * @param {*} link 
 * @returns 
 */
export const resetTokenApi = async (value, link) => {
    try {

        return new Promise(async (resolve) => {
            let tokenStatus = localStorage.getItem('token_status');

            if (tokenStatus == TokenStatusValues.ALIVE) {
                localStorage.setItem('token_status', TokenStatusValues.USING_REFRESH_TOKEN);

                const result = await checkRefreshTokenApi(value, link);
                resolve(result);
            }
            else if (tokenStatus == TokenStatusValues.USING_REFRESH_TOKEN) {
                let proceedApi = await getTokenStatus(value, link);
                if (proceedApi) {
                    resolve(true);
                }
            }
            else {
                logOut(value, link);
            }
        });

    } catch (error) {
        let errorObject = {
            methodName: "resetTokenApi",
            errorStake: error.toString(),
        };

        errorLogger(errorObject);
    }
}

