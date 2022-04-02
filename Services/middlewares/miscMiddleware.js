const commonCheckFunction = (req, res, next) => {
    next();
};

module.exports = {
    commonCheck: commonCheckFunction
};