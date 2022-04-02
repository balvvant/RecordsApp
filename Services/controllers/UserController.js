const COMMON_CONTROLLER = require('./CommonController');
const CONSTANTS = require("../utils/Constants");
const STATUS_CODES = CONSTANTS.STATUS_CODES;
const UTILITIES_LIB = require("../utils/utilities");
const LOGGER = require("../utils/logger");
const My_SQL = require("../config/database/sql");

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
                dataObject.users = users.data;
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
        let sqlQuery = `SELECT A.UserID, A.UserName, B.role_name, A.EmailID, A.BTCAddress, A.JabberID, A.TelegramID, 
        A.ActivationStatus, SUM(C.PaymentAmount) AS Earnings, SUM(D.PaymentAmount) AS Expenses  
        FROM users A 
            INNER JOIN roles B ON A.UserRole = B.role_id
            INNER JOIN UserPayments C ON A.UserID= C.ToUserID AND C.PaymentType = '${CONSTANTS.PaymentTypes.CREDIT}'
            INNER JOIN UserPayments D ON A.UserID= D.ToUserID AND D.PaymentType = '${CONSTANTS.PaymentTypes.DEBIT}' 
        WHERE A.UserID = ${res.locals.userId}`;
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
            dataObject.profileData= userProfile;
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

module.exports = {
    GetUsers,
    GetUserDetail,
    GetUserTransactions
};