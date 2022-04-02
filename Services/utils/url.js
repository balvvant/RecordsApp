const url = require('url');

const currentUrlFunction = (req) => {
    const currentUri = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });

    return currentUri;
};

module.exports = {
    currentUrl: currentUrlFunction
};