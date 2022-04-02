const Sql = require('../config/database/sql');
const Logger = require("../utils/logger");
const { STATUS_CODES, Status } = require("../utils/Constants");

const ErrorLogger = async (req, res, next) => {
    try {
        res.locals.statusCode = STATUS_CODES.DATA_SAVE_ERROR;
        let token = null;
        if (typeof req.headers.token !== 'undefined') {
            token = req.headers.token;
        }
        const methodLocation = req.body.methodLocation;
        const systemInfo = req.body.systemInfo;
        const methodName = req.body.methodName;
        const errorStake = req.body.errorStake;
        let log = await Logger.logger(token, methodLocation, systemInfo, methodName, errorStake);
        if (log) {
            res.locals.statusCode = STATUS_CODES.OK;
        }
        next();
    } catch (error) {
        Logger.servicesLogger(req, "ErrorLogger", error.toString());
        next(error);
    }
}

module.exports = {
    ErrorLogger
}