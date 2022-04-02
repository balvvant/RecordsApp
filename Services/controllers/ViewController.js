const uploadFile = require("../utils/upload");
const FileType = require("file-type");
const Logger = require("../utils/logger");
const { VideoFileTypes, STATUS_CODES } = require("../utils/Constants");

const ViewUploadedContent = async (req, res, next) => {
  try {
    let statusCode = STATUS_CODES.VALIDATION_ERROR;
    const dataObject = {};
    const byPassJwtAuth = true;

    if (byPassJwtAuth) {
      const fileName = req.params.fileName
        ? "uploads/" + req.params.fileName.trim()
        : "";

      if (fileName.length > 0) {
        const fileDownloadS3Object = uploadFile.downloadFile(fileName);
        const fileDownloadContent = (await fileDownloadS3Object).Body;

        const fileExtension = fileName.split('.').pop().toLocaleLowerCase();

        let fileType;
        if(VideoFileTypes.includes(fileExtension)){
          fileType = await Buffer.from(fileDownloadContent);
        }else{
          fileType = await FileType.fromBuffer(fileDownloadContent);
        }
        
        var range = req.headers.range;
        if (req.get("Range") == null) {
          res.status(200);
          res.set("Connection", "keep-alive");
          res.set("Content-Type", fileType.mime);
          res.set("Content-Length", fileDownloadContent.length);
          res.set("Accept-Ranges", "bytes");
          res.end(fileDownloadContent);
        } else {
          var total = fileDownloadContent.length;
          var split = range.split(/[-=]/);
          var ini = +split[1];
          var end = split[2] ? +split[2] : total - 1;
          var chunkSize = end - ini + 1;
          if (parseInt(ini) >= total || parseInt(end) >= total) {
            //Indicate the acceptable range.
            res.status(416);
            res.set("Content-Range", "bytes */" + total); // File size.
            //Return the 416 'Requested Range Not Satisfiable'.
            res.end();
          }
          res.status(206);
          res.set("Connection", "keep-alive");
          res.set("Content-Range", "bytes " + ini + "-" + end + "/" + total);
          res.set("Accept-Ranges", "bytes");
          res.set("Content-Length", chunkSize);
          res.set("Content-Type", fileType.mime);
          res.end(fileDownloadContent.slice(ini, chunkSize + ini));
        }
      } else {
        statusCode = STATUS_CODES.NO_CONTENT;
        statusMessage = "File Name not specified to view";
        dataObject.message = statusMessage;

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        res.locals.statusMessage = statusMessage;

        next();
      }
    } else {
      statusCode = STATUS_CODES.UNAUTHORIZED;
      statusMessage = "NOT_AUTHORIZED";
      dataObject.message = statusMessage;

      res.locals.statusCode = statusCode;
      res.locals.dataObject = dataObject;
      res.locals.statusMessage = statusMessage;

      next();
    }
  } catch (error) {
    Logger.servicesLogger(req, "ViewUploadedContent", error.toString());
    next(error);
  }
};

const ViewUploadedIcon = async (req, res, next) => {
  try {
    let statusCode = STATUS_CODES.VALIDATION_ERROR;
    const dataObject = {};
      const fileName = req.params.fileName
        ? "uploads/icons/" + req.params.fileName.trim()
        : "";
      if (fileName.length > 0) {
        const fileDownloadS3Object = uploadFile.downloadFile(fileName);
        const fileDownloadContent = (await fileDownloadS3Object).Body;
        const fileType = await FileType.fromBuffer(fileDownloadContent);
        res.writeHead(200, {
          "Content-Type": fileType.mime,
          "Content-Length": fileDownloadContent.length,
        });
        res.end(fileDownloadContent);
      } else {
        statusCode = STATUS_CODES.NO_CONTENT;
        statusMessage = "File Name not specified to view";
        dataObject.message = statusMessage;

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        res.locals.statusMessage = statusMessage;

        next();
      }
  } catch (error) {
    Logger.servicesLogger(req, "ViewUploadedIcon", error.toString());
    next(error);
  }
};


const ViewUploadedAttachment = async (req, res, next) => {
  try {
    let statusCode = STATUS_CODES.VALIDATION_ERROR;
    const dataObject = {};
    const byPassJwtAuth = true;

    if (byPassJwtAuth) {
      const fileName = req.params.fileName
        ? "uploads/attachment/" + req.params.fileName.trim()
        : "";
      if (fileName.length > 0) {
        const fileDownloadS3Object = uploadFile.downloadFile(fileName);
        const fileDownloadContent = (await fileDownloadS3Object).Body;
        const fileType = await FileType.fromBuffer(fileDownloadContent);
        res.writeHead(200, {
          "Content-Type": fileType.mime,
          "Content-Length": fileDownloadContent.length,
        });
        res.end(fileDownloadContent);
      } else {
        statusCode = STATUS_CODES.NO_CONTENT;
        statusMessage = "File Name not specified to view";
        dataObject.message = statusMessage;

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        res.locals.statusMessage = statusMessage;

        next();
      }
    } else {
      statusCode = STATUS_CODES.UNAUTHORIZED;
      statusMessage = "NOT_AUTHORIZED";
      dataObject.message = statusMessage;

      res.locals.statusCode = statusCode;
      res.locals.dataObject = dataObject;
      res.locals.statusMessage = statusMessage;

      next();
    }
  } catch (error) {
    Logger.servicesLogger(req, "ViewUploadedAttachment", error.toString());
    next(error);
  }
};

module.exports = {
  ViewUploadedContent,
  ViewUploadedIcon,
  ViewUploadedAttachment,
};
