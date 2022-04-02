import {
    AOP_LIST, CATEGORY_ID, CATEGORY_TYPE, CONTENT_BASKET, CONTENT_CATEGORY_TYPE, CONTENT_FILTER_TYPES, CONTENT_VIEW_TYPES, DASHBOARD_STATS, defaultLanguage, ENDTIME, FEATURES, FEATURE_ID, FILTER_TYPES, GLOBAL_ALERT, GLOBAL_ALERT_REMOVE, GLOBAL_LOADER, GLOBAL_RENDER, HCP_AOPS_LIST, HCP_LIST, IS_ARCHIVE, IS_CATEGORY_TYPE_SHOW, LANGUAGEID, LANGUAGELIST, LOGOLOAD, MOBILE_MENU, OPEN_COMPONENT, OPERATION_LIST, OPT_OUT_STATUS, ORGANIZATIONS_LIST, PARENT_CATEGORY_ID, PATIENT_USERS, ROLE_KEY, ROUTES, SECURITY_LIST, SHOW_BASKET, SHOW_BASKET_VIEW, SHOW_CATEGORIES, SHOW_LANGUAGE, SIDEBAR_LIST_TYPE, STARTTIME, TEXT_EDITOR_IMAGES, USER_CATEGORIES, VIEW_TYPE
} from '../Constants/types';


/**
 * routeList
 */
let routesList = localStorage.getItem('routeList');

if (routesList && routesList != "undefined") {
    routesList = JSON.parse(routesList);
} else {
    routesList = []
}

/**
 * featureList
 */
let featureList = localStorage.getItem('featureList');

if (featureList && featureList != "undefined") {
    featureList = JSON.parse(featureList);
} else {
    featureList = []
}

/**
 * showBasket
 */
let showBasket = localStorage.getItem('showBasket');

if (showBasket == 'true') {
    showBasket = true;
} else {
    showBasket = false
}

/**
* showLanguage
*/

let showLanguage = localStorage.getItem('showLanguage');

if (showLanguage == 'true') {
    showLanguage = true;
} else {
    showLanguage = false;
}

let roleKey = localStorage.getItem('roleKey');

if (roleKey) {
    roleKey = roleKey;
} else {
    roleKey = '';
}
/**
 * operationList
 */
let operationList = localStorage.getItem('operationList');

if (operationList && operationList != "undefined") {
    operationList = JSON.parse(operationList);
} else {
    operationList = []
}


/**
 * featureID
 */
let featureID = localStorage.getItem('featureId');

if (featureID) {
    featureID = +featureID;
} else {
    featureID = ''
}

/**
 * 
 */
let langId = localStorage.getItem('language_id');

if (!langId || langId == null || langId <= 0) {
    langId = defaultLanguage
    localStorage.setItem('language_id', langId);
}



/**
 * languageList
 */
let languageList = localStorage.getItem('languageList');

if (languageList && languageList != "undefined") {
    languageList = JSON.parse(languageList);
} else {
    languageList = []
}

/**
 * content basket
 */
// let contentBaskets = localStorage.getItem('content_basket');

// if (contentBaskets) {
//     contentBaskets = JSON.parse(contentBaskets);
// } else {
//     contentBaskets = []
// }

/**
 * Patient opt out status
 */
let optOut = localStorage.getItem('optOutStatus');

optOut = optOut == null ? 0 : optOut;

let isArchive = localStorage.getItem('IS_ARCHIVE');
isArchive = isArchive == 'true' ? true : false;

let categories = localStorage.getItem('categories');
if (categories) {
    categories = JSON.parse(categories);
    if (!(categories.length > 0)) {
        categories = null;
    }
} else {
    categories = null;
}

const INITIAL_STATE = {
    loader: false,
    reRender: false,
    alertArray: [],
    alertArrayLength: 0,
    securityArray: [],
    hcpArray: [],
    organizationsArray: [],
    dashboardStats: null,
    hcpList: [],
    aopList: [],
    mobileMenuOpen: true,
    userCategories: categories,
    patientUsers: null,
    currentSidebar: null,
    currentSidebarSubMenu: null,
    sidebarListType: 'a-z',
    routes: routesList,
    features: featureList,
    featureID: featureID,
    openComponent: false,
    logoLoad: false,
    startTime: null,
    endTime: null,
    languageId: langId,
    isArchive: isArchive,
    languageList: languageList,
    optOutStatus: optOut,
    categoryId: null,
    parentCategoryId: null,
    textEditorImages: [],
    isCategoryTypeShow: false,
    categoryType: CONTENT_CATEGORY_TYPE.ALL,
    contentFilterType: CONTENT_FILTER_TYPES.FOR_PATIENTS,
    contentBaskets: [],
    showBasketView: false,
    contentViewType: CONTENT_VIEW_TYPES.ORIGINAL,
    showCategories: false,
    operationList: operationList,
    showLanguage: showLanguage,
    showBasket: showBasket,
    roleKey: roleKey,
}

export default function (state = INITIAL_STATE, action) {

    switch (action.type) {
        case GLOBAL_LOADER: {
            return {
                ...state,
                loader: action.payload,
            };
        }
        case OPERATION_LIST: {
            return {
                ...state,
                operationList: action.payload,
            };
        }
        case SHOW_BASKET: {
            return {
                ...state,
                showBasket: action.payload,
            };
        }
        case SHOW_LANGUAGE: {
            return {
                ...state,
                showLanguage: action.payload,
            };
        }
        case ROLE_KEY: {
            return {
                ...state,
                roleKey: action.payload,
            };
        }
        case GLOBAL_RENDER: {
            return {
                ...state,
                reRender: action.payload,
            };
        }
        case TEXT_EDITOR_IMAGES: {
            return {
                ...state,
                textEditorImages: action.payload,
            };
        }
        case MOBILE_MENU: {
            return {
                ...state,
                mobileMenuOpen: !state.mobileMenuOpen,
            };
        }
        case OPT_OUT_STATUS: {
            return {
                ...state,
                optOutStatus: action.payload,
            };
        }
        case SHOW_CATEGORIES: {
            return {
                ...state,
                showCategories: action.payload,
            };
        }
        case SHOW_BASKET_VIEW: {
            return {
                ...state,
                showBasketView: action.payload,
            };
        }
        case VIEW_TYPE: {
            return {
                ...state,
                contentViewType: action.payload,
            };
        }
        case IS_CATEGORY_TYPE_SHOW: {
            return {
                ...state,
                isCategoryTypeShow: action.payload,
            };
        }
        case LOGOLOAD: {
            return {
                ...state,
                logoLoad: !state.logoLoad,
            };
        }
        case STARTTIME: {
            return {
                ...state,
                startTime: action.payload,
            };
        }
        case ENDTIME: {
            return {
                ...state,
                endTime: action.payload,
            };
        }
        case LANGUAGEID: {
            return {
                ...state,
                languageId: action.payload,
            };
        }
        case IS_ARCHIVE: {
            return {
                ...state,
                isArchive: action.payload,
            };
        }
        case CATEGORY_TYPE: {
            return {
                ...state,
                categoryType: action.payload,
            };
        }
        case FILTER_TYPES: {
            return {
                ...state,
                contentFilterType: action.payload,
            };
        }
        case LANGUAGELIST: {
            return {
                ...state,
                languageList: action.payload,
            };
        }
        case ROUTES: {
            return {
                ...state,
                routes: action.payload,
            }
        }
        case FEATURES: {
            return {
                ...state,
                features: action.payload,
            }
        }
        case FEATURE_ID: {
            return {
                ...state,
                featureID: action.payload,
            }
        }
        case OPEN_COMPONENT: {
            return {
                ...state,
                openComponent: action.payload,
            }
        }
        case CONTENT_BASKET: {
            return {
                ...state,
                contentBaskets: action.payload,
            }
        }
        case USER_CATEGORIES: {
            return {
                ...state,
                userCategories: action.payload,
            };
        }
        case PATIENT_USERS: {
            return {
                ...state,
                patientUsers: action.payload
            }
        }
        case PARENT_CATEGORY_ID: {
            return {
                ...state,
                parentCategoryId: action.payload,
            };
        }
        case SIDEBAR_LIST_TYPE: {
            return {
                ...state,
                sidebarListType: action.payload,
            };
        }
        case CATEGORY_ID: {
            return {
                ...state,
                categoryId: action.payload,
            };
        }

        case GLOBAL_ALERT: {
            let obj = {
                alertType: action.payload,
                alertMessage: action.msg,
            }

            return {
                ...state,
                alertArray: [obj],
            };
        }

        case SECURITY_LIST: {
            return {
                ...state,
                securityArray: [...action.payload],
            };
        }
        case HCP_AOPS_LIST: {
            return {
                ...state,
                hcpArray: [...action.payload],
            };
        }
        case HCP_LIST: {
            return {
                ...state,
                hcpList: [...action.payload],
            };
        }
        case AOP_LIST: {
            return {
                ...state,
                aopList: [...action.payload],
            };
        }
        case ORGANIZATIONS_LIST: {
            return {
                ...state,
                organizationsArray: [...action.payload],
            };
        }
        case DASHBOARD_STATS: {
            return {
                ...state,
                dashboardStats: action.payload,
            };
        }
        case GLOBAL_ALERT_REMOVE: {
            let arr = state.alertArray;
            if (arr.length) state.alertArray.shift()

            return {
                ...state,
                alertArray: [...arr]
            }
        }
        default:
            return state
    }


}