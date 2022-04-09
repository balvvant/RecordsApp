import Axios from "axios";
import platform from "platform";
import { changeBasketView, changeCategoryId, changeContentBasket, changeFeatureId, changeFeatures, changeOpenComponent, changeOrgId, changeParentCategoryId, changeRoleKey, changeRoutes, changeShowCategories, changeViewType, errorLogger, getTokenStatus, globalAlert, globalLoader, logoutUser, operationList, resetTokenApi, setUserDetail, showBasket, showLanguage, updateLanguageId, verifyRoute, setSsoUserDetail } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, CONTENT_VIEW_TYPES, GLOBAL_API, resourceFields, RESOURCE_KEYS, STATUS_CODES, TokenStatusValues, VALIDATION_FIELD_TYPES, CUSTOM_RESOURCES, PRIMARY_COLOR, PRIMARY_FONT_COLOR } from '../Constants/types';
import UnauthorizedError from "../Pages/UnauthorizedError";
import React from 'react'

export const logOut = async (value, link) => {

    let token = localStorage.getItem('token');
    let tokenStatus = localStorage.getItem('token_status');
    let isSSOUser = localStorage.getItem('isSSOUser');

    if (token && tokenStatus !== TokenStatusValues.EXPIRED) {
        let logoutUserResult = await logoutUser(value, link);

        if (logoutUserResult) {
            if (logoutUserResult?.data.status == STATUS_CODES.OK) {
                // globalAlert('success', global.logoutMessage);
                changeOpenComponent(false)
                setUserDetail({});
                showLanguage(false);
                showBasket(false);
            } else {
                let resources = localStorage.getItem("resources");
                if (resources) {
                    resources = JSON.parse(resources);
                    if (resources.length > 0) {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(resources, logoutUserResult.data.status.toString()))
                    }
                }
            }
        } else {
            // globalAlert('success', global.logoutMessage);
        }

        localStorage.removeItem('token');
        if (isSSOUser) {
            value.push('/sso-logout');
        }
        else {
            value.push(link);
        }
        clearStorage();

    } else {
        localStorage.removeItem('token');
        if (isSSOUser) {
            value.push('/sso-logout');
        }
        else {
            value.push(link);
        }
        clearStorage();
    }
    document.body.style.setProperty('--primary-color', PRIMARY_COLOR);
    document.body.style.setProperty('--primary-font-color', PRIMARY_FONT_COLOR);
}

export const clearSSOUser = async (value, link) => {
    let token = localStorage.getItem('token');
    let tokenStatus = localStorage.getItem('token_status');

    if (token && tokenStatus !== TokenStatusValues.EXPIRED) {
        await logoutUser(value, link);

        localStorage.removeItem('token');
        clearStorage();

    } else {
        localStorage.removeItem('token');
        clearStorage();
    }
}

export const clearStorage = () => {
    localStorage.removeItem('userDetail');
    localStorage.removeItem('orgDetail');
    localStorage.removeItem('token_status');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('persist:auth');
    localStorage.removeItem('persist:root');
    localStorage.removeItem('routeList');
    localStorage.removeItem('featureList');
    localStorage.removeItem('operationList');
    localStorage.removeItem('isSSOUser');
    localStorage.removeItem('patient_detail');
    localStorage.removeItem('language_id');
    localStorage.removeItem('token');
    localStorage.removeItem('optOutStatus');
    localStorage.removeItem('categories');
    localStorage.removeItem('org');
    localStorage.removeItem('showBasket');
    localStorage.removeItem('roleKey');
    localStorage.removeItem('featureId');
    localStorage.removeItem('showLanguage');

    changeFeatures([]);
    setUserDetail({});
    changeRoutes([]);
    changeFeatureId(null);
    changeViewType(CONTENT_VIEW_TYPES.ORIGINAL)
    changeParentCategoryId(null);
    changeCategoryId(null);
    updateLanguageId(0);
    changeBasketView(false);
    changeShowCategories(false);
    changeContentBasket([]);
    showLanguage(false);
    showBasket(false);
    changeRoleKey(null);
    operationList([]);
}

export const httpHeaderOwn = async (value, link) => {
    let token = localStorage.getItem('token');
    let language_id = localStorage.getItem('language_id');
    let featureId = localStorage.getItem('featureId');
    if (token) {
        let org = localStorage.getItem('orgDetail');
        org = JSON.parse(org);
        return {
            token: token,
            language_id: language_id,
            feature_group_id: featureId,
            device: platform.name,
            orgid: org?.organization_id
        }
    }
    else {
        return {
            language_id: language_id,
            device: platform.name,
        }
    }
}

export const validEmail = async (value) => {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!value.match(mailformat)) {
        return false
    }
    else {
        return true
    }
}

export const getResourceValue = (resourceData, key, column = '') => {
    let resultValue = "";
    let resourceKey = resourceFields.Key;

    if (column == "") {
        column = resourceFields.Value;
    }

    if (resourceData && resourceData.length > 0) {
        let keyIndex = resourceData.findIndex(e => e[resourceKey] == key);

        if (keyIndex >= 0) {
            let resource = resourceData[keyIndex];

            resultValue = resource[column] ? resource[column] : "";
        }
    }

    if(resultValue == "") {
        resultValue = CUSTOM_RESOURCES[key] ? CUSTOM_RESOURCES[key] : "";
    }

    return resultValue;
}

export const getSingleResource = (resourceData, key) => {
    let resource = {};
    let resourceKey = resourceFields.Key;
    if (resourceData && resourceData.length > 0) {
        let keyIndex = resourceData.findIndex(e => e[resourceKey] == key);
        if (keyIndex >= 0) {
            resource = resourceData[keyIndex];
        }
    }
    return resource;
}

/**
 * Get dropdown items from resources
 * @param groupId 
 * @param resources 
 * @returns dropdown item
 */
export const getDropdownValues = (groupId, resources) => {
    let dropdownValues = [];
    let groupResources = resources.filter((e) => e.group_id == groupId);
    if (groupResources && groupResources.length > 0) {
        groupResources.forEach((data) => {
            if (data.resource_key && data.resource_value) {
                let dropdown = {
                    label: data.resource_value,
                    value: data.resource_key
                };
                dropdownValues.push(dropdown);
            }
        });
    }
    return dropdownValues;
}

export const formatNHSNumber = (nhsNumber) => {
    if (nhsNumber) {
        if (nhsNumber.length > 3 && nhsNumber.length < 7) {
            return nhsNumber.slice(0, 3) + "-" + nhsNumber.slice(3, 6);
        }
        else if (nhsNumber.length >= 7) {
            return nhsNumber.slice(0, 3) + "-" + nhsNumber.slice(3, 6) + "-" + nhsNumber.slice(6, 10);
        }
        else {
            return nhsNumber;
        }
    } else {
        return null;
    }

}

/**
 * Get Language name
 * 
 * @param {*} languageId 
 * @param {*} languageList 
 */
export const getLanguageName = (languageId, languageList) => {
    let language = languageList && languageList.length > 0 && languageList.find(e => e.language_id == languageId);
    if (language) {
        return language.language_name;
    }
}

export const sessionSetup = async (data, history) => {
    let userInfo = data.userInfo;
    let routeList = userInfo.routes;
    // let featureList = userInfo.features;
    localStorage.setItem('token', userInfo.token);
    localStorage.setItem('refresh_token', userInfo.refresh_token);
    localStorage.setItem('routeList', JSON.stringify(routeList));
    // localStorage.setItem('featureList', JSON.stringify(featureList));
    localStorage.setItem('showBasket', userInfo.show_basket);
    localStorage.setItem('showLanguage', userInfo.show_languages);
    changeRoutes(routeList);
    // changeFeatures(featureList);
    showLanguage(userInfo.show_languages);
    showBasket(userInfo.show_basket);
    localStorage.setItem('userDetail', JSON.stringify(userInfo.userDetail));
    setUserDetail(userInfo.userDetail);
    localStorage.setItem('token_status', TokenStatusValues.ALIVE);
    if(userInfo.userDetail.organizations){
        if (userInfo.userDetail.organizations.length == 0) {
            logOut(history, '/')
        } else if (userInfo.userDetail.organizations.length == 1) {
            SetOrg(userInfo.userDetail.organizations[0]);
            verifyRoute(history, `/dashboard`);
        } else if (userInfo.userDetail.organizations.length > 1) {
            verifyRoute(history, `/organisations`);
        }
    } else {
        verifyRoute(history, `/dashboard`);
    }


    localStorage.removeItem('isLockout');
    localStorage.removeItem('endTime');
    globalLoader(false);
}

export const SetOrg = (organization) => {
    changeOrgId(organization);
    localStorage.setItem('orgDetail', JSON.stringify(organization));
    document.body.style.setProperty('--primary-color', organization.primary_color);
    document.body.style.setProperty('--primary-font-color', organization.primary_font_color);
}

/**
 * Common API Handler
 * 
 * @param {*} obj 
 * @returns res
 */
export const CallApiAsync = async (obj) => {
    try {
        let token = localStorage.getItem("token");
        let proceedApi = false;
        let header = {};
        if (token) {
            proceedApi = await getTokenStatus(obj.history, '/');
        }
        header = await httpHeaderOwn(obj.history, '/');
        if (proceedApi || !token) {
            return Axios.request({
                method: obj.method,
                url: `${GLOBAL_API}${obj.api}`,
                headers: { ...header, ...obj.header ? obj.header : {} },
                data: obj.method == API_METHODS.POST ? obj.body : {}
            }).then(async res => {
                if (token) {
                    if (res.data.status == STATUS_CODES.TOKEN_EXPIRED) {
                        let resetToken = await resetTokenApi(obj.history, '/');
                        if (resetToken) {
                            return await CallApiAsync(obj)
                        }
                    }
                }
                if (res.data.status == STATUS_CODES.UNAUTHORIZED) {
                    globalLoader(false);
                    //logOut(obj.history, '/');
                    obj.history.push(`/unauthorized`);
                } else {
                    return res;
                }
            }).catch(err => {
            })
        }
    } catch (error) {
        let errorObject = {
            methodName: "commonFunction/CallApiAsync",
            errorStake: error.toString(),
            history: this.props.history,
        };
        errorLogger(errorObject);
    }
}

/**
 * Validate 
 * @param {*} resourceKey 
 * @param {*} fieldValue 
 * @returns 
 */
export const ValidateField = (resources, resourceKey, fieldValue) => {
    let validateResult = {
        error: false,
        message: '',
        key: ''
    }
    let resource = getSingleResource(resources, resourceKey);
    if (resource) {
        if (resource.field_type == VALIDATION_FIELD_TYPES.TEXT) {
            return ValidateTextField( resource, fieldValue, validateResult);
        } else if (resource.field_type == VALIDATION_FIELD_TYPES.NUMERIC || resource.field_type == VALIDATION_FIELD_TYPES.INTEGER) {
            return ValidateNumberField(resource, fieldValue, validateResult);
        } else if (resource.field_type == VALIDATION_FIELD_TYPES.DATE) {
            return ValidateDateField( resource, fieldValue, validateResult);
        }
    }
    validateResult.error = true;
    return validateResult;
}

const ValidateTextField = ( resource, fieldValue, validateResult) => {
    if (fieldValue && fieldValue.trim() != "" && resource.min_length >= 0 && resource.max_length > 0) {
        if (fieldValue.length < resource.min_length || fieldValue.length > resource.max_length) {
            validateResult.error = true;
            validateResult.message = RESOURCE_KEYS.COMMON.FIELD_LIMIT;
        }
    } else if (resource.is_required) {
        validateResult.error = true;
        validateResult.message = RESOURCE_KEYS.COMMON.FIELD_REQUIRED;
    }
    validateResult.resource = resource;
    return validateResult;
}

const ValidateNumberField = (resource, fieldValue, validateResult) => {
    if (fieldValue) {
        if(isNaN(fieldValue)){
            validateResult.error = true;
            validateResult.message = RESOURCE_KEYS.COMMON.FIELD_INVALID;
        }
        else {
            if(fieldValue.toString().length < resource.min_length || fieldValue.toString().length > resource.max_length) {
                validateResult.error = true;
                validateResult.message = RESOURCE_KEYS.COMMON.FIELD_LIMIT;
            }
        }
    } else if (resource.is_required) {
        validateResult.error = true;
        validateResult.message = RESOURCE_KEYS.COMMON.FIELD_REQUIRED;
    }
    validateResult.resource = resource;
    return validateResult;
}

const ValidateDateField = ( resource, fieldValue, validateResult) => {
    if (fieldValue && new Date(fieldValue)) {
        
    } else if (resource.is_required) {
        validateResult.error = true;
        validateResult.message = RESOURCE_KEYS.COMMON.FIELD_REQUIRED
    }
    validateResult.resource = resource;
    return validateResult;
}

const AddDaysToDate = (days) => {
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result;
}

const CompareDates = (date, minDate, maxDate) => {
    return date.getTime() < minDate.getTime() || date.getTime() > maxDate.getTime();
}

export const getOrg = () => {
    let org = localStorage.getItem("orgDetail");
    if (org) {
        org = JSON.parse(org);
        SetOrg(org);
    } else {
        org = null;
    }
    return org;
}

export const CheckPermission = (operationList = [], operationKey) => {
    if (operationList && operationList.length > 0) {
        let operation = operationList.find(e => e.component == operationKey);
        if (operation) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}