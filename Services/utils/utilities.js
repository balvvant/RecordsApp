const crypto = require("crypto");
const Sql = require('../config/database/sql');

const generator = require("generate-password");

const algorithm = "aes-256-cbc";
var https = require('https');
const fs = require("fs");
const Constants = require("./Constants");
const SecretKeys = Constants.SecretKey;
const SecretDetails = Constants.SecretDetails;

const AWS = require("aws-sdk");

const encryptString = async(text) => {
    try {

        if (text && text != "" && text != "null") {
            const iv = Buffer.from(await getSecretCredential(SecretKeys.CIPHER_IV_KEY));
            const ENCRYPTION_KEY = await getSecretCredential(SecretKeys.CIPHER_KEY);
            const cipher = crypto.createCipheriv(
                algorithm,
                Buffer.from(ENCRYPTION_KEY),
                iv
            );

            let encrypted = cipher.update(text.toString());
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            const encData = iv.toString("hex") + ":" + encrypted.toString("hex");
            return Buffer.from(encData).toString("base64");
        } else {
            return text;
        }


    } catch (error) {
        // console.log(error);
        throw Error("Could not encrypt. Please communicate the same to the team.");
    }
};

const decryptString = async(encText) => {
    try {
        if (encText && encText != "" && encText != "null") {
            const text = Buffer.from(encText, "base64").toString("ascii");
            const textParts = text.split(":");
            const iv = Buffer.from(textParts.shift(), "hex");
            const encryptedText = Buffer.from(textParts.join(":"), "hex");
            const ENCRYPTION_KEY = await getSecretCredential(SecretKeys.CIPHER_KEY);

            const decipher = crypto.createDecipheriv(
                algorithm,
                Buffer.from(ENCRYPTION_KEY),
                iv
            );

            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted.toString();
        } else {
            return encText;
        }
    } catch (error) {
        throw Error("Could not decrypt. Please communicate the same to the team.");
    }
};

const generateUniqueCode = async(code = "") => {
    const uniqueCode = code && code.length > 0 ? code : generator.generate({ length: 6, numbers: true }).toUpperCase();

    let checkUniqueQuery = `SELECT COUNT(code_id) AS code_count
                            FROM unique_codes
                            WHERE code_value = '${uniqueCode}'`;

    let checkUniqueResult = await Sql.runQuery(checkUniqueQuery);

    if (checkUniqueResult && checkUniqueResult.error == 0) {
        let codes = checkUniqueResult.data[0].code_count;

        if (codes > 0) {
            return generateUniqueCode();
        } else {
            return uniqueCode;
        }
    } else {
        return '';
    }
};

const secretManager = async(SecretId) => {
    let AWS_REGION = await getSecretCredential(SecretKeys.AWS_REGION);
    var client = new AWS.SecretsManager({
        region: AWS_REGION // Your region
    });

    var secret, decodedBinarySecret;
    //context.callbackWaitsForEmptyEventLoop = false;
    return new Promise((resolve, reject) => {
        client.getSecretValue({
            SecretId: SecretId
        }, function(err, data) {

            if (err) {
                if (err.code === 'DecryptionFailureException')
                // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
                // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
                else if (err.code === 'InternalServiceErrorException')
                // An error occurred on the server side.
                // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
                else if (err.code === 'InvalidParameterException')
                // You provided an invalid value for a parameter.
                // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
                else if (err.code === 'InvalidRequestException')
                // You provided a parameter value that is not valid for the current state of the resource.
                // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
                else if (err.code === 'ResourceNotFoundException')
                // We can't find the resource that you asked for.
                // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;

                reject(err);
            } else {
                // Decrypts secret using the associated KMS CMK.
                // Depending on whether the secret is a string or binary, one of these fields will be populated.
                if ('SecretString' in data) {
                    secret = data.SecretString;
                } else {
                    let buff = new Buffer(data.SecretBinary, 'base64');
                    decodedBinarySecret = buff.toString('ascii');
                }

                resolve(secret);
            }


        });
    });
}

const getSecretCredential = async(SecretId) => {
    let secretValue = SecretDetails[SecretId];

    if (secretValue && secretValue != "") {
        return secretValue
    } else {
        secretValue = await secretManager(SecretId);
        SecretDetails[SecretId] = secretValue;
        return secretValue;
    }
}

function getAttrFromString(str, node, attr) {
    var regex = new RegExp('<' + node + ' .*?' + attr + '="(.*?)"', "gi"),
        result, res = [];
    while ((result = regex.exec(str))) {
        res.push(result[1]);
    }
    return res;
}

function addBaseURL(html, baseURL) {
    let srcs = getAttrFromString(html, 'img', 'src')
    for (let src of srcs) {
        html = html.replace(src, baseURL + src)
    }
    return html;
}

const generateUniqueResourceKey = async() => {
    let uniqueKey = (Math.floor(Math.random() * 10000000000)).toString();
    let checkUniqueQuery = `SELECT resource_key_id
                            FROM resource_keys
                            WHERE resource_key = '${uniqueKey}'`;
    let checkUniqueResult = await Sql.runQuery(checkUniqueQuery);
    if (checkUniqueResult && checkUniqueResult.error == 0) {
        if (checkUniqueResult.data && checkUniqueResult.data.length > 0) {
            return generateUniqueResourceKey();
        } else {
            return uniqueKey;
        }
    } else {
        return '';
    }
}

/**
 * Generates random string
 * @returns string 
 */
 const GenerateRandomString = () => {
    return Math.random().toString(36).substr(2);
};

/**
 * Generate token
 * @returns token
 */
 const GenerateToken = () => {
    let token = "";
    for (let i = 0; i < TOKEN_STRING_MULTIPLY_COUNT; i++) {
        token += GenerateRandomString();
    }
    return token;
};

const AddSecondsToDate = (seconds) => {
    let currentTime = new Date();
    let addedDateTime = new Date(currentTime.getTime() + (1000 * seconds));
    return dayjs(addedDateTime).utc().format(DATE_FORMAT.DATE_TIME);
}

module.exports = {
    encrypt: encryptString,
    decrypt: decryptString,
    generateUniqueCode: generateUniqueCode,
    secretManager: secretManager,
    getSecretCredential: getSecretCredential,
    getAttrFromString: getAttrFromString,
    addBaseURL: addBaseURL,
    generateUniqueResourceKey: generateUniqueResourceKey,
    GenerateToken: GenerateToken,
    GenerateRandomString: GenerateRandomString,
    AddSecondsToDate: AddSecondsToDate
};