var mysql = require('mysql');

const Constants = require("../../utils/Constants");
const SecretKey = Constants.SecretKey;
const SecretDetails = Constants.SecretDetails;

const dbName = SecretDetails[SecretKey.MYSQL_DB_NAME];
const dbHost = SecretDetails[SecretKey.MYSQL_DB_HOST];
const userName = SecretDetails[SecretKey.MYSQL_DB_USER];
const userPass = SecretDetails[SecretKey.MYSQL_DB_PASS];

const connection = mysql.createConnection({
  host     : dbHost,
  user     : userName,
  password : userPass,
  database : dbName
});

// connect database
connection.connect((err) => {
  if(err) throw err;
  console.log('Connected to MySQL Server!');
});

const runQuery = (query) => {
  return new Promise(function(resolve, reject) {
      conn.query(query, (err, rows) => {

          if(err) resolve({error: 1, message: err});
          resolve({error: 0, data: rows});
      });
  });
} 


module.exports = {
  connection: connection, // set as global on express.js file
  runQuery: runQuery,
};