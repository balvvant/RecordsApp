const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const Routes = require("../routes/router");
const rootPathControl = require("../utils/path");
const { SetApiRequestFunction, SetApiResponseFunction, Get404ErrorFunction } = require("../controllers/Index");
const miscMiddle = require("../middlewares/miscMiddleware");
const sql = require("./database/sql");
const { SecretDetails, SecretKey } = require("../utils/Constants");
global.conn = sql.connection;

// enable cors
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// for dev
// app.use(function(req, res, next) {
//   res.setHeader("Content-Security-Policy", "frame-ancestors 'self' dev.liberateworks.com;");
//   next();
// });

// for local
app.use(function(req, res, next) {
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' localhost:3000;");
  next();
});

// for uat
// app.use(function(req, res, next) {
//   res.setHeader("Content-Security-Policy", "frame-ancestors 'self' uat.liberateworks.com;");
//   next();
// });

// set pug templating engine
app.set("view engine", "pug");

// set templates folder
app.set("views", "views");

// use helmet - secure headers
app.use(helmet());

// set server port
app.set("port", SecretDetails[SecretKey.PORT]);

// set server hostname
app.set("hostname", SecretDetails[SecretKey.HOSTNAME]);

// start node-server
const server = app.listen(app.get("port"), app.get("hostname"), () => {
  const port = server.address().port;
  const address = server.address().address;
  // console.log(
  //   "ExpressJS listening on address " + address + " with port " + port
  // );
});

global.appServer = server;
app.emit( "app_started" )

// serve files statically
app.use(express.static(path.join(rootPathControl.rootPath, "public")));
// serve files statically
app.use(express.static(path.join(rootPathControl.rootPath, "assets")));
// serve files statically
app.use(
  "/view-uploads",
  express.static(path.join(rootPathControl.rootPath, "uploads"))
);

// parsing raw json
app.use(bodyParser.json());

// parsing x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// file-upload options
app.use(fileUpload());

// set api response object
app.use(SetApiRequestFunction);


// common middleware on all requests
app.use(miscMiddle.commonCheck);

// execute api routes
app.use("/", Routes);

// return api response object
app.use(SetApiResponseFunction);

// set 404 endpoint
app.use(Get404ErrorFunction);

module.exports = {
  appServer: app,
};
