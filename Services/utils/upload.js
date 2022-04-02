const rootPathControl = require("./path");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const hbjs = require("handbrake-js");
const AWS = require("aws-sdk");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
ffmpeg.setFfprobePath("/usr/bin");
const Utilities = require("../utils/utilities");
const { SecretKey, ContentTypes, PatientContentTypes } = require('./Constants');


const uploadFileLocal = async (file) => {
  const fileSrc = "uploads/" + uuid.v4() + "_$_" + file.name;
  await file.mv(path.join(rootPathControl.rootPath, fileSrc));
  return fileSrc;
};

const uploadFileLocalConverted = async (file, fileSrc, fileOuputSrc) => {
  await file.mv(path.join(rootPathControl.rootPath, fileSrc));
  hbjs
    .run({ input: fileSrc, output: fileOuputSrc, encoder: "x264" })
    .then(() => {
      fs.unlinkSync(fileSrc);
      uploadFileFromLocal(fileOuputSrc);
    });
  return fileOuputSrc;
};

const uploadFileLocalConvertedFFmpeg = async (file, fileSrc, fileOuputSrc) => {
  // await file.mv(path.join(rootPathControl.rootPath, fileSrc));
  // await ffmpeg(path.join(rootPathControl.rootPath, fileSrc))
  //   .withOutputFormat("mp4")
  //   .saveToFile(path.join(rootPathControl.rootPath, fileOuputSrc)).on("end", async function (stdout, stderr) {
  //     await uploadFileFromLocal(fileOuputSrc);
  //     fs.unlinkSync(fileSrc);
  //     fs.unlinkSync(fileOuputSrc);
  //   });
  // return fileOuputSrc;
  await file.mv(path.join(rootPathControl.rootPath, fileOuputSrc));
  await uploadFileFromLocal(fileOuputSrc);
  return fileOuputSrc;
};

const uploadConvertedS3 = async (file) => {
  const uniqueFileName = uuid.v4() + "_$_" + file.name;
  const fileSrc = "uploads/tmp_" + uniqueFileName;
  const fileOuputSrc = "uploads/" + uniqueFileName;
  await uploadFileLocalConvertedFFmpeg(file, fileSrc, fileOuputSrc);
  return uniqueFileName;
};

const uploadFileFromLocal = async (fileName) => {
  // Read content from the file
  const fileContent = fs.readFileSync(
    path.join(rootPathControl.rootPath, fileName)
  );

  const bucket    =   await Utilities.getSecretCredential(SecretKey.AWS_S3_BUCKET);
  // Setting up S3 instance object
  const s3Object = await s3ObjectFunction();
  // Setting up S3 upload parameters
  const params = {
    Bucket: bucket,
    Key: fileName, // File name you want to save as in S3
    Body: fileContent,
  };
  
  // uploading to s3 bucket
  const s3Uplaod = await s3Object.upload(params).promise();
  fs.unlinkSync(fileName);
  return fileName;
};


const getFileNameFromPath  =  (path) => {
  let fileIndex = path.split('/');
  let fileName = fileIndex[fileIndex.length - 1];
  fileName = fileName.split("_$_").pop();
  return fileName;
}

const getFilePathFromName  =  (fileName, contentType, fileType="") => {
  let filePath = "";
  if(contentType == ContentTypes.DECK) {
    if(fileType == PatientContentTypes.IMAGE) {
      filePath = "uploads/slides/" + fileName;
    } else {
      filePath = "uploads/pdf/" + fileName;
    }
  } else if(contentType == ContentTypes.VIDEO) {
    filePath = "uploads/video/" + fileName;
  } else if (contentType == ContentTypes.FILE) {
    filePath = "uploads/attachment/" + fileName;
  }
  return filePath;
}


module.exports = {
  uploadFileLocal: uploadFileLocal,
  uploadFileFromLocal: uploadFileFromLocal,
  uploadFileLocalConverted: uploadFileLocalConverted,
  uploadConvertedS3: uploadConvertedS3,
  getFileNameFromPath : getFileNameFromPath,
  getFilePathFromName: getFilePathFromName
};
