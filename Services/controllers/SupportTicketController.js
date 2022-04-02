const COMMON_CONTROLLER = require('./CommonController');
const CONSTANTS = require("../utils/constants");
const STATUS_CODES = CONSTANTS.STATUS_CODES;
const LOGGER = require("../utils/logger");
const My_SQL = require("../config/database/sql");

const CreateSupportTicket = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_SAVE_ERROR
        }
        let messsageHeader = req.body.messageheader;
        let messsageBody = req.body.messagebody;
        //write logic to validate the data
        let sqlQuery = `INSERT INTO SupportTickets 
                        (MessageHeader, MessageBody, CreatedAt, CreatedByID, ModifiedAt, ModifiedByID) 
                        VALUES('${messsageHeader}', '${messsageBody}', UTC_TIMESTAMP(), ${res.locals.userId}, UTC_TIMESTAMP(), ${res.locals.userId})`;
        let queryResult = await My_SQL.runQuery(sqlQuery);
        if (queryResult && queryResult.error == 0) {
            dataObject.statusCode = STATUS_CODES.OK;
        } 
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "CreateSupportTicket", error.toString());
        next(error);
    }
};

const UpdateSupportTicket = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_SAVE_ERROR
        }
        let ticketID = req.body.ticketid;
        let messsageResponse = req.body.messageresponse;
        //write logic to validate the data
        let queryResult = await My_SQL.runQuery(`UPDATE SupportTickets SET MessageResponse= '${messsageResponse}', ModifiedAt= UTC_TIMESTAMP(), 
        ModifiedByID= ${res.locals.userId} WHERE TicketID = ${ticketID})`);
        if (queryResult && queryResult.error == 0) {
            dataObject.statusCode = STATUS_CODES.OK;
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "UpdateSupportTicket", error.toString());
        next(error);
    }
};

const GetMySupportTickets = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : CONSTANTS.OtherConstants.Default_View_Records;
        let viewPage = req.body.view_page ? parseInt(req.body.view_page) : CONSTANTS.OtherConstants.Default_View_Page;
        //this code filters all the null values. this is purposely done so that we can eliminate the if conditions in query where clause
        let whereCondition = "CreatedByID LIKE '%'";
        if(res.locals.roleId== Roles.Seller || res.locals.roleId== Roles.Buyer) {
            whereCondition += ` AND CreatedByID = ${res.locals.userId}`;
        } 
        let userQuery = await My_SQL.runQuery(
            `SELECT TicketID, MessageHeader, CreatedAt, '' AS IsResponded, ModifiedAt AS RespondedON  
            FROM SupportTickets 
            WHERE ${whereCondition} 
            ORDER BY ModifiedAt DESC
            LIMIT ${viewRecords} OFFSET ${viewRecords * (viewPage - 1)}`
        );
        if (userQuery && userQuery.error == 0) {
            if (userQuery.data && userQuery.data.length > 0) {
                for(let ticket in userQuery.data){
                    if(ticket.messsageResponse){
                        ticket.Responded= CONSTANTS.UserTicketStatuses.RESPONDED;        
                    } else {
                        ticket.Responded= CONSTANTS.UserTicketStatuses.RAISED;
                        ticket.RespondedON= "";
                    }
                }
                dataObject.UserTickets = userQuery.data;
                //get total records count
                userQuery = await My_SQL.runQuery(`SELECT COUNT(TicketID) AS TotalCount FROM SupportTickets WHERE ${whereCondition}`);
                if (userQuery && userQuery.error == 0 && userQuery.data) {
                    dataObject.totalCount = userQuery.data[0].TotalCount;
                    dataObject.statusCode = STATUS_CODES.OK;
                }
                if (res.locals.groupIds) {
                    let resources = await COMMON_CONTROLLER.getResources(res.locals.languageId, res.locals.groupIds);
                    dataObject.statusCode = resources.statusCode;
                    if (dataObject.statusCode == STATUS_CODES.OK) {
                        dataObject.PageResources = resources.resources;
                    }
                }
            }
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "GetMySupportTickets", error.toString());
        next(error);
    }
}

const GetMySupportTicket = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
        }
        let ticketID = req.body.ticketID;
        let userQuery = await My_SQL.runQuery(
            `SELECT TicketID, MessageHeader, MessageBody, MessageResponse FROM SupportTickets WHERE TicketID= ${ticketID}`
        );
        if (userQuery && userQuery.error == 0) {
            if (userQuery.data && userQuery.data.length > 0) {
                dataObject.statusCode= STATUS_CODES.OK;
                dataObject.UserTicket = userQuery.data[0];
            }
            if (res.locals.groupIds) {
                let resources = await COMMON_CONTROLLER.getResources(res.locals.languageId, res.locals.groupIds);
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
        LOGGER.servicesLogger(req, "GetMySupportTicket", error.toString());
        next(error);
    }
}

module.exports = {
    CreateSupportTicket,
    UpdateSupportTicket,
    GetMySupportTickets,
    GetMySupportTicket
};