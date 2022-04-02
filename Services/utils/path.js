const path = require('path');
const appRoot = require('app-root-path')

module.exports = {
    // rootPath: path.dirname(process.mainModule.filename)
    rootPath: appRoot.path,
};