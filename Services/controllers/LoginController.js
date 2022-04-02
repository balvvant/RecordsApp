const CONST_VALUES = require("../utils/Constants");
const STATUS_CODES = CONST_VALUES.STATUS_CODES;
const SINGLE_VALUE_CONSTATNS = require("../utils/SingleValueConstants");
const LOGGER = require("../utils/logger");
const MY_SQL = require("../config/database/sql");
const UTILITIES = require("../utils/utilities");
const MENU_CONTROLLER = require('./MenuController');
const COMMON_FUNCTIONS = require('../functions/CommonFunctions');

const LogIn = async (req, res, next) => {
  try {
    let dataObject = {
      statusCode: STATUS_CODES.INVALID_CREDENTIAL
    }
    let validate = true;
    let username = req.body.username ? await UTILITIES.encrypt(req.body.username.trim()) : "";
    let password = req.body.password ? await UTILITIES.encrypt(req.body.password.trim()) : "";
    if (!username) {
      validate = false;
    } 
    if (!password) {
      validate = false;
    }
    if (validate) {
      let returnResult = await MY_SQL.runQuery(`SELECT UserID, ActivationStatus, UserRole, UserName 
              FROM users 
              WHERE UserName = '${username}' AND AccountPassword= '${password} AND IsActive= ${CONST_VALUES.Status.Active_Status}`);
      if(returnResult && returnResult.error == 0){
        if (returnResult.data && returnResult.data.length > 0) {
          let userRecord = returnResult.data[0];
          if((userRecord.UserRole== CONST_VALUES.Roles.Buyer || userRecord.UserRole== CONST_VALUES.Roles.Seller)  && (userRecord.ActivationStatus
                    == CONST_VALUES.UserActivationStatuses.OPEN)){
            dataObject.statusCode= STATUS_CODES.REGISTRATION_FEE;
          } else {
            dataObject = await GenerateAndUpdateUserToken(dataObject, userRecord.UserRole);    
            if(dataObject.token) { 
              //we need to also pass the dataObjct in below method and change it accordingly.
              dataObject = await MENU_CONTROLLER.GetFeatureMenusAndRoutes(dataObject, userRecord.UserRole, res.locals.languageId);  
              if (dataObject.statusCode == STATUS_CODES.OK) {
                dataObject.userInfo = {
                  user_profile_exist: userProfileExist,
                  token: tokenResult.token,
                  show_languages: true,
                  show_basket: res.locals.roleId == CONST_VALUES.Roles.Buyer ? true : false,
                  userName: await UTILITIES.decrypt(userRecord.UserName),
                  organization_id: 1,
                  name: await UTILITIES.decrypt(SINGLE_VALUE_CONSTATNS.OrganisationName),
                  brand_logo: await UTILITIES.decrypt(SINGLE_VALUE_CONSTATNS.LogoName),
                  copyright_text: await UTILITIES.decrypt(SINGLE_VALUE_CONSTATNS.CopyrightText),
                  primary_color: await UTILITIES.decrypt(SINGLE_VALUE_CONSTATNS.PrimaryColor),
                  primary_font_color: await UTILITIES.decrypt(SINGLE_VALUE_CONSTATNS.PrimaryFontColor)
                };
              }
            } else {
              dataObject.statusCode= STATUS_CODES.UNAUTHORIZED;
            }
          }
        }
      }
    } else{
      dataObject.statusCode= STATUS_CODES.VALIDATION_ERROR;
    }
    res.locals.statusCode = dataObject.statusCode;
    res.locals.dataObject = dataObject;
    next();
  } catch (error) {
    LOGGER.servicesLogger(req, "LogIn", error.toString());
    next(error);
  }
};

const ChangePassword = async (req, res, next) => {
  try {
    let dataObject = {
      statusCode: STATUS_CODES.VALIDATION_ERROR
    }
      let userId = res.locals.userId;
      let current_password = req.body.current_password ? req.body.current_password.trim() : "";
      let new_password = req.body.new_password ? req.body.new_password.trim() : "";
      let validate = true;
      let ResourceKeys = await COMMON_FUNCTIONS.getResourcesKeys(`${ResourceGroups.LOGIN}`);
      let passwordResource = await COMMON_FUNCTIONS.getSingleResourceFromResources('PASSWORD', ResourceKeys);
      if (!current_password) {
          validate = false;
      } else if (!await Validation.textValidation(current_password, passwordResource.min_length, passwordResource.max_length)) {
          validate = false;
      } else if (!await Validation.passwordValidation(current_password)) {
          validate = false;
      }
      if (!new_password) {
          validate = false;
      } else if (!await Validation.textValidation(new_password, passwordResource.min_length, passwordResource.max_length)) {
          validate = false;
      } else if (!await Validation.passwordValidation(new_password)) {
          validate = false;
      }
      if (current_password == new_password) {
        validate = false;
      }
      if (validate) {
        if (current_password && new_password) {
          let userQuery = await Sql.runQuery(`SELECT password FROM Users WHERE user_id = ${userId} AND Password= ${current_password} AND IsActive= ${CONST_VALUES.Status.Active_Status}`);
          if (userQuery.error == 0 && userQuery.data.length > 0) {
              let updatePassQuery = await Sql.runQuery(`UPDATE users SET last_password = '${user.password}', password = '${hashedPassword}', updated_at = UTC_TIMESTAMP(), updated_by_id = ${userId} ${activationUpdateQuery} WHERE user_id = ${userId}`);
              if (updatePassQuery && updatePassQuery.error == 0) {
                dataObject.statusCode = STATUS_CODES.OK;
              } else {
                dataObject.statusCode = STATUS_CODES.DATA_SAVE_ERROR;
              }
          } else {
              dataObject.statusCode = STATUS_CODES.UNAUTHORIZED;
          }
        } 
      }else {
        dataObject.statusCode = STATUS_CODES.VALIDATION_ERROR;
      }
      res.locals.statusCode = dataObject.statusCode;
      res.locals.dataObject = dataObject;
      next();
  } catch (error) {
      Logger.servicesLogger(req, "ChangePassword", error.toString());
      next(error);
  }
};

const LogOut = async (req, res, next) => {
  try {
    let dataObject = {
      statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
    }
    let deactivateQueryResult = await sql.runQuery(`UPDATE users SET UserToken = '', UserTokenExpiry= UTC_TIMESTAMP(), ModifiedAt = UTC_TIMESTAMP(), ModifiedByID = ${res.locals.userId} WHERE UserToken= '${req.headers.token}' AND is_active = ${CONST_VALUES.Status.Active_Status}`);
    if (deactivateQueryResult && deactivateQueryResult.error == 0) {
        dataObject.statusCode = STATUS_CODES.OK;
    }
    res.locals.statusCode = dataObject.statusCode;
    res.locals.dataObject = dataObject;
    next();
  } catch (error) {
    LOGGER.servicesLogger(req, "LogOut", error.toString());
    next(error);
  }
};

const DeactivateUserSessions = async(user_id) => {
  let dataObject = {
    statusCode: STATUS_CODES.DATA_SAVE_ERROR
  }
  let deactivateQueryResult = await MY_SQL.runQuery(`UPDATE users SET UserToken = '', ModifiedAt = UTC_TIMESTAMP(), ModifiedByID = ${user_id} WHERE UserID = ${user_id}`);
  if (deactivateQueryResult && deactivateQueryResult.error == 0) {
    dataObject.statusCode = STATUS_CODES.OK;
  }
  return dataObject;
}

async function GenerateAndUpdateUserToken(dataObject, user_id){
  let myToken= UTILITIES.GenerateToken();
  let tokenExpiryInterval = SINGLE_VALUE_CONSTATNS.TokenExpiryTime;
  let myTokenExpiry = UTILITIES.AddSecondsToDate(parseInt(tokenExpiryInterval));        
  let queryResult = await sql.runQuery(`UPDATE Users SET UserToken = '${myToken}', UserTokenExpiry= ${myTokenExpiry}, 
    updated_at = UTC_TIMESTAMP(), updated_by_id = ${user_id} WHERE user_id = ${user_id}`);
  if (queryResult && queryResult.error== 0) {
      dataObject.token = myToken;
  }
  return dataObject;
}

module.exports = {
  LogIn,
  ChangePassword,
  DeactivateUserSessions,
  LogOut
};