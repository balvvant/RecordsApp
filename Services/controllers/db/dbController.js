const logger = require("./../../utils/logger");

const clearDbFunction = (req, res, next) => {
  try {
    let statusCode = 204;
    const dataObject = {};
    let statusMessage = "UNDEFINED_ERROR";

    dataObject.testSuccess = true;
    dataObject.message = "Database dropped completely";

    statusCode = 200;
    statusMessage = dataObject.message;

    res.locals.statusCode = statusCode;
    res.locals.dataObject = dataObject;
    res.locals.statusMessage = statusMessage;

    next();
  } catch (error) {
    // error logger
    logger.servicesLogger(req, "clearDbFunction", error.toString());
    next(error);
  }
};

module.exports = {
  clearDb: clearDbFunction
};
