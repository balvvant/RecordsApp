const CONST_VALUES = require("../utils/Constants");
const STATUS_CODES = CONST_VALUES.STATUS_CODES;
const SINGLE_VALUE_CONST = require("../utils/SingleValueConstants");
const MY_SQL = require("../config/database/sql");
const UTILITIES = require("../utils/utilities");

async function AuthenticateUser(req, res) {
  let dataObject = {
      statusCode: STATUS_CODES.UNAUTHORIZED
  }
  dataObject = await ValidateTokenAndGetRole(dataObject, req.headers.token);
  if (dataObject.statusCode == STATUS_CODES.OK) {
      res.locals.userId = dataObject.user_id;
      res.locals.roleId = dataObject.role_id;
      res.locals.languageId = req.headers.language_id ? parseInt(req.headers.language_id.trim()) : 0;
      res.locals.featureGroupId = req.headers.feature_group_id ? parseInt(req.headers.feature_group_id.trim()) : 0;
      res.locals.groupIds = req.body.groupIds ? req.body.groupIds.trim() : "";
      if (await CheckRolesAndPermissions(res.locals.roleId, req.url)) {
        res.locals.statusCode = STATUS_CODES.OK;
      } else {
        res.locals.statusCode = STATUS_CODES.UNAUTHORIZED;
      }
  }
};

async function ValidateTokenAndGetRole(dataObject, token) {
    if(token){
        let userQuery = await MY_SQL.runQuery(`SELECT UserID, UserRole FROM users 
        WHERE UserToken = '${token}' AND UserTokenExpiry >= UTC_TIMESTAMP() AND IsActive='${CONSTANTS.Status.Active_Status}'`);
        if (userQuery && userQuery.error == 0) {
            if(userQuery.data && userQuery.data.length > 0){
                dataObject.user_id = userQuery.data[0].UserID;
                dataObject.role_id = userQuery.data[0].UserRole;    
                let myTokenExpiry= UTILITIES.AddSecondsToDate(parseInt(SINGLE_VALUE_CONST.TokenExpiryTime));    
                userQuery = await MY_SQL.runQuery(`UPDATE users SET UserTokenExpiry= ${myTokenExpiry}, ModifiedAt= UTC_TIMESTAMP(), ModifiedByID= ${dataObject.user_id}   
                WHERE UserToken = '${token}' AND UserID= ${dataObject.user_id}`);
                dataObject.statusCode = STATUS_CODES.OK;
            } else {
                dataObject.statusCode = STATUS_CODES.TOKEN_EXPIRED;    
            }
        }
    } else {
        dataObject.user_id = 0;
        dataObject.role_id = CONST_VALUES.Roles.Anonymous;
        dataObject.statusCode = STATUS_CODES.OK;
    }
    return dataObject;
}

async function CheckRolesAndPermissions(roleId, operation) {
    if (roleId > 0 && operation) {
        let roleOperationResult = await Sql.runQuery(
            `SELECT role_features.role_id 
            FROM features
            INNER JOIN role_features ON features.feature_id = role_features.feature_id
            WHERE features.component = '${operation}' AND (role_features.role_id = ${roleId} OR role_features.role_id = ${CONST_VALUES.Roles.Anonymous}) AND features.is_active = ${Status.Active_Status} AND role_features.is_active = ${Status.Active_Status}`
        );
        if (roleOperationResult && roleOperationResult.error == 0) {
            if (roleOperationResult.data && roleOperationResult.data.length > 0) {
                return true;
            }
        }
    }
    return false;
}

const RootApi = async (req, res, next) => {
  try {
      res.locals.statusCode = STATUS_CODES.OK;
      res.locals.dataObject = {};
      next();
  } catch (error) {
      Logger.servicesLogger(req, "RootApi", error.toString());
      next(error);
  }
};

const Get404ErrorFunction = (req, res, next) => {
  res
      .status(STATUS_CODES.NOT_FOUND)
      .json({
          'status': STATUS_CODES.NOT_FOUND,
          'data': null
      })
      .end();
};

const SetApiRequestFunction = async (req, res, next) => {
    res.locals.statusCode = STATUS_CODES.OK;
    if (req.url.includes("/uploads/") || req.url.includes("/contentimages/") || req.url.includes("/contentvideos/") || req.url.includes("/contentfiles/") || req.url.includes("/staticpageimages/") || req.url.includes("/organizationlogo/") || req.url.includes("/articleimages/") || req.url.includes("/websitemenuimages/")) {
        next();
    } else {
        await AuthenticateUser(req, res);
        if (res.locals.statusCode == STATUS_CODES.OK) {
            next();
        } else {
            SetApiResponseFunction(req, res, next);
        }
    }
};

const SetApiResponseFunction = (req, res, next) => {
  res.status(STATUS_CODES.OK).json({
      'status': res.locals.statusCode,
      'data': res.locals.dataObject ? res.locals.dataObject : {}
  }).end();
};

module.exports = {
  RootApi,
  Get404ErrorFunction,
  SetApiRequestFunction,
  SetApiResponseFunction
};
