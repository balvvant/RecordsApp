const CONSTANTS = require("../utils/constants");
const STATUS_CODES = CONSTANTS.STATUS_CODES;
const SINGLE_VALUE_CONSTANTS = require("../utils/SingleValueConstants");
const DB_SQL = require("../config/database/sql");
const COMMON_CONTROLLER = require('./CommonController');
const UUID = require("uuid");
const LOGGER = require("./../utils/logger");
const MASKING = require("./../utils/masking");
const RecordModel = require("../models/RecordModel");

async function RetriveRecords(dataObject, whereCondition, recordsForBuying, viewRecords, viewPage, langId, groupIds){
    let userQuery = await DB_SQL.runQuery(
        `SELECT RecordID, RecordBin, RecordType, RecordSubType, RecordExpiry, RecordOwnerName, RecordCountry, RecordState, RecordCity, RecordZip,
        RecordFullName, RecordPhoneNo, RecordBase, RecordPrice  
        FROM UserRecords 
        WHERE ${whereCondition} 
        ORDER BY CreatedAt DESC
        LIMIT ${viewRecords} OFFSET ${viewRecords * (viewPage - 1)}`
    );
    if (userQuery && userQuery.error == 0) {
        if (userQuery.data && userQuery.data.length > 0) {
            for (let record of userQuery.data) {
                //decrypted data
                record.RecordBin = await Utilities.decrypt(record.RecordBin);
                record.RecordExpiry = await Utilities.decrypt(record.RecordExpiry);
                record.RecordOwnerName = await Utilities.decrypt(record.RecordOwnerName);
                record.RecordFullName = await Utilities.decrypt(record.RecordFullName);
                record.RecordPhoneNo = await Utilities.decrypt(record.RecordPhoneNo);
                record.RecordBase = await Utilities.decrypt(record.RecordBase);
                if(recordsForBuying){
                    //write masking code here
                    record.RecordBin = await MASKING.BinMasking(record.RecordBin);
                    record.RecordExpiry = await MASKING.ExpiryMasking(record.RecordExpiry);
                    record.RecordOwnerName = await MASKING.OwnerNameMasking(record.RecordOwnerName);
                    record.RecordFullName = await MASKING.FullNameMasking(record.RecordFullName);
                    record.RecordPhoneNo = await MASKING.PhoneNoMasking(record.RecordPhoneNo);
                    record.RecordBase = await MASKING.BaseMasking(record.RecordBase);    
                }
            }
            //get total records count
            let countResult = await DB_SQL.runQuery(`SELECT COUNT(RecordID) AS total_count FROM UserRecords WHERE ${whereCondition}`);
            if (countResult && countResult.error == 0) {
                if(countResult.data && countResult.data.length>0){
                    dataObject.totalCount = countResult.data[0].total_count;
                    dataObject.UserRecords = userQuery.data;
                    dataObject.statusCode = STATUS_CODES.OK;
                }
            } 
        }
        if (groupIds) {
            let resources = await COMMON_CONTROLLER.getResources(langId, groupIds);
            dataObject.statusCode= resources.statusCode;
            if (resources.statusCode == HTTP_STATUS.OK) {
                dataObject.PageResources = resources.resources;
            }
        }
    } 
    return dataObject;
}

async function GetUserAmountPayable(cartRecordsDetails, buyerID){
    let userRecords = [];
    let objIndex= -1;
    let totalTransactionCharges= 0;
    let recordPrice= 0;
    let recordTransactionChanrges= 0;
    for (let recordObject of cartRecordsDetails) {
        recordTransactionChanrges= recordObject.Price * SINGLE_VALUE_CONSTANTS.TransactionChargesPercent;
        //total transacation charges till time
        totalTransactionCharges = totalTransactionCharges + recordTransactionChanrges;
        //final record price payable
        recordPrice = recordObject.Price - recordTransactionChanrges;
        //Find index of specific object using findIndex method.    
        objIndex = userRecords.findIndex((obj => obj.UserID == recordObject.AddedByUserID));
        if(objIndex == -1){
            //no match found
            userRecords.push({
                UserID: recordObject.AddedByUserID,
                TotalAmount: recordPrice
            });
        } else {
            //match found
            userRecords[objIndex].TotalAmount = userRecords[objIndex].TotalAmount + recordPrice; 
        }
    }
    return { 'priceRecords': userRecords, 'transactionCharges': totalTransactionCharges };
};

async function UpdatePaymentsInfo(myData, buyerID){
    let transacationID= UUID.v4();
    let queryResult = await DB_SQL.runQuery(`INSERT INTO UserTransacations (TransacationID, FromUserID, TransacationType,
         TransacationAmount) VALUE ('${transacationID}', ${buyerID}, '${CONSTANTS.TransactionTypes.BUYINGFEE}', ${myData.totalPrice}`);
    if (queryResult && queryResult.error == 0) {
        //Insert credit record for all the sellers whoes items are seleced by buyer in cart
        for (let recordObj of myData.SellerAmounts) {
            queryResult = await DB_SQL.runQuery(`INSERT INTO UserPayments (BtcTransactionReferenceID, ToUserID, TransacationID, PaymentAmount, PaymentType, CreatedAt)
            VALUE ('', ${recordObj.UserID} '${transacationID}', ${recordObj.TotalAmount}, '${CONSTANTS.PaymentTypes.CREDIT}', UTC_TIMESTAMP()`);
        }
        //insert a credit record for rootuser(us) for transacation changes
        queryResult = await DB_SQL.runQuery(`INSERT INTO UserPayments (BtcTransactionReferenceID, ToUserID, TransacationID, PaymentAmount, PaymentType, CreatedAt)
        VALUE ('', ${SINGLE_VALUE_CONSTANTS.RootUserId} '${transacationID}', ${myData.TransactionCharges}, '${CONSTANTS.PaymentTypes.CREDIT}', UTC_TIMESTAMP()`);
        //insert a debit record for buyer for total amount
        queryResult = await DB_SQL.runQuery(`INSERT INTO UserPayments (BtcTransactionReferenceID, ToUserID, TransacationID, PaymentAmount, PaymentType, CreatedAt)
        VALUE ('', ${buyerID} '${transacationID}', ${myData.totalPrice}, '${CONSTANTS.PaymentTypes.DEBIT}', UTC_TIMESTAMP()`);
    }
    myData.statusCode = STATUS_CODES.OK;
    return myData;
};

async function CreateRecordList(records){
    let myRecords= '';
    for(let record in records){
        if(myRecords) {
            myRecords= record.RecordID; 
        } else{
            myRecords= myRecords + ', ' + record.RecordID;
        }
    }
};

async function GetUserBalanceAmount(userID){
    let balanceAmount = 0;
    let returnResult = await MY_SQL.runQuery(`SELECT SUM(PaymentAmount) AS CreditAmount FROM UserPayments WHERE PaymentToUserID = ${userID} AND PaymentType ='${CONSTANTS.PaymentTypes.CREDIT}'`);
    if(returnResult.error == 0 && returnResult.data.length>0){
        let creditAmount= returnResult.data[0].CreditAmount;
        returnResult = await MY_SQL.runQuery(`SELECT SUM(PaymentAmount) AS DebitAmount FROM UserPayments WHERE PaymentToUserID = ${userID} AND PaymentType ='${CONSTANTS.PaymentTypes.DEBIT}'`);
        if(returnResult.error == 0 && returnResult.data.length>0){
            let debitAmount= returnResult.data[0].DebitAmount;
            balanceAmount= creditAmount- debitAmount;
        }
    }
    return balanceAmount;
}

const GetUserRecords = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : CONSTANTS.OtherConstants.Default_View_Records;
        let viewPage = req.body.view_page ? parseInt(req.body.view_page) : CONSTANTS.OtherConstants.Default_View_Page;
        let whereCondition = `ModifiedByID= ${res.locals.userId} AND RecordStatus= '${CONSTANTS.RecordStatues.SOLD}`;
        dataObject= await RetriveRecords(dataObject, whereCondition, false, viewRecords, viewPage, res.locals.languageId, res.locals.groupIds);
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "GetUserRecords", error.toString());
        next(error);
    }
};

const GetRecordsForBuying = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        let searchString = req.body.searchString ? "%" + req.body.searchString.trim() + "%" : "";
        let searchColumn = req.body.search_column ? req.body.search_column : "";
        let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : CONSTANTS.OtherConstants.Default_View_Records;
        let viewPage = req.body.view_page ? parseInt(req.body.view_page) : CONSTANTS.OtherConstants.Default_View_Page;
        let whereCondition = `RecordStatus= '${CONSTANTS.RecordStatues.ADDED}`;
        if (searchString.length > 0) {
            if (searchColumn) {
                whereCondition += ` AND (${searchColumn} LIKE '${searchString}')`;
            } else {
                whereCondition += ` AND (RecordBin LIKE '${searchString}' OR RecordType LIKE '${searchString}' OR RecordSubType LIKE '${searchString}' OR RecordCountry LIKE '${searchString}' OR RecordState LIKE '${searchString}' OR RecordCity LIKE '${searchString}' OR RecordZip LIKE '${searchString}' OR RecordExp LIKE '${searchString}')`;
            }
        }
        dataObject= await RetriveRecords(dataObject, whereCondition, true, viewRecords, viewPage, res.locals.languageId, res.locals.groupIds);
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "GetRecords", error.toString());
        next(error);
    }
};

const SaveRecords = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_SAVE_ERROR
        }
        let records = req.body.records ? JSON.parse(req.body.records) : [];
        if (records && records.length > 0) {
            let successCount = 0;
            let groupIds = `${CONSTANTS.ResourceGroups.RECORDS}`;
            if(await COMMON_CONTROLLER.ValidateDataAsync(records, RecordModel.RecordModel, groupIds)) {
                for (let recordObject of records) {
                    recordObject.BIN = recordObject.BIN ? recordObject.BIN.trim() : "";
                    recordObject.RECORD_TYPE = recordObject.RECORD_TYPE ? recordObject.RECORD_TYPE.trim() : "";
                    recordObject.SUB_TYPE = recordObject.SUB_TYPE ? recordObject.SUB_TYPE.trim() : "";
                    recordObject.EXPIRY = recordObject.EXPIRY ? recordObject.EXPIRY.trim() : "";
                    recordObject.OWNER_NAME = recordObject.OWNER_NAME ? recordObject.OWNER_NAME.trim() : "";
                    recordObject.COUNTRY = recordObject.COUNTRY ? recordObject.COUNTRY.trim() : "";
                    recordObject.STATE = recordObject.STATE ? recordObject.STATE.trim() : "";
                    recordObject.CITY = recordObject.CITY ? recordObject.CITY.trim() : "";
                    recordObject.ZIP = recordObject.ZIP ? recordObject.ZIP.trim() : "";
                    recordObject.FULL_NAME = recordObject.FULL_NAME ? recordObject.FULL_NAME.trim() : "";
                    recordObject.PHONE_NO = recordObject.PHONE_NO ? recordObject.PHONE_NO.trim() : "";
                    recordObject.BASE = recordObject.BASE ? recordObject.BASE.trim() : "";
                    recordObject.PRICE = recordObject.PRICE ? recordObject.PRICE : "";
                    recordObject.RecordID = UUID.v4();
                    let sqlQuery = `INSERT INTO UserRecords 
                        (RecordID, RecordBin, RecordType, RecordSubType, RecordExp, RecordOwnerName, RecordCountry, RecordState, RecordCity, RecordZip, RecordFullName, RecordPhoneNo, RecordBase, RecordPrice, RecordStatus, CreatedAt, CreatedByID, ModifiedAt, ModifiedByID) 
                        VALUES('${recordObject.RecordID}', '${recordObject.BIN}', '${recordObject.RECORD_TYPE}', '${recordObject.SUB_TYPE}', '${recordObject.EXPIRY}', '${recordObject.OWNER_NAME}', '${recordObject.COUNTRY}', '${recordObject.STATE}', '${recordObject.CITY}', '${recordObject.ZIP}', '${recordObject.FULL_NAME}', '${recordObject.PHONE_NO}', '${recordObject.BASE}', '${recordObject.PRICE}', '${CONSTANTS.RecordStatues.ADDED}', UTC_TIMESTAMP(), ${res.locals.userId}, UTC_TIMESTAMP(), ${res.locals.userId})`;
                    let queryResult = await DB_SQL.runQuery(sqlQuery);
                    if (queryResult && queryResult.error == 0) {
                        successCount += 1;
                        recordObject.Status = "Success";
                    } else {
                        recordObject.Status = "Could not save record";
                    }
                }
                dataObject.statusCode = HTTP_STATUS.OK;
                dataObject.records = records;
                dataObject.successCount = successCount;
            } else {
                dataObject.statusCode = HTTP_STATUS.VALIDATION_ERROR;
            }
        } else {
            dataObject.statusCode = HTTP_STATUS.OK;
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "SaveRecords", error.toString());
        next(error);
    }
};

const GetUserRecordsbasedOnStatus = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        let searchString = req.body.searchString ? "%" + req.body.searchString.trim() + "%" : "";
        let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : CONSTANTS.OtherConstants.Default_View_Records;
        let viewPage = req.body.view_page ? parseInt(req.body.view_page) : CONSTANTS.OtherConstants.Default_View_Page;
        let cartItemsOnly = req.body.cartItemsOnly;
        //this code filters all the null values. this is purposely done so that we can eliminate the if conditions in query where clause
        let whereCondition = "CreatedByID LIKE '%'";
        if(res.locals.roleId== Roles.Seller){
            whereCondition += ` AND CreatedByID = ${res.locals.userId}`;
        } else if(res.locals.roleId== Roles.Buyer){
            whereCondition += ` AND ModifiedByID = ${res.locals.userId} AND RecordStatus = ${RecordStatues.SOLD}`;
            //if (cartItemsOnly ==1){
            //    whereCondition += ` AND RecordStatus = ${RecordStatues.INCART}`;
            //} else {
            //    whereCondition += ` AND RecordStatus = ${RecordStatues.SOLD}`; 
            //}
        }
        if (searchString.length > 0) {
            whereCondition += ` AND (RecordBin LIKE '${searchString}' OR RecordType LIKE '${searchString}' OR RecordSubType LIKE '${searchString}' OR RecordCountry LIKE '${searchString}' OR RecordState LIKE '${searchString}' OR RecordCity LIKE '${searchString}' OR RecordZip LIKE '${searchString}' OR RecordExp LIKE '${searchString}')`;
        }
        //we need to add condition of record in cart or sold and not by that user
        let userQuery = await DB_SQL.runQuery(
            `SELECT RecordID, RecordBin, RecordType, RecordSubType, RecordExpiry, RecordOwnerName, RecordCountry, RecordState, RecordCity, RecordZip,
            RecordFullName, RecordPhoneNo, RecordBase, RecordPrice, RecordStatus, ModifiedAt  
            FROM UserRecords 
            WHERE ${whereCondition} 
            ORDER BY ModifiedAt ASC
            LIMIT ${viewRecords} OFFSET ${viewRecords * (viewPage - 1)}`
        );
        if (userQuery && userQuery.error == 0) {
            if (userQuery.data && userQuery.data.length > 0) {
                dataObject.UserRecords = userQuery.data;
                //get total records count
                userQuery = await DB_SQL.runQuery(`SELECT COUNT(RecordID) AS total_count FROM UserRecords WHERE ${whereCondition}`);
                if (userQuery && userQuery.error == 0) {
                    if(userQuery.data && userQuery.data.length>0){
                        dataObject.totalCount = userQuery.data[0].total_count;
                    }    
                    //get total price of the records and total amount available
                    userQuery = await DB_SQL.runQuery(`SELECT SUM(RecordPrice) AS total_amount FROM UserRecords WHERE ${whereCondition}`);
                    if (userQuery && userQuery.error == 0) {
                        if(userQuery.data && userQuery.data.length>0){
                            dataObject.totalAmount = userQuery.data[0].total_amount;
                        }
                        dataObject.availableAmount= await GetUserBalanceAmount(res.locals.userId);
                        dataObject.statusCode = STATUS_CODES.OK;    
                    }
                } 
            } 
            if (res.locals.groupIds) {
                let resources = await COMMON_CONTROLLER.getResources(res.locals.languageId, res.locals.groupIds);
                dataObject.statusCode = resources.statusCode;
                if (resources.statusCode == HTTP_STATUS.OK) {
                    dataObject.PageResources = resources.resources;
                }
            }
        } 
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "GetUserRecordsbasedOnStatus", error.toString());
        next(error);
    }
}

const BuyRecords = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        //as per new logic lock the records for buying when there is enough balance amount in buyer account so that duplicate buying don't happen
        //get all the records of the user from DB which are marked from buying (no need for records, just calculate the total price of it.)
        //get user BTC address from its profile
        //get our BTC Address from DB Configuration
        //Call the BTC API for transfer from Source to Destination and take to their page
        //Confirm if the transfer is done or not using BTC API
        //if confirmed then mark such records are sold to the user
        //else send the error code to the user
        let inCartRecords = req.body.records ? JSON.parse(req.body.records) : [];
        if (inCartRecords && inCartRecords.length > 0){
            let balaceAmount= await GetUserBalanceAmount(res.locals.userId); 
            if(balaceAmount>0){
                let inCartRecordIDs= await CreateRecordList(inCartRecords);
                let queryResult = await DB_SQL.runQuery(`SELECT SUM(RecordPrice) AS TotalPrice 
                            FROM UserRecords
                            WHERE RecordID IN ('${inCartRecordIDs}') AND RecordStatus= '${CONSTANTS.RecordStatues.ADDED}'`);
                if (queryResult && queryResult.error == 0) {
                    dataObject.totalPrice= queryResult.data[0].TotalPrice;
                    if (balanceAmount>= dataObject.totalPrice){
                        //mark all records in DB as in cart so that no one else can buy them   
                        queryResult= await DB_SQL.runQuery(`UPDATE UserRecords SET RecordStatus= '${CONSTANTS.RecordStatues.INCART}, ModifiedAt=UTC_TIMESTAMP(), ModifiedByID= ${res.locals.userId} WHERE RecordID IN ('${inCartRecordIDs}') AND RecordStatus= '${CONSTANTS.RecordStatues.ADDED}'`);   
                        if(queryResult && queryResult.error == 0){             
                        //start paying each and every cutomer based on their records and their prices. Deduct the charges and move that to rootuser
                        queryResult = await DB_SQL.runQuery(`SELECT RecordID, CreatedByID, RecordPrice FROM UserRecords
                            WHERE ModifiedByID= ${res.locals.userId} AND RecordStatus= '${CONSTANTS.RecordStatues.INCART}'`);    
                            if (queryResult && queryResult.error == 0) {
                                let myResult= await GetUserAmountPayable(queryResult.data, res.locals.userId);
                                if(myResult.transactionCharges >0 && myResult.priceRecords.length>0){
                                    dataObject.TransactionCharges= myResult.transactionCharges;
                                    dataObject.SellerAmounts= myResult.priceRecords;
                                    dataObject= await UpdatePaymentsInfo(dataObject, res.locals.userId);
                                    if(dataObject && dataObject.statusCode== STATUS_CODES.OK){
                                        //mark all the user incart item as sold
                                        queryResult = await DB_SQL.runQuery(`UPDATE UserRecords SET RecordStatus= '${CONSTANTS.RecordStatues.SOLD}, ModifiedAt= UTC_TIMESTAMP(), ModifiedByID= ${res.locals.userId} WHERE ModifiedByID= ${res.locals.userId} AND RecordStatus= '${CONSTANTS.RecordStatues.INCART}'`);   
                                        if(queryResult && queryResult.error == 0) {
                                            dataObject.statusCode= STATUS_CODES.DATA_RETRIEVAL_ERROR;       
                                        }            
                                    } 
                                }
                            }        
                        }
                    }
                    else{
                        dataObject.statusCode= STATUS_CODES.LOW_BALANCE;
                        dataObject.balnaceamount= balaceAmount;
                    } 
                } 
            }
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "BuyRecords", error.toString());
        next(error);
    }
};

const GetRecord = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        if (recordID) {
            let userQuery = await DB_SQL.runQuery(
                `SELECT RecordID, RecordBin, RecordType, RecordSubType, RecordExpiry, RecordCountry, RecordState, RecordCity, RecordZip, 
                FROM UserRecords 
                WHERE RecordID = '${recordID}' `
            );
            if (userQuery && userQuery.error == 0 && userQuery.data && userQuery.data.length > 0) {
                dataObject.UserRecord = userQuery.data[0];
                dataObject.statusCode = STATUS_CODES.OK;
            } 
        } else {
            dataObject.statusCode = STATUS_CODES.VALIDATION_ERROR;
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "GetRecord", error.toString());
        next(error);
    }
};

const AddRecordToCart = async (req, res, next) => {
    try {
        let statusCode = HTTP_STATUS.NO_CONTENT;
        let recordID = req.headers.recordID;
        let dataObject = {
            statusCode: tokenStatus.statusCode,
        }
        if (recordID) {
            let sqlQuery = `UPDATE UserRecords 
                            SET RecordStatus= '${CONSTANTS.RecordStatues.INCART}',  ModifiedAt- UTC_TIMESTAMP(), ModifiedByID= ${userId}
                            WHERE RecordID= '${recordID.trim()}' AND RecordStatus= '${CONSTANTS.RecordStatues.ADDED}'`;
            let queryResult = await DB_SQL.runQuery(sqlQuery);
            if (queryResult && queryResult.error == 0) {
                statusCode = HTTP_STATUS.OK;
            } else {
                statusCode = HTTP_STATUS.OK;
            }
        }
        statusCode = HTTP_STATUS.OK;
        res.locals.statusCode = statusCode;
        dataObject.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "AddRecordToCart", error.toString());
        next(error);
    }
};

const RemoveRecordFromCart = async (req, res, next) => {
    try {
        let statusCode = HTTP_STATUS.NO_CONTENT;
        let recordID = req.headers.recordID;
        let dataObject = {
            statusCode: tokenStatus.statusCode,
        }
        if (recordID) {
            let sqlQuery = `UPDATE UserRecords 
                            SET RecordStatus= '${CONSTANTS.RecordStatues.ADDED}',  ModifiedAt- UTC_TIMESTAMP(), ModifiedByID= ${userId}
                            WHERE RecordID= '${recordID.trim()}' AND RecordStatus= '${CONSTANTS.RecordStatues.INCART}' AND ModifiedByID= ${userId}`;
            let queryResult = await DB_SQL.runQuery(sqlQuery);
            if (queryResult && queryResult.error == 0) {
                statusCode = HTTP_STATUS.OK;
            } else {
                statusCode = HTTP_STATUS.OK;
            }
        }
        statusCode = HTTP_STATUS.OK;
        res.locals.statusCode = statusCode;
        dataObject.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "RemoveRecordFromCart", error.toString());
        next(error);
    }
};

const ArchiveRecord = async (req, res, next) => {
    try {
        let statusCode = HTTP_STATUS.NO_CONTENT;
        let statusMessage = "UNDEFINED_ERROR";
        let dataObject = {
            statusCode: tokenStatus.statusCode,
        }
        let recordId = req.body.recordId ? req.body.recordId : "";
        if (recordId) {
            statusCode = HTTP_STATUS.OK;
            statusMessage = "RECORD_UPDATED";
            let updateRecordQuery = await DB_SQL.runQuery(
                `UPDATE UserRecords 
                SET RecordStatus = ${CONSTANTS.RecordStatues.SUSPENDED}, ModifiedByID = ${userId}, ModifiedAt = UTC_TIMESTAMP() 
                WHERE RecordID = '${recordId}'`
            );
            if (updateRecordQuery && updateRecordQuery.error > 0) {
                statusCode = HTTP_STATUS.NO_CONTENT;
                statusMessage = "UPDATE_ERROR";
            }
        } else {
            statusCode = HTTP_STATUS.NO_CONTENT;
            statusMessage = "VALIDATION_ERROR";
        }
        dataObject.message = statusMessage;
        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        res.locals.statusMessage = statusMessage;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "activateDeactivateMedia", error.toString());
        next(error);
    }
}

module.exports = {
    GetRecordsForBuying,
    GetUserRecords,
    GetUserRecordsbasedOnStatus,
    SaveRecords,
    BuyRecords,
};