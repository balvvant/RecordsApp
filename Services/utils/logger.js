const sql = require("../config/database/sql");
const Constants = require("./Constants");

/**
 * Save Error log in database
 * 
 * @param {*} token 
 * @param {*} methodLocation 
 * @param {*} systemInfo 
 * @param {*} methodName 
 * @param {*} errorStake 
 * @returns 
 */
const logger = async (token, methodLocation, systemInfo, methodName, errorStake) => {

    if(token){
        token = `'${token}'`;
    }

    const insertQuery = `INSERT INTO request_logs (token , method_location, system_info, method_name, error_stake, created_at, updated_at ) VALUES (${token}, '${methodLocation}', '${systemInfo}', '${methodName}', '${errorStake.replace(/'/g, "")}', UTC_TIMESTAMP(), UTC_TIMESTAMP())`;
    const response = await sql.runQuery(insertQuery);
    if(response){
        return true;
    }else{
        return false;
    }
};

/**
 * Service logger
 * 
 * @param {*} req 
 * @param {*} methodName 
 * @param {*} errorStake 
 * @returns 
 */
const servicesLogger = async (req, methodName, errorStake) => {
    const methodLocation =  "Service";
    const systemInfo = null;
    let token = null;
    if(typeof req.headers.token !== 'undefined'){
      token = `'${req.headers.token}'`;
    }
    

    const insertQuery = `INSERT INTO request_logs (token, method_location, system_info, method_name, error_stake, created_at, updated_at ) VALUES (${token}, '${methodLocation}', '${systemInfo}', '${methodName}', '${errorStake.replace(/'/g, "")}', UTC_TIMESTAMP(), UTC_TIMESTAMP())`;
    const response = await sql.runQuery(insertQuery);
    
    if(response){
        return true;
    }else{
        return false;
    }
};

module.exports = {
    logger: logger,
    servicesLogger: servicesLogger
};