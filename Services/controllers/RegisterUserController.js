const CONST_VALUES = require("../utils/constants");
const SINGLE_VALUE_CONST = require("../utils/SingleValueConstants");
const LOGGER = require("../utils/logger");
const VALIDATIONS = require("../utils/validation")
const MY_SQL = require("../config/database/sql");
const UTILITIES = require("../utils/utilities");

async function CheckForDuplicateUser(userName, btcAddress, emailID, jabberID, telegramID){
  let isDupilcate = true;
  let sqlFilter = `UserName = '${userName}'`; 
  if(btcAddress){
    sqlFilter +=  ` OR BTCAddress ='${btcAddress}'`;
  }
  if(emailID){
    sqlFilter +=  ` OR EmailID ='${emailID}'`;
  }
  if(jabberID){
    sqlFilter +=  ` OR JabberID ='${jabberID}'`;
  }
  if(telegramID){
    sqlFilter +=  ` OR TelegramID ='${telegramID}'`;
  }
  let returnResult = await MY_SQL.runQuery(`SELECT UserID FROM users WHERE '${sqlFilter}'`);
  if(returnResult && returnResult.error == 0){
    if (returnResult.data && returnResult.data.length < 1) {
      isDupilcate= false;
    }
  }
  return isDupilcate;
}

async function CheckForValidInvitationCode(activationCode, activationCodeType){
  let sqlQuery = `SELECT ActivationCodeID FROM UserActivationCodes WHERE ActivationCode = '${activationCode}' AND ActivationCodeType= '${activationCodeType}' 
                  AND IsActive= ${Constants.Status.Active_Status}`;
  let returnResult = await MY_SQL.runQuery(sqlQuery);
  if(returnResult && returnResult.error == 0){
    if (returnResult.data && returnResult.data.length >0) {
      return returnResult.data[0].ActivationCodeID;
    }
  }
  return 0;
}

const RegisterUser = async(req, res, next) => {
  try {
    let dataObject = {
      statusCode: STATUS_CODES.VALIDATION_ERROR
    }
    let userName = req.body.username ? req.body.username.trim() : "";
    let userPassword = req.body.userpassword ? req.body.userpassword.trim() : "";
    let userRegistrationType = req.body.userregistrationtype ? req.userregistrationtype: "";
    let emailID = req.body.emailid ? await UTILITIES.encrypt(req.body.emailid.toString().toLowerCase()) : "";
    let btcAddress = req.body.btcaddress ? await UTILITIES.encrypt(req.btcaddress.trim()): "";
    let jabberID = req.body.jabberid ? await UTILITIES.encrypt(req.jabberid.trim()): "";
    let telegramID = req.body.telegramid ? await UTILITIES.encrypt(req.telegramid.trim()): "";
    let activationCode = req.body.activationcode ? req.activationcode.trim(): "";
    let validate = true;
    if (userName) {
      if (!await VALIDATIONS.textValidation(userName, 8, 50)) {
        validate = false;
      }
    } 
    if (userPassword) {
      if (!await VALIDATIONS.textValidation(userPassword, 8, 50)) {
        validate = false;
      }else if (!await VALIDATIONS.passwordValidation(password)) {
        validate = false;
      }
    }
    if (!activationCode) {
        validate = false;
    } 
    if(validate){ 
      let codeType= '';
      let userRoleID= 0;
      if(userRegistrationType == 'Buyer'){
        codeType= CONST_VALUES.InvitationCodeFor.Buyer;
        userRoleID= CONST_VALUES.Roles.Buyer;
      } else if(userRegistrationType =='Seller'){
        codeType= CONST_VALUES.InvitationCodeFor.Seller;
        userRoleID= CONST_VALUES.Roles.Seller;
      }
      if(codeType){
        let activationCodeID= await CheckForValidInvitationCode (activationCode, codeType)
        if (activationCodeID >0){
          userName = await UTILITIES.encrypt(userName);
          if(await CheckForDuplicateUser(userName, btcAddress, emailID, jabberID, telegramID)){
            dataObject.statusCode= STATUS_CODES.USER_EXISTS;
          } else {
            userPassword = await UTILITIES.encrypt(userPassword);
            let returnResult = await MY_SQL.runQuery(`INSERT INTO users(UserName, UserRole, BTCAddress, EmailID, JabberID, AccountPassword, TelegramID, ActivationCodeID, ActivationStatus, IsActive, CreatedAt, CreatedByID, ModifiedAt, ModifiedByID)
            VALUE ('${userName}', ${userRoleID}, '${btcAddress}', '${emailID}', '${jabberID}', '${userPassword}', '${telegramID}', ${activationCodeID}, '${CONST_VALUES.UserActivationStatuses.OPEN}', ${CONST_VALUES.Status.Active_Status},  UTC_TIMESTAMP(), 0, UTC_TIMESTAMP(), 0)`);
            if(returnResult && returnResult.error == 0){
              //disable the activation code
              returnResult = await MY_SQL.runQuery(`UPDATE UserActivationCodes SET IsActive= ${CONST_VALUES.Status.Inactive_Status}, 
              ModifiedAt= UTC_TIMESTAMP(), ModifiedByID= 0 WHERE ActivationCodeID= ${activationCodeID}`)
              if(returnResult && returnResult.error == 0){
                dataObject.statusCode= STATUS_CODES.OK;
              }
            } 
          }
        } else {
          dataObject.statusCode= STATUS_CODES.INVALID_UNLOCK_CODE;
        }
      }
    }
    res.locals.statusCode = dataObject.statusCode;
    res.locals.dataObject = dataObject;
    next();
  } catch (error) {
      LOGGER.servicesLogger(req, "RegisterUser", error.toString());
      next(error);
  }
};

const PayRegistrationFee = async(req, res, next) =>{
  try {
    let dataObject = {
        statusCode: STATUS_CODES.DATA_RETRIEVAL_ERROR
    }
    if(res.locals.roleId == CONST_VALUES.Roles.Buyer){
      dataObject.RegFee= SINGLE_VALUE_CONST.BuyerRegistrationCharges;
    } else if(res.locals.roleId == CONST_VALUES.Roles.Seller){
      dataObject.RegFee= SellerRegistrationCharges;
    }
    //call Blocknomincs code to make payment
    res.locals.statusCode = dataObject.statusCode;
    res.locals.dataObject = dataObject;
    next();
  } catch (error) {
      LOGGER.servicesLogger(req, "GetRecords", error.toString());
      next(error);
  }  
}

module.exports = {
  RegisterUser,
  PayRegistrationFee
};
