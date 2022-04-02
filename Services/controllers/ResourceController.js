const fs = require("fs");
const path = require("path");
const FileType = require("file-type");
var xl = require('excel4node');
const uuid = require("uuid");
const Sql = require('../config/database/sql');
const Logger = require("../utils/logger");
const UploadFile = require("../utils/upload");
const CommonFunctions = require('../functions/CommonFunctions');
const Utilities = require("../utils/utilities");
const RootPathControl = require("../utils/path");
const SINGLE_VALUE_CONST= require("../utils/SingleValueConstants");
const { ConfigKey, ResourceExportType, STATUS_CODES, Status, OtherConstants, ResourceGroups } = require("../utils/Constants");

const ViewLanguageResources = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
        let dataObject = {};
        dataObject.errors = {};
        let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : OtherConstants.Default_View_Records;
        let viewPage = req.body.view_page ? parseInt(req.body.view_page) : OtherConstants.Default_View_Page;
        let searchString = req.body.search_string ? "%" + req.body.search_string.trim() + "%" : "";
        let sortColType = req.body.sort_col_type ? req.body.sort_col_type.trim() : "ASC";
        let sortByCondition = `resource_keys.group_id ${sortColType}, resource_keys.resource_key_id ${sortColType}`;
        let offsetRecords = viewRecords * (viewPage - 1);
        let whereCondition = `resources.is_active = ${Status.Active_Status}`;
        if (searchString.length > 0) {
            whereCondition += ` AND (resource_groups.group_name LIKE '${searchString}' OR resource_keys.resource_key LIKE '${searchString}' OR resources.resource_value LIKE '${searchString}')`;
        }

        //get all resources list
        let resourcesQuery = `SELECT resource_keys.resource_key_id, resource_keys.resource_key, resource_groups.group_id, resource_groups.group_name
                                        FROM resources
                                        INNER JOIN resource_keys ON resources.resource_key_id = resource_keys.resource_key_id
                                        INNER JOIN resource_groups ON resource_keys.group_id = resource_groups.group_id
                                        INNER JOIN languages ON resources.language_id = languages.language_id
                                        WHERE ${whereCondition}
                                        GROUP BY resource_keys.resource_key_id
                                        ORDER BY ${sortByCondition}`;

        let resourcesResult = await Sql.runQuery(resourcesQuery);

        if (resourcesResult && resourcesResult.error == 0) {
            let resourcesData = resourcesResult.data;
            let resources = [];
            let resourceCount = 0;
            let viewCount = 0;

            if (resourcesData && resourcesData.length > 0) {
                resourcesData.map(data => {
                    if (viewCount < viewRecords) {
                        let resourceKey = data.resource_key;
                        if (parseInt(resourceKey) > 0) { }
                        else {
                            if (resourceCount >= offsetRecords) {
                                resources.push({
                                    resource_key_id: data.resource_key_id,
                                    resource_key: data.resource_key,
                                    group_id: data.group_id,
                                    group_name: data.group_name,
                                });
                                viewCount++;
                            }
                        }
                    }
                    resourceCount += 1;
                });
            }
            dataObject.totalCount = resourceCount;
            dataObject.resources = resources;
            statusCode = STATUS_CODES.OK;
        }
        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "ViewLanguageResources", error.toString());
        next(error);
    }
};

const ViewSingleResource = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let validate = true;
        let dataObject = {};
        dataObject.errors = {};
        let resourceKeyId = req.body.resource_key_id ? req.body.resource_key_id : 0;

        if (resourceKeyId <= 0) {
            validate = false;
            dataObject.errors.resource_key_id = "FIELD_REQUIRED";
        }

        if (validate) {

            //fetch resource value for every active language
            let resourceQuery = await Sql.runQuery(`SELECT resources.resource_id, resources.language_id, resources.resource_value, resources.place_holder_value, resources.info_value, resource_keys.resource_key, resource_keys.group_id, resource_groups.group_name, languages.language_name
                    FROM resources
                    INNER JOIN resource_keys ON resources.resource_key_id = resource_keys.resource_key_id
                    INNER JOIN resource_groups ON resource_keys.group_id = resource_groups.group_id
                    INNER JOIN languages ON resources.language_id = languages.language_id
                    WHERE resources.resource_key_id = ${resourceKeyId} AND languages.is_active = ${Status.Active_Status}`);

            if (resourceQuery && resourceQuery.error == 0) {
                let resourceResult = resourceQuery.data;
                let resources = [];
                if (resourceResult && resourceResult.length > 0) {
                    let apiBaseUrl = SINGLE_VALUE_CONST.ApiBaseUrl;
                    resourceResult.map(data => {
                        resources.push({
                            resource_id: data.resource_id,
                            resource_key: data.resource_key,
                            language_id: data.language_id,
                            language_name: data.language_name,
                            group_id: data.group_id,
                            group_name: data.group_name,
                            resource_value: Utilities.addBaseURL(data.resource_value, apiBaseUrl),
                            place_holder_value: data.place_holder_value,
                            info_value: data.info_value
                        });
                    });
                }
                statusCode = STATUS_CODES.OK;
                dataObject.resources = resources;
            } else {
                statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
            }
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "ViewSingleResource", error.toString());
        next(error);
    }
};

const EditLanguageResources = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let userId = res.locals.userId;
        let validate = "";
        let dataObject = {};
        dataObject.errors = {};
        let resourceKeyId = req.body.resource_key_id ? req.body.resource_key_id : 0;
        let resourceData = req.body.resource_data ? req.body.resource_data : [];

        if (resourceKeyId <= 0) {
            validate = false;
            dataObject.errors.resource_key_id = "FIELD_REQUIRED";
        }

        if (resourceData.length <= 0) {
            validate = false;
            dataObject.errors.resource_data = "FIELD_REQUIRED";
        } else {
            //check if all active language resources are found
            let countQuery = await Sql.runQuery(`SELECT COUNT(language_id) AS language_count
                    FROM languages
                    WHERE is_active = ${Status.Active_Status}`);

            if (countQuery && countQuery.error == 0) {
                let countResult = countQuery.data;

                //update the record
                if (countResult && countResult.length > 0) {
                    let languageCount = countResult[0].language_count;

                    let resourceLength = 0;
                    for (let resource of resourceData) {
                        if (resource) {
                            resourceLength++;
                        }
                    }

                    if (resourceLength != languageCount) {
                        dataObject.errors.resource_data = "RESOURCES_VALIDATION";
                        validate = false;
                    }
                } else {
                    validate = false;
                }
            } else {
                validate = false;
            }
        }


        if (validate) {
            let recordUpdated = true;

            let processData = resourceData.map(async (resource, index) => {
                if (resource) {

                    let languageId = index;
                    let resourceValue = resource.resource_value;
                    let placeholderValue = resource.place_holder_value;

                    if (languageId > 0 && resourceValue != "") {

                        //check if record exists
                        let existsQuery = await Sql.runQuery(`SELECT resource_id 
                                    FROM resources
                                    WHERE resource_key_id = ${resourceKeyId} AND language_id = ${languageId}
                                    LIMIT 1`);

                        if (existsQuery && existsQuery.error == 0) {
                            let existsResult = existsQuery.data;

                            //update the record
                            if (existsResult && existsResult.length > 0) {
                                let resourceId = existsResult[0].resource_id;

                                let updateResourceQuery = `UPDATE resources SET resource_value = '${resourceValue}', place_holder_value = '${placeholderValue}' WHERE resource_id = ${resourceId}`;

                                let updateResourceResult = await Sql.runQuery(updateResourceQuery);
                                if (updateResourceResult && updateResourceResult.error > 0) {
                                    recordUpdated = false;
                                }

                            }
                            //insert new record
                            else {
                                let insertResourceQuery = `INSERT INTO resources (resource_value, place_holder_value, resource_key_id, language_id, created_at, created_by_id, updated_at, updated_by_id ) VALUES('${resourceValue}', '${placeholderValue}', ${resourceKeyId}, ${languageId}, UTC_TIMESTAMP(), ${userId}, UTC_TIMESTAMP(), ${userId})`;

                                let insertResourceResult = await Sql.runQuery(insertResourceQuery);
                                if (insertResourceResult && insertResourceResult.error > 0) {
                                    recordUpdated = false;
                                }
                            }
                        } else {
                            recordUpdated = false;
                        }
                    } else {
                        recordUpdated = false;
                    }
                }
            });

            await Promise.all(processData);

            if (recordUpdated) {
                statusCode = STATUS_CODES.OK;
            } else {
                statusCode = STATUS_CODES.DATA_SAVE_ERROR;
            }
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "EditLanguageResources", error.toString());
        next(error);
    }
};

const ExportLanguageResources = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.DATA_SAVE_ERROR;
        let dataObject = {};
        dataObject.errors = {};
        let exportType = req.body.export_type ? req.body.export_type.trim() : "";
        let exportExcelFile = "";
        let languages = [];

        if (exportType && Object.values(ResourceExportType).includes(exportType)) {

            //get all active languages
            let languageFetch = await Sql.runQuery(
                `SELECT language_id, language_name 
                FROM languages 
                WHERE is_active = ${Status.Active_Status} 
                ORDER BY language_id ASC`
            );

            if (languageFetch && languageFetch.error == 0) {
                if (languageFetch.data && languageFetch.data.length > 0) {
                    for (let lang of languageFetch.data) {
                        languages.push({
                            language_id: lang.language_id,
                            language_name: lang.language_name
                        });
                    }
                }

                //get resource keys
                let exportResult = await Sql.runQuery(
                    `SELECT resource_keys.resource_key_id, resource_keys.resource_key, resource_groups.group_id, resource_groups.group_name
                    FROM resource_keys 
                    INNER JOIN resource_groups ON resource_keys.group_id = resource_groups.group_id
                    WHERE resource_keys.is_active = ${Status.Active_Status}
                    ORDER BY resource_keys.group_id ASC, resource_keys.resource_key_id ASC`
                );

                if (exportResult && exportResult.error == 0) {
                    if (exportResult.data && exportResult.data.length > 0) {
                        var wb = new xl.Workbook();
                        var statusSheet = wb.addWorksheet('Sheet 1');
                        let groupIdColumnNo = 1;
                        let groupNameColumnNo = 2;
                        let resourceKeyIdColumnNo = 3;
                        let resourceKeyColumnNo = 4;
                        let languageIdColumnNo = 5;
                        let languageNameColumnNo = 6;
                        let resourceValueColumnNo = 7;
                        let placeholderColumnNo = 8;

                        let groupIdColumn = "group_id";
                        let groupNameColumn = "group_name";
                        let resourceKeyIdColumn = "resource_key_id";
                        let resourceKeyColumn = "resource_key";
                        let languageIdColumn = "language_id";
                        let languageNameColumn = "language_name";
                        let resourceValueColumn = "resource_value";
                        let placeholderColumn = "place_holder_value";

                        if (exportType == ResourceExportType.WITH_DATA) {
                            statusSheet.cell(1, groupIdColumnNo).string(groupIdColumn);
                            statusSheet.cell(1, groupNameColumnNo).string(groupNameColumn);
                            statusSheet.cell(1, resourceKeyIdColumnNo).string(resourceKeyIdColumn);
                            statusSheet.cell(1, resourceKeyColumnNo).string(resourceKeyColumn);
                            statusSheet.cell(1, languageIdColumnNo).string(languageIdColumn);
                            statusSheet.cell(1, languageNameColumnNo).string(languageNameColumn);
                            statusSheet.cell(1, resourceValueColumnNo).string(resourceValueColumn);
                            statusSheet.cell(1, placeholderColumnNo).string(placeholderColumn);
                        } else if (exportType == ResourceExportType.ONLY_FORMAT) {
                            resourceValueColumnNo = 6;
                            placeholderColumnNo = 7;

                            statusSheet.cell(1, groupIdColumnNo).string(groupIdColumn);
                            statusSheet.cell(1, groupNameColumnNo).string(groupNameColumn);
                            statusSheet.cell(1, resourceKeyIdColumnNo).string(resourceKeyIdColumn);
                            statusSheet.cell(1, resourceKeyColumnNo).string(resourceKeyColumn);
                            statusSheet.cell(1, languageIdColumnNo).string(languageIdColumn);
                            statusSheet.cell(1, resourceValueColumnNo).string(resourceValueColumn);
                            statusSheet.cell(1, placeholderColumnNo).string(placeholderColumn);
                        }
                        let totalRecords = 0;
                        var rowCount = 1;

                        const processExport = exportResult.data.map(async data => {
                            let resourceKey = data.resource_key;
                            if (parseInt(resourceKey) > 0) { }
                            else {
                                let resourceKeyId = data.resource_key_id;

                                if (exportType == ResourceExportType.ONLY_FORMAT) {
                                    rowCount += 1;

                                    statusSheet.cell(rowCount, groupIdColumnNo).string(data.group_id.toString());
                                    statusSheet.cell(rowCount, groupNameColumnNo).string(data.group_name);
                                    statusSheet.cell(rowCount, resourceKeyIdColumnNo).string(resourceKeyId.toString());
                                    statusSheet.cell(rowCount, resourceKeyColumnNo).string(resourceKey ? resourceKey.toString() : "");
                                    statusSheet.cell(rowCount, languageIdColumnNo).string("");
                                    statusSheet.cell(rowCount, resourceValueColumnNo).string("");
                                    statusSheet.cell(rowCount, placeholderColumnNo).string("");

                                    totalRecords += 1;
                                } else {

                                    //get all resources for every active languages
                                    if (languages.length > 0) {
                                        const processLang = languages.map(async lang => {
                                            let langId = lang.language_id;
                                            let langName = lang.language_name;
                                            let resourceValue = '';
                                            let resourcePlaceholder = '';

                                            let dataQuery = `SELECT resource_id, resource_value, place_holder_value 
                                                    FROM resources
                                                    WHERE resource_key_id = ${resourceKeyId} AND language_id = ${langId}
                                                    LIMIT 1`;

                                            let dataFetch = await Sql.runQuery(dataQuery);

                                            if (dataFetch && dataFetch.error == 0) {
                                                let dataResult = dataFetch.data;

                                                if (dataResult && dataResult.length > 0) {
                                                    let resourceData = dataResult[0];
                                                    resourceValue = resourceData.resource_value;
                                                    resourcePlaceholder = resourceData.place_holder_value;
                                                }
                                            }

                                            if (exportType == ResourceExportType.WITH_DATA) {
                                                rowCount += 1;

                                                statusSheet.cell(rowCount, groupIdColumnNo).string(data.group_id.toString());
                                                statusSheet.cell(rowCount, groupNameColumnNo).string(data.group_name);
                                                statusSheet.cell(rowCount, resourceKeyIdColumnNo).string(resourceKeyId.toString());
                                                statusSheet.cell(rowCount, resourceKeyColumnNo).string(resourceKey ? resourceKey.toString() : "");
                                                statusSheet.cell(rowCount, languageIdColumnNo).string(langId.toString());
                                                statusSheet.cell(rowCount, languageNameColumnNo).string(langName);
                                                statusSheet.cell(rowCount, resourceValueColumnNo).string(resourceValue ? resourceValue.toString() : "");
                                                statusSheet.cell(rowCount, placeholderColumnNo).string(resourcePlaceholder ? resourcePlaceholder.toString() : "");

                                                totalRecords += 1;
                                            }
                                        });

                                        await Promise.all(processLang);
                                    }
                                }
                            }
                        });

                        await Promise.all(processExport);

                        if (totalRecords > 0) {
                            await new Promise(async function (resolve, reject) {

                                //create unique file name
                                let filename = "";
                                if (exportType == ResourceExportType.WITH_DATA) {
                                    filename = 'uploads/' + uuid.v4() + "_$_ResourcesData.xlsx";
                                } else if (exportType == ResourceExportType.ONLY_FORMAT) {
                                    filename = 'uploads/' + uuid.v4() + "_$_ResourcesFormat.xlsx";
                                }

                                if (filename) {
                                    await wb.write(filename, async function (err, stats) {
                                        if (err) {
                                            reject(true);
                                        } else {

                                            //move to s3
                                            exportExcelFile = await UploadFile.uploadFileFromLocal(filename);

                                            if (exportExcelFile) {
                                                resolve(true);
                                            } else {
                                                reject(true);
                                            }

                                        }
                                    });
                                }
                            });
                        }
                    }

                    dataObject.export_file = exportExcelFile;
                    statusCode = STATUS_CODES.OK;

                }
            }
        } else {
            statusCode = STATUS_CODES.VALIDATION_ERROR;
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "ExportLanguageResources", error.toString());
        next(error);
    }
};

const UploadBulkResources = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let userId = res.locals.userId;
        let dataObject = {};
        dataObject.errors = {};
        let bulkResourceFile = '';
        let resourceSuccessCount = 0;
        let resourceFailedCount = 0;
        let resourceRows = [];
        let resourceValidate = true;
        let DataFile = false;
        let FormatFile = false;

        if (!req.files || Object.keys(req.files).length === 0) {
            resourceValidate = false;
            dataObject.errors.bulk_upload = "FILE_MISSING";
        } else {
            if (req.files.bulk_upload && (await FileType.fromBuffer(req.files.bulk_upload.data)).ext === "xlsx") {

                const fileLocalSaveTemp = await UploadFile.uploadFileLocal(
                    req.files.bulk_upload
                );

                const excelFilePath = path.join(
                    RootPathControl.rootPath,
                    fileLocalSaveTemp
                );

                const schema = {
                    group_id: {
                        prop: "group_id",
                        type: Number,
                    },
                    group_name: {
                        prop: "group_name",
                        type: String,
                    },
                    resource_key_id: {
                        prop: "resource_key_id",
                        type: Number,
                    },
                    resource_key: {
                        prop: "resource_key",
                        type: String,
                    },
                    language_id: {
                        prop: "language_id",
                        type: Number,
                    },
                    language_name: {
                        prop: "language_name",
                        type: String,
                    },
                    resource_value: {
                        prop: "resource_value",
                        type: String,
                    },
                    place_holder_value: {
                        prop: "place_holder_value",
                        type: String,
                    }
                };

                let rows = await CommonFunctions.getRecordsFromExcel(excelFilePath, schema);
                resourceRows = rows.rows ? rows.rows : [];
                fs.unlinkSync(excelFilePath);
                //check if all the header is present
                if (resourceRows.length > 0) {
                    resourceValidate = true;
                    let sampleRecord = resourceRows[0];
                    if (sampleRecord.language_name != "") {
                        DataFile = true;
                    } else {
                        FormatFile = true;
                    }
                } else {
                    resourceValidate = false;
                }


                if (resourceValidate) {
                    dataObject.errors.bulk_upload = "";
                } else {
                    validate = false;
                    dataObject.errors.bulk_upload = "EXCEL_FILE_MISSING";
                }
            }
        }


        if (resourceValidate) {
            let totalRowsResources = resourceRows.length;
            let taskList = [];

            //check for total records
            if (totalRowsResources > 0) {

                var wb = new xl.Workbook();
                var statusSheet = wb.addWorksheet('Sheet 1');
                statusSheet.cell(1, 1).string('group_id');
                statusSheet.cell(1, 2).string('group_name');
                statusSheet.cell(1, 3).string('resource_key_id');
                statusSheet.cell(1, 4).string('resource_key');
                statusSheet.cell(1, 5).string('language_id');

                if (DataFile) {
                    statusSheet.cell(1, 6).string('language_name');
                    statusSheet.cell(1, 7).string('resource_value');
                    statusSheet.cell(1, 8).string('place_holder_value');
                    statusSheet.cell(1, 9).string('status');
                } else {
                    statusSheet.cell(1, 6).string('resource_value');
                    statusSheet.cell(1, 7).string('place_holder_value');
                    statusSheet.cell(1, 8).string('status');
                }

                var rowCount = -1;

                //loop through each record
                const resourceNextLoop = async (taskList) => {
                    rowCount += 1;

                    if (rowCount < resourceRows.length) {
                        let RowItem = resourceRows[rowCount];

                        //check for the record and add/edit the resources
                        let newTask = await AddEditResources(RowItem, rowCount);

                        //add to the task list
                        taskList.push(newTask);

                        return resourceNextLoop(taskList);
                    } else {

                        //after looping through all the records, write the excel file
                        taskList.push(await new Promise(async function (resolve, reject) {

                            //create unique file name
                            let filename = 'uploads/' + uuid.v4() + "_$_ResourceStatus.xlsx";

                            await wb.write(filename, async function (err, stats) {
                                if (err) {
                                    reject(true);
                                } else {

                                    //move to s3
                                    bulkResourceFile = await UploadFile.uploadFileFromLocal(filename);

                                    if (bulkResourceFile) {
                                        resolve(true);
                                    } else {
                                        reject(true);
                                    }

                                }
                            });

                        }));

                        return taskList;
                    }
                }

                //validate the record and add the resource
                async function AddEditResources(elRowItem, index) {
                    let task = await new Promise(async function (resolve, reject) {

                        let statusMsg = "Failed : ";
                        let msgCount = 0;
                        let rowNumber = index + 2;
                        let rowStatus = true;
                        let errorFlag = false;

                        let groupIdColumnNumber = 1;
                        let groupColumnNumber = 2;
                        let keyIdColumnNumber = 3;
                        let keyColumnNumber = 4;
                        let languageIdColumnNumber = 5;
                        let languageColumnNumber = 6;
                        let valueColumnNumber = 7;
                        let placeholderColumnNumber = 8;
                        let statusColumnNumber = 9;

                        if (FormatFile) {
                            valueColumnNumber = 6;
                            placeholderColumnNumber = 7;
                            statusColumnNumber = 8;
                        }

                        const groupId = elRowItem.group_id ? parseInt(elRowItem.group_id) : 0;
                        const groupName = elRowItem.group_name ? elRowItem.group_name.toString().trim() : "";
                        const resourceKeyId = elRowItem.resource_key_id ? parseInt(elRowItem.resource_key_id) : 0;
                        const resourceKey = elRowItem.resource_key ? elRowItem.resource_key.toString().trim() : "";
                        const languageId = elRowItem.language_id ? parseInt(elRowItem.language_id) : 0;
                        const languageName = elRowItem.language_name ? elRowItem.language_name.toString().trim() : "";
                        const resourceValue = elRowItem.resource_value ? elRowItem.resource_value.toString().trim() : "";
                        const placeholderValue = elRowItem.place_holder_value ? elRowItem.place_holder_value.toString().trim() : "";

                        //write excel file with the existing data
                        statusSheet.cell(rowNumber, groupIdColumnNumber).number(groupId);
                        statusSheet.cell(rowNumber, groupColumnNumber).string(groupName);
                        statusSheet.cell(rowNumber, keyIdColumnNumber).number(resourceKeyId);
                        statusSheet.cell(rowNumber, keyColumnNumber).string(resourceKey);
                        statusSheet.cell(rowNumber, languageIdColumnNumber).number(languageId);
                        if (DataFile) {
                            statusSheet.cell(rowNumber, languageColumnNumber).string(languageName);
                        }
                        statusSheet.cell(rowNumber, valueColumnNumber).string(resourceValue);
                        statusSheet.cell(rowNumber, placeholderColumnNumber).string(placeholderValue);

                        //check group id
                        if (groupId > 0 && groupName != "") {

                            //check if group id exists
                            let groupQuery = await Sql.runQuery(`SELECT group_id FROM resource_groups WHERE group_id = ${groupId} AND group_name = '${groupName}'`);

                            if (groupQuery && groupQuery.error == 0) {
                                let groupData = groupQuery.data;

                                if (groupData.length <= 0) {
                                    statusMsg += "Invalid Group";
                                    msgCount += 1;
                                    rowStatus = false;
                                }
                            } else {
                                errorFlag = true;
                            }
                        } else {
                            statusMsg += "Invalid Group";
                            msgCount += 1;
                            rowStatus = false;
                        }

                        //check resource key
                        if (resourceKeyId > 0 && resourceKey != "") {

                            //check if resource key exists
                            let resourceQuery = await Sql.runQuery(`SELECT resource_keys.resource_key_id 
                                        FROM resource_keys 
                                        INNER JOIN resource_groups ON resource_keys.group_id = resource_groups.group_id
                                        WHERE resource_keys.resource_key_id = ${resourceKeyId} AND resource_keys.resource_key = '${resourceKey}' AND resource_keys.group_id = ${groupId} 
                                        LIMIT 1`);

                            if (resourceQuery && resourceQuery.error == 0) {
                                let resourceData = resourceQuery.data;

                                if (resourceData.length <= 0) {
                                    if (msgCount > 0) {
                                        statusMsg += ", ";
                                    }
                                    statusMsg += "Invalid Resource Key";
                                    msgCount += 1;
                                    rowStatus = false;
                                }
                            } else {
                                errorFlag = true;
                            }
                        } else {
                            if (msgCount > 0) {
                                statusMsg += ", ";
                            }
                            statusMsg += "Invalid Resource Key";
                            msgCount += 1;
                            rowStatus = false;
                        }

                        //check language
                        if (languageId > 0) {

                            //check if language id exists
                            let languageQuery = await Sql.runQuery(`SELECT language_id FROM languages WHERE language_id = ${languageId} `);

                            if (languageQuery && languageQuery.error == 0) {
                                let languageData = languageQuery.data;

                                if (languageData.length <= 0) {
                                    if (msgCount > 0) {
                                        statusMsg += ", ";
                                    }
                                    statusMsg += "INVALID_LANGUAGE";
                                    msgCount += 1;
                                    rowStatus = false;
                                }
                            } else {
                                errorFlag = true;
                            }
                        } else {
                            if (msgCount > 0) {
                                statusMsg += ", ";
                            }
                            statusMsg += "INVALID_LANGUAGE";
                            msgCount += 1;
                            rowStatus = false;
                        }

                        //check resource value
                        if (resourceValue == "") {
                            if (msgCount > 0) {
                                statusMsg += ", ";
                            }
                            statusMsg += "Invalid Resource Value";
                            msgCount += 1;
                            rowStatus = false;
                        }

                        //check for any error
                        if (errorFlag == false) {

                            //check for validation error
                            if (rowStatus) {

                                //check if record already exists
                                let existsQuery = await Sql.runQuery(`SELECT resource_id 
                                        FROM resources 
                                        WHERE resource_key_id = ${resourceKeyId} AND language_id = ${languageId}
                                        LIMIT 1`);

                                if (existsQuery && existsQuery.error == 0) {
                                    let RecordData = existsQuery.data;

                                    //update the record
                                    if (RecordData && RecordData.length > 0) {
                                        let resourceId = RecordData[0].resource_id;
                                        let updateCond = ``;

                                        if (placeholderValue != "") {
                                            updateCond = `, place_holder_value = '${placeholderValue}'`;
                                        }

                                        let updateResourceQuery = await Sql.runQuery(`UPDATE resources SET resource_value = '${resourceValue}' ${updateCond} WHERE resource_id = ${resourceId}`);

                                        if (updateResourceQuery && updateResourceQuery.error == 0) {

                                            //successfully updated the resource
                                            resourceSuccessCount += 1;
                                            statusMsg = "Success";
                                            statusSheet.cell(rowNumber, statusColumnNumber).string(statusMsg);
                                            resolve(true);
                                        } else {
                                            resourceFailedCount += 1;
                                            statusMsg = "Failed : Error while updating";
                                            statusSheet.cell(rowNumber, statusColumnNumber).string(statusMsg);
                                            resolve(true);
                                        }
                                    }
                                    //insert new record
                                    else {

                                        let newResourceQuery = await Sql.runQuery(`INSERT INTO resources(resource_key_id, language_id, resource_value, place_holder_value, is_active, created_at, created_by_id, updated_at, updated_by_id) VALUES (${resourceKeyId}, ${languageId}, '${resourceValue}', '${placeholderValue}', ${Status.Active_Status}, UTC_TIMESTAMP(), ${userId}, UTC_TIMESTAMP(), ${userId})`);

                                        if (newResourceQuery && newResourceQuery.error == 0) {

                                            //successfully added the resource
                                            resourceSuccessCount += 1;
                                            statusMsg = "Success";
                                            statusSheet.cell(rowNumber, statusColumnNumber).string(statusMsg);
                                            resolve(true);
                                        } else {
                                            resourceFailedCount += 1;
                                            statusMsg = "Failed : Error while adding";
                                            statusSheet.cell(rowNumber, statusColumnNumber).string(statusMsg);
                                            resolve(true);
                                        }
                                    }
                                } else {
                                    resourceFailedCount += 1;
                                    statusMsg = "Failed : Error while adding";
                                    statusSheet.cell(rowNumber, statusColumnNumber).string(statusMsg);
                                    resolve(true);
                                }

                            } else {
                                resourceFailedCount += 1;
                                statusSheet.cell(rowNumber, statusColumnNumber).string(statusMsg);
                                resolve(true);
                            }
                        } else {
                            resourceFailedCount += 1;
                            statusMsg = "Failed : Error while adding";
                            statusSheet.cell(rowNumber, statusColumnNumber).string(statusMsg);
                            resolve(true);
                        }

                    });

                    return task;
                }

                //start looping through all the records of the resources
                taskList = await resourceNextLoop(taskList);

                //after all the tasks are done, return back the status to the client
                await Promise.all(taskList).then(() => {

                    if (bulkResourceFile) {
                        statusCode = STATUS_CODES.OK;
                        dataObject.bulkResourceFile = bulkResourceFile;
                        dataObject.resourceSuccessCount = resourceSuccessCount;
                        dataObject.resourceFailedCount = resourceFailedCount;
                    }
                });

            } else {
                statusCode = STATUS_CODES.EXCEL_FILE_MISSING;
            }
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();

    } catch (error) {
        Logger.servicesLogger(req, "UploadBulkResources", error.toString());
        next(error);
    }
};

const GetPageResources = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
        const dataObject = {};
        let language_id = req.body.language_id ? parseInt(req.body.language_id) : 0;
        const group_id = req.body.group_id ? req.body.group_id : "";
        const commonFlag = req.body.common ? req.body.common : false;
        const languageFlag = req.body.languageFlag ? req.body.languageFlag : false;

        if (group_id != "") {
            let defaultLanguage = 0;

            if (language_id == 0) {
                defaultLanguage = await CommonFunctions.getDefaultLanguage();
                language_id = defaultLanguage;
            }

            if (language_id > 0) {
                let whereCondition = `AND ( resource_keys.group_id IN (${group_id + ',' + ResourceGroups.ERROR_CODES})`;

                if (commonFlag) {
                    whereCondition += ` OR resource_groups.group_name = 'COMMON')`;
                } else {
                    whereCondition += `)`;
                }

                //fetch all resource data for the particular group
                let resourceQuery = `SELECT resource_keys.resource_key_id, resource_keys.resource_key, resource_keys.group_id, resource_keys.is_required, resource_keys.min_length, resource_keys.max_length, resources.resource_value, resources.place_holder_value, resources.info_value
                                            FROM resource_keys 
                                            INNER JOIN resource_groups ON resource_keys.group_id = resource_groups.group_id
                                            INNER JOIN resources ON resource_keys.resource_key_id = resources.resource_key_id
                                            WHERE resource_keys.is_active = ${Status.Active_Status} AND language_id = ${language_id} ${whereCondition}`;

                let resourceResult = await Sql.runQuery(resourceQuery);

                if (resourceResult.error == 0) {
                    let resourceData = resourceResult.data;
                    let resources = [];
                    let languages = [];

                    if (resourceData && resourceData.length > 0) {
                        resourceData.map(async data => {
                            resources.push({
                                resource_key_id: data.resource_key_id,
                                resource_key: data.resource_key,
                                group_id: data.group_id,
                                is_required: data.is_required,
                                min_length: data.min_length,
                                max_length: data.max_length,
                                resource_value: data.resource_value,
                                place_holder_value: data.place_holder_value,
                                info_value: data.info_value
                            });
                        });

                        if (languageFlag) {

                            // get list of all languages
                            let languageQuery = `SELECT language_id, language_name, language_code, is_default FROM languages 
                                                WHERE is_active = ${Status.Active_Status}`;

                            let languageResult = await Sql.runQuery(languageQuery);

                            if (languageResult.error == 0) {
                                let languageData = languageResult.data;

                                if (languageData && languageData.length > 0) {
                                    languageData.map(async language => {
                                        languages.push({
                                            language_id: language.language_id,
                                            language_name: language.language_name,
                                            language_code: language.language_code,
                                            is_default: language.is_default
                                        });
                                    });
                                }
                            }
                        }
                    }
                    dataObject.resources = resources;
                    dataObject.languages = languages;
                    dataObject.defaultLanguage = defaultLanguage;
                    statusCode = STATUS_CODES.OK;
                }
            } else {
                statusCode = STATUS_CODES.VALIDATION_ERROR;
            }
        } else {
            statusCode = STATUS_CODES.VALIDATION_ERROR;
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "GetPageResources", error.toString());
        next(error);
    }
};

module.exports = {
    ViewLanguageResources,
    ViewSingleResource,
    EditLanguageResources,
    ExportLanguageResources,
    UploadBulkResources,
    GetPageResources
}