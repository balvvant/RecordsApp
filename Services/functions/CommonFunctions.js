const Sql = require('../config/database/sql');
const PDFDocument = require("pdfkit");
const fs = require("fs");
const readXlsxFile = require("read-excel-file/node");
const {STATUS_CODES, Status, VALIDATION_FIELD_TYPES} = require("../utils/Constants");


const sortByColumn = (listedData, columnName, sortBy) => {

    if (listedData.length > 0) {
        //sort by desc	
        if (sortBy.toLowerCase() == 'desc') {
            listedData.sort((a, b) => (a[columnName] < b[columnName]) ? 1 : ((b[columnName] < a[columnName]) ? -1 : 0));
        }
        //sort by asc	
        else {
            listedData.sort((a, b) => (a[columnName] > b[columnName]) ? 1 : ((b[columnName] > a[columnName]) ? -1 : 0));
        }
    }

    return listedData;

}

const getDefaultLanguage = async () => {
    let languageId = 0;
    let languageQuery = await Sql.runQuery(`SELECT language_id 
        FROM languages 
        WHERE is_default = ${Status.Active_Status} AND is_active = ${Status.Active_Status}
        LIMIT 1`);
    if (languageQuery && languageQuery.error == 0) {
        if (languageQuery.data && languageQuery.data.length > 0) {
            languageId = languageQuery.data[0].language_id;
        }
    }
    return languageId;
}

const getResourcesKeys = async (groupIds) => {
    let resources = [];
    if (groupIds != "") {
        let resourceKeysResult = await Sql.runQuery(
            `SELECT resource_keys.resource_key_id, resource_keys.resource_key, resource_keys.field_type, resource_keys.group_id, resource_keys.is_required, resource_keys.min_length, resource_keys.max_length
            FROM resource_keys
            INNER JOIN resource_groups ON resource_keys.group_id = resource_groups.group_id
            WHERE resource_keys.group_id IN (${groupIds}) AND resource_keys.is_active = ${Status.Active_Status}`
        );

        if (resourceKeysResult && resourceKeysResult.error == 0) {
            if (resourceKeysResult.data && resourceKeysResult.data.length > 0) {
                for (let resource of resourceKeysResult.data) {
                    resources.push({
                        resource_key_id: resource.resource_key_id,
                        resource_key: resource.resource_key,
                        field_type: resource.field_type,
                        group_id: resource.group_id,
                        is_required: resource.is_required,
                        min_length: resource.min_length,
                        max_length: resource.max_length,
                    });
                }
            }
        }
    }
    return resources;
}

const getSingleResourceFromResources = (resource_key, resources) => {
    let resource = {};
    if (resources && resources.length > 0) {
        let resourceIndex = resources.findIndex(e => e.resource_key == resource_key);
        if (resourceIndex >= 0) {
            resource = resources[resourceIndex];
        }
    }
    return resource;
}

const getResources = async (languageID, groupIds) => {
    let resources = [];
    let statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
    if (groupIds != "") {
        if (languageID == 0) {
            languageID = await CommonFunctions.getDefaultLanguage();
        }
        if (languageID > 0) {
            let whereCondition = `AND resource_keys.group_id IN (${groupIds})`;
            //fetch all resource data for the particular group
            let resourceQuery = `SELECT resource_keys.resource_key_id, resource_keys.resource_key, resource_keys.group_id, resource_keys.is_required, resource_keys.min_length, resource_keys.max_length, resources.resource_value, resources.place_holder_value, resources.info_value, resource_keys.field_type
                                        FROM resource_keys 
                                        INNER JOIN resource_groups ON resource_keys.group_id = resource_groups.group_id
                                        INNER JOIN resources ON resource_keys.resource_key_id = resources.resource_key_id
                                        WHERE resource_keys.is_active = ${Status.Active_Status} AND language_id = ${languageID} ${whereCondition}`;
            let resourceResult = await Sql.runQuery(resourceQuery);
            if (resourceResult.error == 0) {
                if (resourceResult.data && resourceResult.data.length > 0) {
                    resourceResult.data.map(async data => {
                        resources.push({
                            resource_key_id: data.resource_key_id,
                            resource_key: data.resource_key,
                            group_id: data.group_id,
                            is_required: data.is_required,
                            min_length: data.min_length,
                            max_length: data.max_length,
                            resource_value: data.resource_value,
                            place_holder_value: data.place_holder_value,
                            info_value: data.info_value,
                            field_type: data.field_type,
                        });
                    });
                }
                statusCode = STATUS_CODES.OK;
            }
        }
    }
    return { statusCode, resources };
}

const sortByColumnName = (listData, columnName, sortBy) => {
    if (listData.length > 0) {
        //sort by desc	
        if (sortBy == "DESC") {
            listData.sort((a, b) => (a[columnName] < b[columnName]) ? 1 : ((b[columnName] < a[columnName]) ? -1 : 0));
        }
        //sort by asc	
        else {
            listData.sort((a, b) => (a[columnName] > b[columnName]) ? 1 : ((b[columnName] > a[columnName]) ? -1 : 0));
        }
    }
    return listData;
}

const getRecordsFromExcel = async (excelFilePath, schema) => {
    let rows = [];
    try {
        if (schema) {
            rows = await readXlsxFile(excelFilePath, { schema });
        } else {
            rows = await readXlsxFile(excelFilePath);
        }
    } catch {
        rows = [];
    }
    return rows;
}

const ValidateDataAsync = async (records, recordModel, resourceGroups) => {
    let resourceKeys = await getResourcesKeys(resourceGroups);
    if (resourceKeys && resourceKeys.length > 0) {
        if (records instanceof Array) {
            for (let record of records) {
                if (ValidateDataFieldsAsync(record, recordModel, resourceKeys) == false) {
                    return false;
                }
            }
            return true;
        } else if (ValidateDataFieldsAsync(records, recordModel, resourceKeys)) {
            return true;
        }
    }
    return false;
}

const ValidateDataFieldsAsync = (record, recordModel, resourceKeys) => {
    let resource = null;
    for (let fieldKey of Object.values(recordModel)) {
        resource = resourceKeys.find(e => e.resource_key == fieldKey);
        if (resource && resource.field_type) {
            if (Object.values(VALIDATION_FIELD_TYPES).includes(resource.field_type)) {
                if (ValidateSingleFieldAsync(resource, record[fieldKey]) == false) {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
    return true;
}

const ValidateSingleFieldAsync = (resource, fieldValue) => {
    if (resource.field_type == VALIDATION_FIELD_TYPES.TEXT) {
        if (ValidateTextField(fieldValue, resource.min_length, resource.max_length, resource.is_required) == false) {
            return false;
        }
    } else if (resource.field_type == VALIDATION_FIELD_TYPES.NUMERIC || resource.field_type == VALIDATION_FIELD_TYPES.INTEGER) {
        if (ValidateNumberField(fieldValue, resource.min_length, resource.max_length, resource.is_required) == false) {
            return false;
        }
    } else if (resource.field_type == VALIDATION_FIELD_TYPES.DATE) {
        if (ValidateDateField(fieldValue, resource.min_length, resource.max_length, resource.is_required) == false) {
            return false;
        }
    }
    return true;
}

const ValidateTextField = (fieldValue, minLength, maxLength, isRequired) => {
    if (fieldValue && fieldValue.trim() != "" && minLength >= 0 && maxLength > 0) {
        return fieldValue.length >= minLength && fieldValue.length <= maxLength;
    } else if (isRequired == 0) {
        return true;
    }
    return false;
}

const ValidateNumberField = (fieldValue, minLength, maxLength, isRequired) => {
    if (fieldValue) {
        return fieldValue >= minLength && fieldValue <= maxLength;
    } else if (isRequired == 0) {
        return true;
    }
    return false;
}

const ValidateDateField = (fieldValue, minLength, maxLength, isRequired) => {
    if (fieldValue && new Date(fieldValue)) {
        let minDate = AddDaysToDate(minLength);
        let maxDate = AddDaysToDate(maxLength);
        return CompareDates(new Date(fieldValue), minDate, maxDate);
    } else if (isRequired === false) {
        return true;
    }
    return false;
}

const AddDaysToDate = (days) => {
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result;
}

const CompareDates = (date, minDate, maxDate) => {
    return date.getTime() >= minDate.getTime() && date.getTime() <= maxDate.getTime();
}

const GetLanguageList = async () => {
    let languages = [];
    let languageResult = await Sql.runQuery(
        `SELECT language_id, language_name, language_code, is_default 
        FROM languages 
        WHERE is_active = ${Status.Active_Status}`
    );
    if (languageResult.error == 0) {
        if (languageResult.data && languageResult.data.length > 0) {
            languageResult.data.map(async language => {
                languages.push({
                    language_id: language.language_id,
                    language_name: language.language_name,
                    language_code: language.language_code,
                    is_default: language.is_default
                });
            });
        }
    }
    return languages;
}

module.exports = {
    sortByColumn,
    getDefaultLanguage,
    getResourcesKeys,
    getSingleResourceFromResources,
    getResources,
    sortByColumnName,
    getRecordsFromExcel,
    ValidateDataAsync,
    GetLanguageList
}