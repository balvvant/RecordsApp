const Sql = require('../config/database/sql');
const { STATUS_CODES, Status, OtherConstants } = require("../utils/Constants");
const Logger = require("../utils/logger");

const ViewLanguages = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
        let dataObject = {};
        dataObject.errors = {};
        let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : OtherConstants.Default_View_Records;
        let viewPage = req.body.view_page ? parseInt(req.body.view_page) : OtherConstants.Default_View_Page;
        let searchString = req.body.search_string ? "%" + req.body.search_string.trim() + "%" : "";
        let sortColName = req.body.sort_col_name ? req.body.sort_col_name.trim() : "name";
        let sortColType = req.body.sort_col_type ? req.body.sort_col_type.trim() : "ASC";

        let sortCondition = `language_id ${sortColType}`;
        if (["language_id", "language_name", "language_code", "is_default"].includes(sortColName)) {
            sortCondition = `${sortColName} ${sortColType}`;
        }

        let offsetRecords = viewRecords * (viewPage - 1);
        let whereCondition = ``;

        if (searchString) {
            whereCondition += `WHERE language_name LIKE '${searchString}' OR language_code LIKE '${searchString}'`;
        }

        //get all categories
        let languageQuery = `SELECT language_id, language_name, language_code, is_default, is_active FROM languages
                                    ${whereCondition}
                                    ORDER BY ${sortCondition}
                                    LIMIT ${viewRecords} OFFSET ${offsetRecords}`;

        let languageResult = await Sql.runQuery(languageQuery);

        if (languageResult && languageResult.error == 0) {
            let languageList = languageResult.data;
            let languages = [];
            let totalCount = 0;

            if (languageList && languageList.length > 0) {
                languageList.map(languageData => {
                    let cat = {
                        language_id: languageData.language_id,
                        language_name: languageData.language_name,
                        language_code: languageData.language_code,
                        is_default: languageData.is_default,
                        is_active: languageData.is_active
                    }

                    languages.push(cat);
                });

                //get total records count
                let countQuery = `SELECT COUNT(language_id) AS total_count
                                        FROM languages
                                        ${whereCondition}
                                        ORDER BY ${sortCondition}
                                        LIMIT ${viewRecords} OFFSET ${offsetRecords}`;
                let countResult = await Sql.runQuery(countQuery);

                if (countResult && countResult.error == 0 && countResult.data) {
                    totalCount = countResult.data[0].total_count;
                }
            }

            dataObject.totalCount = totalCount;
            dataObject.languages = languages;
            statusCode = STATUS_CODES.OK;

        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "ViewLanguages", error.toString());
        next(error);
    }
};

const AddLanguage = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let userId = res.locals.userId;
        let validate = true;
        let dataObject = {};
        dataObject.errors = {};
        let languageName = req.body.language_name ? req.body.language_name : "";
        let languageCode = req.body.language_code ? req.body.language_code : "";

        if (!languageName) {
            validate = false;
            dataObject.errors.language_name = "FIELD_REQUIRED";
        }

        if (!languageCode) {
            validate = false;
            dataObject.errors.language_code = "FIELD_REQUIRED";
        }

        if (validate) {
            statusCode = STATUS_CODES.DATA_SAVE_ERROR;

            //check if cateogry exist
            let languageExistQuery = `SELECT language_id FROM languages WHERE language_name = '${languageName}' OR language_code = '${languageCode}'`;
            let languageExistResult = await Sql.runQuery(languageExistQuery);

            if (languageExistResult && languageExistResult.error == 0) {
                let languageRecord = languageExistResult.data;

                if (languageRecord && languageRecord.length <= 0) {

                    let addLanguageQuery = `INSERT INTO languages (language_name, language_code, created_at, created_by_id, updated_at,updated_by_id) VALUES('${languageName}', '${languageCode}', UTC_TIMESTAMP(), ${userId}, UTC_TIMESTAMP(), ${userId})`;
                    let addLangResult = await Sql.runQuery(addLanguageQuery);
                    if (addLangResult && addLangResult.error == 0) {
                        statusCode = STATUS_CODES.OK;
                    }
                } else {
                    statusCode = STATUS_CODES.SAME_TITLE;
                }
            }
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "AddLanguage", error.toString());
        next(error);
    }
};

const EditLanguage = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let validate = true;
        let dataObject = {};
        dataObject.errors = {};
        let languageId = req.body.language_id ? req.body.language_id : 0;
        let languageName = req.body.language_name ? req.body.language_name : "";
        let languageCode = req.body.language_code ? req.body.language_code : "";

        if (languageId < 1) {
            validate = false;
            dataObject.errors.language_id = "FIELD_REQUIRED";
        }

        if (!languageName) {
            validate = false;
            dataObject.errors.language_name = "FIELD_REQUIRED";
        }

        if (!languageCode) {
            validate = false;
            dataObject.errors.language_code = "FIELD_REQUIRED";
        }

        if (validate) {

            //check if cateogry exist
            let languageExistQuery = `SELECT language_id FROM languages WHERE language_id != ${languageId} AND (language_name = '${languageName}' OR language_code = '${languageCode}')`;
            let languageExistResult = await Sql.runQuery(languageExistQuery);

            if (languageExistResult && languageExistResult.error == 0) {
                let languageRecord = languageExistResult.data;

                if (languageRecord && languageRecord.length <= 0) {

                    let updateLanguageQuery = `UPDATE languages SET language_name = '${languageName}', language_code = '${languageCode}' WHERE language_id = ${languageId}`;

                    let updateLanguageResult = await Sql.runQuery(updateLanguageQuery);
                    if (updateLanguageResult && updateLanguageResult.error == 0) {
                        statusCode = STATUS_CODES.OK;
                    } else {
                        statusCode = STATUS_CODES.DATA_SAVE_ERROR;
                    }
                } else {
                    statusCode = STATUS_CODES.SAME_TITLE;
                }
            } else {
                statusCode = STATUS_CODES.DATA_SAVE_ERROR;
            }
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "EditLanguage", error.toString());
        next(error);
    }
};

const ActivateDeactivateLanguage = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let validate = true;
        let dataObject = {};
        dataObject.errors = {};
        let languageId = req.body.language_id ? parseInt(req.body.language_id) : 0;
        let isActive = req.body.is_active;

        if (languageId < 1) {
            validate = false;
            dataObject.errors.language_id = "FIELD_REQUIRED";
        }

        //extra validation for deactivate
        if (isActive == Status.Inactive_Status) {

            //check if it is the last active record
            let checkQuery = await Sql.runQuery(`SELECT COUNT(language_id) AS active_count FROM languages WHERE is_active = ${Status.Active_Status}`);

            if (checkQuery && checkQuery.error == 0) {

                if (checkQuery.data && checkQuery.data.length > 0) {
                    let count = checkQuery.data[0].active_count;

                    if (count <= 1) {
                        dataObject.errors.language_id = "LAST_RECORD_VALIDATION";
                        validate = false;
                    }
                } else {
                    dataObject.errors.language_id = "LAST_RECORD_VALIDATION";
                    validate = false;
                }
            } else {
                validate = false;
            }
        }

        if (validate) {

            let updateLanguageQuery = `UPDATE languages SET is_active = ${isActive} WHERE language_id = ${languageId}`;

            let updateLanguageResult = await Sql.runQuery(updateLanguageQuery);
            if (updateLanguageResult && updateLanguageResult.error == 0) {
                statusCode = STATUS_CODES.OK;
            } else {
                statusCode = STATUS_CODES.DATA_SAVE_ERROR;
            }
        }
        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "ActivateDeactivateLanguage", error.toString());
        next(error);
    }
};

module.exports = {
    ViewLanguages,
    AddLanguage,
    EditLanguage,
    ActivateDeactivateLanguage,
};