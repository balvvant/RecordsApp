const COMMON_CONTROLLER = require('./CommonController');
const CONSTANTS = require("../utils/constants");
const STATUS_CODES = CONSTANTS.STATUS_CODES;
const LOGGER = require("../utils/logger");
const My_SQL = require("../config/database/sql");

const GetInvitationCodes = async (req, res, next) => {
  try {
      let dataObject = {
          statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
      }
      let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : CONSTANTS.OtherConstants.Default_View_Records;
      let viewPage = req.body.view_page ? parseInt(req.body.view_page) : CONSTANTS.OtherConstants.Default_View_Page;
      let userQuery = await My_SQL.runQuery(
          `SELECT TicketID, MessageHeader, MessageBody, MessageResponse, CreatedAt, ModifiedAt, '' AS Responded  
          FROM supporttickets 
          WHERE IsActive= ${CONSTANTS.Status.Active_Status} 
          ORDER BY ModifiedAt DESC
          LIMIT ${viewRecords} OFFSET ${viewRecords * (viewPage - 1)}`
      );
      if (userQuery && userQuery.error == 0) {
          if (userQuery.data && userQuery.data.length > 0) {
              dataObject.ActivationCodes = userQuery.data;
              //get total records count
              userQuery = await My_SQL.runQuery(`SELECT COUNT(TicketID) AS TotalCount FROM supporttickets WHERE IsActive= ${CONSTANTS.Status.Active_Status}`);
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
      LOGGER.servicesLogger(req, "GetInvitationCodes", error.toString());
      next(error);
  }
}

const CreateInvitationCode = async (req, res, next) => {
    try {
        let dataObject = {
            statusCode: STATUS_CODES.DATA_SAVE_ERROR
        }
        let invitationCodeFor = req.body.invitationcodefor;
        if(invitationCodeFor == 'Buyer'){
            invitationCodeFor= CONSTANTS.InvitationCodeFor.Buyer;
        } else if(invitationCodeFor =='Seller'){
            invitationCodeFor= CONSTANTS.InvitationCodeFor.Seller;
        }
        if(invitationCodeFor){
          let invitationCode= UUID.v4();
          let sqlQuery = `INSERT INTO UserActivationCodes 
                          (ActivationCode, ActivationCodeType, IsActive, CreatedAt, CreatedByID, ModifiedAt, ModifiedByID) 
                          VALUES('${invitationCode}', '${invitationCodeFor}', ${CONSTANTS.Status.Active_Status} UTC_TIMESTAMP(), ${res.locals.userId}, UTC_TIMESTAMP(), ${res.locals.userId})`;
          let queryResult = await My_SQL.runQuery(sqlQuery);
          if (queryResult && queryResult.error == 0) {
              dataObject.statusCode = STATUS_CODES.OK;
          } 
        } else {
          dataObject.statusCode = STATUS_CODES.VALIDATION_ERROR;
        }
        res.locals.statusCode = dataObject.statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        LOGGER.servicesLogger(req, "CreateInvitationCode", error.toString());
        next(error);
    }
};

module.exports = {
    GetInvitationCodes,  
    CreateInvitationCode
};