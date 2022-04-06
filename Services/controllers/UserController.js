const COMMON_CONTROLLER = require('./CommonController');
const CONSTANTS = require("../utils/Constants");
const SINGLE_VALUE_CONSTANTS = require("../utils/SingleValueConstants");
const STATUS_CODES = CONSTANTS.STATUS_CODES;
const UTILITIES_LIB = require("../utils/utilities");
const LOGGER = require("../utils/logger");
const My_SQL = require("../config/database/sql");
const { UserModel } = require('../models/UserModel');
const { Roles } = require('../utils/Constants');

async function GetBuyerData(dataObject){
    let myQuery= await My_SQL.runQuery(`SELECT COUNT(RecordID) AS Records FROM UserRecords 
    WHERE ModifiedByID= ${res.locals.userID} AND RecordStatus ='${CONSTANTS.RecordStatues.SOLD}`);
    if (myQuery && myQuery.error == 0) {
        if(myQuery.data){
            //total records bought
            dataObject.Result1= myQuery.data[0].Records;
        }
        myQuery= await My_SQL.runQuery(`SELECT SUM(C.PaymentAmount) AS Earnings  
        FROM UserPayments WHERE ToUserID= ${res.locals.userId} AND PaymentType = '${CONSTANTS.PaymentTypes.CREDIT}'`);
        if (myQuery && myQuery.error == 0) {
            if(myQuery.data){
                //total Recharge or credit    
                dataObject.Result2= myQuery.data[0].Earnings;
            }
            myQuery= await My_SQL.runQuery(`SELECT SUM(C.PaymentAmount) AS Expenses  
            FROM UserPayments WHERE ToUserID= ${res.locals.userId} AND PaymentType = '${CONSTANTS.PaymentTypes.DEBIT}'`);
            if (myQuery && myQuery.error == 0) {
                if(myQuery.data){
                    //total expenses or debit    
                    dataObject.Result3= myQuery.data[0].Expenses;
                    //total available balance
                    dataObject.Result4= dataObject.Result2- dataObject.Result3 ;
                }
                dataObject.statusCode= STATUS_CODES.OK;
            }  
        }    
    }
    return dataObject;
} 

async function GetSellerData(dataObject){
    let myQuery= await My_SQL.runQuery(`SELECT COUNT(RecordID) AS Records FROM UserRecords 
            WHERE CreatedByID= ${res.locals.userID}`);
    if (myQuery && myQuery.error == 0) {
        if(myQuery.data){
            //total records uploaded
            dataObject.Result1= myQuery.data[0].Records;
        }
        myQuery= await My_SQL.runQuery(`SELECT COUNT(RecordID) AS Records FROM UserRecords 
            WHERE CreatedByID= ${res.locals.userID} AND RecordStatus ='${CONSTANTS.RecordStatues.SOLD}`);
        if (myQuery && myQuery.error == 0) {
            if(myQuery.data){
                //total records Sold
                dataObject.Result2= myQuery.data[0].Records;
            }    
            myQuery= await My_SQL.runQuery(`SELECT SUM(C.PaymentAmount) AS Earnings  
            FROM UserPayments WHERE ToUserID= ${res.locals.userId} AND PaymentType = '${CONSTANTS.PaymentTypes.CREDIT}'`);
            if (myQuery && myQuery.error == 0) {
                if(myQuery.data){
                    //total earnings or credit    
                    dataObject.Result3= myQuery.data[0].Earnings;
                }
                myQuery= await My_SQL.runQuery(`SELECT SUM(C.PaymentAmount) AS Expenses  
                FROM UserPayments WHERE ToUserID= ${res.locals.userId} AND PaymentType = '${CONSTANTS.PaymentTypes.DEBIT}'`);
                if (myQuery && myQuery.error == 0) {
                    if(myQuery.data){
                        //total expenses or debit    
                        dataObject.Result4= myQuery.data[0].Expenses;
                        //total available balance
                        dataObject.Result5= dataObject.Result3- dataObject.Result2;
                    }
                    dataObject.statusCode= STATUS_CODES.OK;
                }  
            }
        }    
    }
    return dataObject;
} 

async function GetAdminData(dataObject){
    let myQuery= await My_SQL.runQuery(`SELECT COUNT(UserID) AS Records FROM Users 
            WHERE UserRole= ${CONSTANTS.roleId.Buyer} AND IsActive = ${CONSTANTS.Status.Active_Status}`);
    if (myQuery && myQuery.error == 0) {
        if(myQuery.data){
            //total buyers
            dataObject.Result1= myQuery.data[0].Records;
        }
        myQuery= await My_SQL.runQuery(`SELECT COUNT(UserID) AS Records FROM Users 
            WHERE UserRole= ${CONSTANTS.roleId.Seller} AND IsActive = ${CONSTANTS.Status.Active_Status}`);
        if (myQuery && myQuery.error == 0) {
            if(myQuery.data){
                //Total sellers
                dataObject.Result2= myQuery.data[0].Records;
            }    
            myQuery= await My_SQL.runQuery(`SELECT SUM(C.PaymentAmount) AS Earnings  
            FROM UserPayments WHERE ToUserID= ${SINGLE_VALUE_CONSTANTS.RootUserId} AND PaymentType = '${CONSTANTS.PaymentTypes.CREDIT}'`);
            if (myQuery && myQuery.error == 0) {
                if(myQuery.data){
                    //total earnings or credit    
                    dataObject.Result3= myQuery.data[0].Earnings;
                } 
            }
        }    
    }
    return dataObject;
} 

const GetUsers = async(req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        let langId = req.headers.language_id;
        let groupIds = req.body.groupIds;
        let users = await My_SQL.runQuery(`SELECT A.UserID, A.UserName, B.role_name, A.EmailID, A.BTCAddress, A.JabberID, A.TelegramID, 
                A.ActivationStatus, SUM(C.PaymentAmount) AS Earnings, SUM(D.PaymentAmount) AS Expenses  
                FROM users A 
                    INNER JOIN roles B ON A.UserRole = B.role_id
                    INNER JOIN UserPayments C ON A.UserID= C.ToUserID AND C.PaymentType = '${CONSTANTS.PaymentTypes.CREDIT}'
                    INNER JOIN UserPayments D ON A.UserID= D.ToUserID AND D.PaymentType = '${CONSTANTS.PaymentTypes.DEBIT}' 
                GROUP BY A.UserID
                ORDER BY A.UserID`);
        if (users && users.error == 0) {
            if(users.data && users.data.length>0){
                for (let user of users.data) {
                    user.UserName= await UTILITIES_LIB.decrypt(user.UserName);
                    user.BTCAddress= user.BTCAddress ? await UTILITIES_LIB.decrypt(user.BTCAddress) : "";
                    user.EmailID= user.EmailID ? await UTILITIES_LIB.decrypt(user.EmailID) : "";    
                    user.EmailID= user.JabberID ? await UTILITIES_LIB.decrypt(user.JabberID) : "";
                    user.EmailID= user.TelegramID ? await UTILITIES_LIB.decrypt(user.TelegramID) : "";
                }
                dataObject.Users = users.data;
                dataObject.totalCount= users.data.length;
            }
            dataObject.statusCode = STATUS_CODES.OK;
            if (groupIds) {
                let resources = await COMMON_CONTROLLER.getResources(langId, groupIds);
                dataObject.statusCode = resources.statusCode;
                if (dataObject.statusCode == STATUS_CODES.OK) {
                    dataObject.PageResources = resources.resources;
                }
            }
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "getUsers", error.toString());
        next(error);
    }
};

const GetUserDetail = async(req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        };
        let userId = req.body.userid;
        if(userId){
            userId= res.locals.userId;
        }
        let sqlQuery = `SELECT A.UserID, A.UserName, B.role_name, A.EmailID, A.BTCAddress, A.JabberID, A.TelegramID, 
        A.ActivationStatus, SUM(C.PaymentAmount) AS Earnings, SUM(D.PaymentAmount) AS Expenses  
        FROM users A 
            INNER JOIN roles B ON A.UserRole = B.role_id
            INNER JOIN UserPayments C ON A.UserID= C.ToUserID AND C.PaymentType = '${CONSTANTS.PaymentTypes.CREDIT}'
            INNER JOIN UserPayments D ON A.UserID= D.ToUserID AND D.PaymentType = '${CONSTANTS.PaymentTypes.DEBIT}' 
        WHERE A.UserID = ${userId}`;
        let queryResult = await My_SQL.runQuery(sqlQuery);
        if (queryResult && queryResult.error == 0) {
            if(queryResult.data && queryResult.data.length>0){
                let userProfile = queryResult.data[0];
                userProfile.UserName = userProfile.UserName? await UTILITIES_LIB.decrypt(userProfile.UserName): "";
                userProfile.BTCAddress = userProfile.BTCAddress? await UTILITIES_LIB.decrypt(userProfile.BTCAddress): "";
                userProfile.EmailID = userProfile.EmailID? await UTILITIES_LIB.decrypt(userProfile.EmailID): "";
                userProfile.JabberID = userProfile.JabberID? await UTILITIES_LIB.decrypt(userProfile.JabberID): "";
                userProfile.TelegramID = userProfile.TelegramID? await UTILITIES_LIB.decrypt(userProfile.TelegramID): "";
            }
            dataObject.statusCode= STATUS_CODES.OK;
            dataObject.ProfileData= userProfile;
        }
        if (res.locals.groupIds) {
            let resources = await COMMON_CONTROLLER.getResources(res.locals.languageId, res.locals.groupIds);
            dataObject.statusCode= resources.statusCode;
            if (resources.statusCode == STATUS_CODES.OK) {
                dataObject.PageResources = resources.resources;
            }
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "getUserDetail", error.toString());
        next(error);
    }
};

const SaveUserDetail = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_SAVE_ERROR
        }
        let userData = {
            userId: userID,
            EMAIL_ID: req.body.EMAIL_ID? req.body.EMAIL_ID.trim(): "",
            BTC_ADDRESS : req.body.BTC_ADDRESS? req.body.BTC_ADDRESS.trim(): "",
            JABBER_ID : req.body.JABBER_ID? req.body.JABBER_ID.trim(): "",
            TELEGRAM_ID : req.body.TELEGRAM_ID? req.body.TELEGRAM_ID.trim(): "",
        };
        let groupIds = `${CONSTANTS.ResourceGroups.USER_PROFILE}`;
        if(await COMMON_CONTROLLER.ValidateDataAsync(userData, UserModel.UserModel, groupIds)) {
            let sqlQuery = `UPDAE Users
                            SET EmailID= '${userData.EMAIL_ID}', BTCAddress ='${userData.BTC_ADDRESS}', JabberID= '${userData.JABBER_ID}', TelegramID ='${userData.TELEGRAM_ID}', ModifiedAt= UTC_TIMESTAMP(), ModifiedByID= ${res.locals.userId}
                            WHERE UserID= ${userData.userId}`;
            let queryResult = await DB_SQL.runQuery(sqlQuery);
            if (queryResult && queryResult.error == 0) {
                dataObject.statusCode = HTTP_STATUS.OK;
            } 
        } else {
            dataObject.statusCode = HTTP_STATUS.VALIDATION_ERROR;
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "SaveUserDetail", error.toString());
        next(error);
    }
};

const GetUserTransactions = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        let userQuery = await DB_SQL.runQuery(`SELECT A.PaymentAmount, A.PaymentType, A.CreatedAt, B.TransactionType  
            FROM UserPayments A INNER JOIN UserTransactions B ON A.TransactionID= B.TransactionID
            WHERE A.ToUserID = ${res.locals.userId}`);
        if (userQuery && userQuery.error == 0) {
            if (userQuery.data && userQuery.data.length > 0) {
                let totalCreditAmount= 0;
                let totalDebitAmount= 0;
                for(record in userQuery.data){
                    if(record.PaymentType == CONSTANTS.PaymentTypes.CREDIT){
                        totalCreditAmount = totalCreditAmount + record.PaymentAmount;        
                    } else {
                        totalDebitAmount = totalDebitAmount + record.PaymentAmount;        
                    }   
                }
                dataObject.UserTransactions = userQuery.data;
                dataObject.TotalCreditAmount = totalCreditAmount;
                dataObject.TotalDebitAmount = totalDebitAmount;
                dataObject.BalanceAmount = totalCreditAmount - totalDebitAmount;
            }
            dataObject.statusCode = STATUS_CODES.OK; 
        }
        if (res.locals.groupIds) {
            let resources = await COMMON_CONTROLLER.getResources(res.locals.languageId, res.locals.groupIds);
            dataObject.statusCode = resources.statusCode;
            if (dataObject.statusCode == STATUS_CODES.OK) {
                dataObject.PageResources = resources.resources;
            }
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "GetUserTransactions", error.toString());
        next(error);
    }
};

const GetUserDashboard = async(req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        if(res.locals.roleId === Roles.SuperAdmin){
            dataObject= await GetAdminData(dataObject);
        } else if(res.locals.roleId == Roles.Buyer){
            dataObject= await GetBuyerData(dataObject);
        } else if(res.locals.roleId == Roles.Seller){
            dataObject= await GetSellerData(dataObject);
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "GetUserDashboard", error.toString());
        next(error);
    }
};

module.exports = {
    GetUsers,
    GetUserDetail,
    SaveUserDetail,
    GetUserTransactions,
    GetUserDashboard
};