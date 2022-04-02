const request = require('request-promise');
const uuid = require("uuid");
const Sql = require('../config/database/sql');
const Logger = require("../utils/logger");
const UploadFile = require("../utils/upload");
const CommonFunctions = require('../functions/CommonFunctions');
const Utilities = require("../utils/utilities");
const SINGLE_VALUE_CONST= require("../utils/SingleValueConstants");
const { ResourceGroups, ConfigKey, STATUS_CODES, Status, OtherConstants, MenuTypeKeys, Languages, Roles, AllCategories, MENU_LOCATIONS } = require("../utils/Constants");

const ViewWebsiteMenus = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
        let dataObject = {};
        let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : OtherConstants.Default_View_Records;
        let viewPage = req.body.view_page ? parseInt(req.body.view_page) : OtherConstants.Default_View_Page;
        let searchString = req.body.search_string ? "%" + req.body.search_string.trim() + "%" : "";
        let offsetRecords = viewRecords * (viewPage - 1);
        let whereCondition = `website_menu.is_active = ${Status.Active_Status}`;
        let menuWhereCondition = whereCondition;
        let subMenuWhereCondition = whereCondition;
        if (searchString) {
            menuWhereCondition += ` AND (menu_resource_keys.resource_key LIKE '${searchString}' OR group_resources.place_holder_value LIKE '${searchString}' OR website_menu.sequence_no LIKE '${searchString}')`;
            subMenuWhereCondition += ` AND (group_resources.place_holder_value LIKE '${searchString}' OR website_menu.sequence_no LIKE '${searchString}')`;
        }
        let menuQuery = await Sql.runQuery(
            `SELECT website_menu.website_menu_id, website_menu.menu_type, menu_resource_keys.resource_key AS menu_type_value, website_menu.menu_resourcekey_id, website_menu.menu_group_id, website_menu.parent_menu_id, website_menu.sequence_no, group_resources.place_holder_value, website_menu.image_name
            FROM website_menu
            LEFT JOIN resource_keys AS group_resource_keys ON website_menu.menu_resourcekey_id = group_resource_keys.resource_key_id
            LEFT JOIN resources AS group_resources ON website_menu.menu_resourcekey_id = group_resources.resource_key_id
            INNER JOIN resource_keys AS menu_resource_keys ON website_menu.menu_type = menu_resource_keys.resource_key_id
            WHERE ${menuWhereCondition} AND parent_menu_id IS NULL AND (group_resources.place_holder_value IS NOT NULL OR (group_resources.place_holder_value IS NULL AND website_menu.image_name IS NOT NULL))
            GROUP BY website_menu.website_menu_id 
            ORDER BY website_menu.menu_type, website_menu.parent_menu_id, website_menu.sequence_no`
        );
        if (menuQuery && menuQuery.error == 0) {
            let webMenus = [];
            let menuCount = 0;
            let viewCount = 0;
            if (menuQuery.data && menuQuery.data.length > 0) {
                statusCode = STATUS_CODES.OK;
                for (let record of menuQuery.data) {
                    let menuId = record.website_menu_id;
                    let subMenuQuery = await Sql.runQuery(
                        `SELECT website_menu.website_menu_id, website_menu.sequence_no, group_resources.place_holder_value, website_menu.menu_resourcekey_id, website_menu.image_name
                        FROM website_menu
                        LEFT JOIN resource_keys AS group_resource_keys ON website_menu.menu_resourcekey_id = group_resource_keys.resource_key_id
                        LEFT JOIN resources AS group_resources ON group_resource_keys.resource_key_id = group_resources.resource_key_id
                        WHERE ${subMenuWhereCondition} AND parent_menu_id = ${menuId} 
                        GROUP BY website_menu.website_menu_id 
                        ORDER BY website_menu.sequence_no`
                    );
                    if (subMenuQuery && subMenuQuery.error == 0) {
                        if (viewCount < viewRecords && menuCount >= offsetRecords) {
                            webMenus.push({
                                website_menu_id: record.website_menu_id,
                                menu_type: record.menu_type,
                                menu_type_value: record.menu_type_value,
                                menu_resourcekey_id: record.menu_resourcekey_id,
                                menu_group_id: record.menu_group_id,
                                parent_menu_id: record.parent_menu_id,
                                parent_menu: record.parent_menu,
                                place_holder_value: record.place_holder_value,
                                sequence_no: record.sequence_no,
                                image_name: record.image_name
                            });
                            viewCount++;
                        }
                        menuCount++;
                        if (subMenuQuery.data && subMenuQuery.data.length > 0) {
                            for (let subRecord of subMenuQuery.data) {
                                if (viewCount < viewRecords && menuCount >= offsetRecords) {
                                    webMenus.push({
                                        website_menu_id: subRecord.website_menu_id,
                                        menu_type: record.menu_type,
                                        menu_type_value: record.menu_type_value,
                                        menu_resourcekey_id: subRecord.menu_resourcekey_id,
                                        menu_group_id: record.menu_group_id,
                                        parent_menu_id: menuId,
                                        parent_menu: record.place_holder_value,
                                        place_holder_value: subRecord.place_holder_value,
                                        sequence_no: subRecord.sequence_no,
                                        image_name: subRecord.image_name
                                    });
                                    viewCount++;
                                }
                                menuCount++;
                            }
                        }
                    } else {
                        statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
                        break;
                    }
                }
            }
            if (statusCode == STATUS_CODES.OK) {
                dataObject.totalCount = menuCount;
                dataObject.webMenus = webMenus;
            }
        }
        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "ViewWebsiteMenus", error.toString());
        next(error);
    }
};

const ViewStaticPages = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
        let dataObject = {};
        let viewRecords = req.body.view_records ? parseInt(req.body.view_records) : OtherConstants.Default_View_Records;
        let viewPage = req.body.view_page ? parseInt(req.body.view_page) : OtherConstants.Default_View_Page;
        let searchString = req.body.search_string ? "%" + req.body.search_string.trim() + "%" : "";
        let offsetRecords = viewRecords * (viewPage - 1);
        let whereCondition = `resource_keys.group_id = ${ResourceGroups.MENUS} AND resource_keys.is_active = ${Status.Active_Status}`;
        if (searchString) {
            whereCondition += ` AND resources.place_holder_value LIKE '${searchString}'`;
        }
        let menuQuery = await Sql.runQuery(
            `SELECT resource_keys.resource_key_id, resources.place_holder_value
            FROM resource_keys
            LEFT JOIN resources ON resource_keys.resource_key_id = resources.resource_key_id
            WHERE ${whereCondition} AND resources.place_holder_value IS NOT NULL
            GROUP BY resource_keys.resource_key_id 
            ORDER BY resources.place_holder_value`
        );
        if (menuQuery && menuQuery.error == 0) {
            let pages = [];
            let pageCount = 0;
            let viewCount = 0;
            if (menuQuery.data && menuQuery.data.length > 0) {
                menuQuery.data.map(record => {
                    if (viewCount < viewRecords && pageCount >= offsetRecords) {
                        pages.push({
                            resource_key_id: record.resource_key_id,
                            place_holder_value: record.place_holder_value
                        });
                        viewCount++;
                    }
                    pageCount++;
                });
            }
            dataObject.totalCount = pageCount;
            dataObject.pages = pages;
            statusCode = STATUS_CODES.OK;
        }
        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "ViewStaticPages", error.toString());
        next(error);
    }
};

const SaveWebsiteMenu = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let userId = res.locals.userId;
        let validate = true;
        let dataObject = {};
        dataObject.errors = {};
        let menu_id = req.body.menu_id ? parseInt(req.body.menu_id) : 0;
        let menu_type = req.body.menu_type ? parseInt(req.body.menu_type) : 0;
        let menu_group_id = req.body.menu_group_id ? parseInt(req.body.menu_group_id) : 0;
        let parent_menu = req.body.parent_menu ? parseInt(req.body.parent_menu) : 0;
        let menu_resourcekey_id = req.body.menu_resourcekey_id ? parseInt(req.body.menu_resourcekey_id) : 0;
        let sequence_no = req.body.sequence_no ? parseInt(req.body.sequence_no) : 0;
        let image_name = req.body.image_name && req.body.image_name != 'null' ? req.body.image_name : "";
        let savedImage = "";

        // add website menu duplication validation on edit time
        if (menu_id > 0) {
            let getWebsiteMenu = await Sql.runQuery(
                `SELECT image_name
                FROM website_menu 
                WHERE website_menu_id  = ${menu_id}`
            );
            if (getWebsiteMenu && getWebsiteMenu.error == 0) {
                if (getWebsiteMenu.data && getWebsiteMenu.data.length > 0) {
                    savedImage = getWebsiteMenu.data[0].image_name ? getWebsiteMenu.data[0].image_name : null;
                    image_name = savedImage ? savedImage : image_name;
                } else {
                    validate = false;
                    dataObject.errors.menu_id = "FIELD_INVALID";
                }
            } else {
                validate = false;
            }
        }

        if (menu_type == 0 || isNaN(menu_type)) {
            validate = false;
            dataObject.errors.menu_type = "FIELD_REQUIRED";
        } else {
            let getMenuTypeKey = await Sql.runQuery(
                `SELECT resource_key 
                FROM resource_keys 
                WHERE resource_key_id = ${menu_type} AND group_id = ${ResourceGroups.MENU_PAGE}`
            );
            if (getMenuTypeKey && getMenuTypeKey.error == 0) {
                if (getMenuTypeKey.data && getMenuTypeKey.data.length > 0) {
                    if (getMenuTypeKey.data[0].resource_key == MenuTypeKeys.FOOTER) {
                        if ((menu_group_id == 0 || isNaN(menu_group_id))) {
                            validate = false;
                            dataObject.errors.menu_group_id = "FIELD_REQUIRED";
                        }
                    } else {
                        menu_group_id = 0;
                    }
                    if (getMenuTypeKey.data[0].resource_key == MenuTypeKeys.SLIDER) {
                        if (!image_name) {
                            validate = false;
                            dataObject.errors.image_name = "FIELD_REQUIRED";
                        }
                    } else {
                        image_name = null;
                    }
                    if (getMenuTypeKey.data[0].resource_key == MenuTypeKeys.HEADER || getMenuTypeKey.data[0].resource_key == MenuTypeKeys.FOOTER) {
                        if (menu_resourcekey_id <= 0) {
                            validate = false;
                            dataObject.errors.menu_resourcekey_id = "FIELD_REQUIRED";
                        }
                    }
                } else {
                    validate = false;
                    dataObject.errors.menu_type = "FIELD_INVALID";
                }
            } else {
                validate = false;
            }
        }

        if (isNaN(sequence_no)) {
            validate = false;
            dataObject.errors.sequence_no = "FIELD_REQUIRED";
        }

        if (validate) {
            if (req.files && req.files.image_file) {
                let fileSrc = image_name;
                if (!savedImage) {
                    fileSrc = "uploads/" + uuid.v4() + "_$_" + image_name;
                }
                image_name = await UploadFile.uploadFile(req.files.image_file, fileSrc);
            }
            let imageName = image_name ? `'${image_name}'` : null;
            let parentMenuId = parent_menu ? parent_menu : null;
            let menuResourceKeyId = menu_resourcekey_id ? menu_resourcekey_id : null;

            let saveMenuQuery = await Sql.runQuery(
                `INSERT INTO website_menu 
                (website_menu_id, menu_type, menu_group_id, parent_menu_id, menu_resourcekey_id, sequence_no, image_name, is_active, created_at, created_by_id, updated_at, updated_by_id)
                VALUES (${menu_id}, ${menu_type}, ${menu_group_id}, ${parentMenuId}, ${menuResourceKeyId}, ${sequence_no}, ${imageName}, ${Status.Active_Status}, UTC_TIMESTAMP(), ${userId},  UTC_TIMESTAMP(), ${userId})
                ON DUPLICATE KEY UPDATE menu_type = ${menu_type}, menu_group_id = ${menu_group_id}, parent_menu_id = ${parentMenuId}, menu_resourcekey_id = ${menuResourceKeyId}, sequence_no = ${sequence_no}, image_name = ${imageName}, updated_at = UTC_TIMESTAMP(), updated_by_id = ${userId}`
            );
            if (saveMenuQuery.error == 0) {
                statusCode = STATUS_CODES.OK;
            } else {
                statusCode = STATUS_CODES.DATA_SAVE_ERROR;
            }
        }
        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "SaveWebsiteMenu", error.toString());
        next(error);
    }
};

const UploadStaticPageImage = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let dataObject = {};
        if (req.files.file) {
            statusCode = STATUS_CODES.OK;
            let fileName = await UploadFile.uploadFile(req.files.file);
            dataObject.data = fileName;
        }
        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "UploadStaticPageImage", error.toString());
        next(error);
    }
};

const DeleteStaticPageImages = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let dataObject = {};
        let images = req.body.images ? req.body.images : [];
        if (images.length > 0) {
            let fileName = await UploadFile.deleteS3File(images);
            dataObject.data = fileName;
            statusCode = STATUS_CODES.OK;
        }
        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;
        next();
    } catch (error) {
        Logger.servicesLogger(req, "DeleteStaticPageImages", error.toString());
        next(error);
    }
};

const SaveStaticPage = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.VALIDATION_ERROR;
        let userId = res.locals.userId;
        let validate = true;
        let dataObject = {};
        dataObject.errors = {};
        let resource_key_id = req.body.resource_key_id ? parseInt(req.body.resource_key_id) : 0;
        let resource_data = req.body.resource_data ? JSON.parse(req.body.resource_data) : [];
        if (resource_data.length <= 0) {
            validate = false;
            dataObject.errors.resource_data = "FIELD_REQUIRED";
        }
        if (validate) {
            let resourceKey = "";
            let recordUpdated = true;
            if (resource_key_id <= 0) {
                resourceKey = await Utilities.generateUniqueResourceKey();
                if (resourceKey == "") {
                    statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
                }
                let saveResourceKey = await Sql.runQuery(
                    `INSERT INTO resource_keys 
                    (resource_key, group_id, is_active, created_at, created_by_id, updated_at, updated_by_id )
                    VALUES ('${resourceKey}', ${ResourceGroups.MENUS}, ${Status.Active_Status}, UTC_TIMESTAMP(), ${userId},  UTC_TIMESTAMP(), ${userId})`
                );
                if (saveResourceKey.error == 0) {
                    resource_key_id = saveResourceKey.data.insertId;
                } else {
                    statusCode = STATUS_CODES.DATA_SAVE_ERROR;
                }
            }
            for (let [languageId, resource] of resource_data.entries()) {
                if (resource && languageId > 0) {
                    let resourceValue = resource.resource_value ? JSON.stringify(resource.resource_value) : null;
                    let placeholderValue = resource.place_holder_value ? `'${resource.place_holder_value}'` : null;
                    let infoValue = resource.info_value ? `'${resource.info_value}'` : null;
                    if (resourceValue) {
                        let apiBaseUrl = SINGLE_VALUE_CONST.ApiBaseUrl;
                        let imagsLinks = Utilities.getAttrFromString(resource.resource_value, 'img', 'src');
                        resourceValue = resourceValue.replace(new RegExp(apiBaseUrl, 'g'), '');
                        if (imagsLinks.length > 0) {
                            for (let image of imagsLinks) {
                                if (!image.includes(apiBaseUrl)) {
                                    let options = {
                                        uri: image,
                                        encoding: null
                                    };
                                    let body = await request(options);
                                    var filename = image.substring(image.lastIndexOf('/') + 1);
                                    let picPath = await UploadFile.uploadBufferFile(body, filename);
                                    resourceValue = resourceValue.replace(image, "/" + picPath);
                                }
                            }
                        }
                    }
                    let existsQuery = await Sql.runQuery(`SELECT resource_id 
                        FROM resources
                        WHERE resource_key_id = ${resource_key_id} AND language_id = ${languageId}`);
                    if (existsQuery && existsQuery.error == 0) {
                        if (existsQuery.data && existsQuery.data.length > 0) {
                            let resourceId = existsQuery.data[0].resource_id;
                            let updateResourceResult = await Sql.runQuery(
                                `UPDATE resources 
                                SET resource_value = ${resourceValue}, place_holder_value = ${placeholderValue}, info_value = ${infoValue} 
                                WHERE resource_id = ${resourceId}`
                            );
                            if (updateResourceResult && updateResourceResult.error > 0) {
                                recordUpdated = false;
                            }
                        } else {
                            if (resourceValue || placeholderValue || infoValue) {
                                let insertResourceResult = await Sql.runQuery(
                                    `INSERT INTO resources 
                                    (resource_value, place_holder_value, info_value, resource_key_id, language_id, created_at, created_by_id, updated_at, updated_by_id ) 
                                    VALUES(${resourceValue}, ${placeholderValue}, ${infoValue}, ${resource_key_id}, ${languageId}, UTC_TIMESTAMP(), ${userId}, UTC_TIMESTAMP(), ${userId})`
                                );
                                if (insertResourceResult && insertResourceResult.error > 0) {
                                    recordUpdated = false;
                                }
                            }
                        }
                    } else {
                        recordUpdated = false;
                    }
                }
            }
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
        Logger.servicesLogger(req, "SaveStaticPage", error.toString());
        next(error);
    }
};

const GetLandingPageMenus = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
        const dataObject = {};
        let roleId = res.locals.roleId;
        let userOrgId = res.locals.userOrgId;
        let langID = req.body.language_id ? parseInt(req.body.language_id) : 0;
        let group_ids = req.body.group_ids ? req.body.group_ids : "";
        let languageFlag = req.body.languageFlag ? req.body.languageFlag : false;
        if (langID == 0) {
            let defaultLanguageId = await CommonFunctions.getDefaultLanguage();
            langID = defaultLanguageId;
            dataObject.defaultLanguage = defaultLanguageId;
        }

        menuQuery = await Sql.runQuery(
            `SELECT website_menu.website_menu_id, website_menu.parent_menu_id, website_menu.image_name, menu_type_resource_keys.resource_key AS menu_type_key, group_resource_keys.resource_key AS group_resource_key, menu_resources.resource_value, menu_resources.place_holder_value, menu_resources.info_value, menu_resources.language_id, menu_resource_keys.resource_key AS menu_resource_key
            FROM website_menu
            LEFT JOIN resources AS menu_resources ON website_menu.menu_resourcekey_id = menu_resources.resource_key_id
            LEFT JOIN resource_keys AS menu_resource_keys ON menu_resources.resource_key_id = menu_resource_keys.resource_key_id
            INNER JOIN resource_keys AS menu_type_resource_keys ON website_menu.menu_type = menu_type_resource_keys.resource_key_id
            LEFT JOIN resource_keys AS group_resource_keys ON website_menu.menu_group_id = group_resource_keys.resource_key_id
            WHERE website_menu.is_active = ${Status.Active_Status} AND website_menu.sequence_no != 0
            ORDER BY website_menu.menu_type, website_menu.sequence_no ASC`
        );
        if (menuQuery && menuQuery.error == 0) {
            statusCode = STATUS_CODES.OK;
            let webMenus = [];
            let allMenus = [];
            if (menuQuery.data && menuQuery.data.length > 0) {
                let apiBaseUrl = SINGLE_VALUE_CONST.ApiBaseUrl;
                for (let menuResource of menuQuery.data) {
                    let menu = {};
                    if (menuResource.language_id > 0) {
                        if (menuResource.language_id == langID) {
                            menu = GetWebMenuRecord(menuResource, apiBaseUrl);
                        }
                    } else {
                        menu = GetWebMenuRecord(menuResource, apiBaseUrl);
                    }
                    if (menu.website_menu_id > 0) {
                        webMenus.push(menu);
                    }
                }
            }

            //get page resources
            if (group_ids) {
                let resources = await CommonFunctions.getResources(langID, group_ids);
                statusCode = resources.statusCode;
                if (statusCode == STATUS_CODES.OK) {
                    dataObject.pageResources = resources.resources;
                }
            }

            //get language list
            if(languageFlag) {
                let languages = await CommonFunctions.GetLanguageList();
                dataObject.languages = languages;
            }

            //get feature menus for login users
            if(req.headers.token && roleId > 0) {
                let menuResult = await GetFeatureMenusAndRoutes(roleId);
                if (menuResult.statusCode == STATUS_CODES.OK) {
                    let clinicianMenus = [];
                    if(roleId == Roles.Clinician) {
                        let orgid = req.headers.orgid ? parseInt(req.headers.orgid) : 0;
                        if (roleId == Roles.Admin) {
                            orgid = userOrgId;
                        }
                        let clinicianMenuResult = await GetClinicianSidebarMenus(langID, orgid);
                        if(clinicianMenuResult.statusCode == STATUS_CODES.OK) {
                            clinicianMenus = clinicianMenuResult.sidebarMenus;
                        } else {
                            statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
                        }
                    }
                    allMenus = [...webMenus, ...menuResult.menus, ...clinicianMenus];
                } else {
                    statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
                }
            } else {
                allMenus = webMenus;
            }
            dataObject.webMenus = allMenus;
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;

        next();
    } catch (error) {
        Logger.servicesLogger(req, "GetLandingPageMenus", error.toString());
        next(error);
    }
};

const GetCustomPageData = async (req, res, next) => {
    try {
        let statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
        let validate = true;
        const dataObject = {
            errors: {}
        }
        const resourceKey = req.body.resource_key ? req.body.resource_key : '';
        if (!resourceKey) {
            validate = false;
            dataObject.errors.resource_key = "FIELD_REQUIRED";
        }

        if (validate) {

            let resourceQuery = await Sql.runQuery(`SELECT resources.resource_value, resources.place_holder_value, resources.info_value
                FROM resources
                INNER JOIN resource_keys ON resource_keys.resource_key_id = resources.resource_key_id
                WHERE resource_keys.resource_key = '${resourceKey}' AND resource_keys.group_id = ${ResourceGroups.MENUS} AND resources.language_id = ${Languages.ENGLISH}`);

            if (resourceQuery && resourceQuery.error == 0) {
                let resourceResult = resourceQuery.data;
                statusCode = STATUS_CODES.OK;
                let resource = {};
                if (resourceResult && resourceResult.length > 0) {
                    const apiBaseUrl = SINGLE_VALUE_CONST.ApiBaseUrl;
                    resource = {
                        resource_value: Utilities.addBaseURL(resourceResult[0].resource_value, apiBaseUrl),
                        place_holder_value: resourceResult[0].place_holder_value,
                        info_value: resourceResult[0].info_value
                    }
                    dataObject.resource = resource;
                }
            }

        } else {
            statusCode = STATUS_CODES.VALIDATION_ERROR;
        }

        res.locals.statusCode = statusCode;
        res.locals.dataObject = dataObject;

        next();
    } catch (error) {
        Logger.servicesLogger(req, "GetCustomPageData", error.toString());
        next(error);
    }
};

async function GetFeatureMenusAndRoutes(dataObject, roleID, languageId) {
    dataObject.statusCode = STATUS_CODES.DATA_RETRIEVAL_ERROR;
    dataObject.Menus = [];
    dataObject.Routes = [];
    if(!languageId) {
        languageId = await CommonFunctions.getDefaultLanguage();
    }
    let featureMenuQuery = await Sql.runQuery(
        `SELECT features.feature_id, features.route_name, features.component, features.location, features.sequence_no, features.icon, features.parent_id, resources.resource_value 
        FROM features
        INNER JOIN role_features ON features.feature_id = role_features.feature_id 
        LEFT JOIN resource_keys ON BINARY features.component = resource_keys.resource_key
        LEFT JOIN resources ON resource_keys.resource_key_id = resources.resource_key_id AND resources.language_id = ${languageId}
        WHERE role_features.role_id = ${roleID} AND features.feature_group IS NULL AND features.is_active = ${Status.Active_Status} AND role_features.is_active = ${Status.Active_Status}
        ORDER BY features.location ASC, features.sequence_no ASC, features.parent_id ASC`
    );
    if (featureMenuQuery && featureMenuQuery.error == 0) {
        if (featureMenuQuery.data && featureMenuQuery.data.length > 0) {
            let childMenuRecords = [];
            let childMenus = [];
            for (let feature of featureMenuQuery.data) {
                childMenus = [];
                if (feature.location) {
                    if (((feature.route_name && feature.component) || feature.icon) && !feature.parent_id) {
                        childMenuRecords = featureMenuQuery.data.filter(e => e.parent_id == feature.feature_id);
                        if (childMenuRecords && childMenuRecords.length > 0) {
                            for (let childRecord of childMenuRecords) {
                                childMenus.push(GetFeatureRecord(childRecord));
                            }
                        }
                        dataObject.Menus.push(GetFeatureRecord(feature, childMenus));
                    }
                }
                if (feature.route_name && feature.component && dataObject.Routes.findIndex(e => e.route_name == feature.route_name) < 0) {
                    dataObject.Routes.push(GetRouteRecord(feature));
                }
            }
            dataObject.statusCode = STATUS_CODES.OK;
        }
    }
    return dataObject;
}

async function GetFeatureRecord(record, childMenus = []) {
    let menu = {
        feature_id: record.feature_id,
        route_name: record.route_name,
        component: record.component,
        location: record.location,
        icon: record.icon,
        label: record.resource_value
    }
    if (childMenus.length > 0) {
        menu.child_menus = childMenus;
    }
    return menu;
}

async function GetRouteRecord(record) {
    let menu = {
        feature_id: record.feature_id,
        route_name: record.route_name,
        component: record.component,
        location: record.location,
        icon: record.icon,
        label: record.resource_value
    }
    return menu;
}

async function GetWebMenuRecord(menuResource, apiBaseUrl) {
    let menu = {
        website_menu_id: menuResource.website_menu_id,
        location: menuResource.menu_type_key,
        menu_resource_key: menuResource.menu_resource_key,
        group_resource_key: menuResource.group_resource_key,
        resource_value: Utilities.addBaseURL(menuResource.resource_value, apiBaseUrl),
        place_holder_value: menuResource.place_holder_value,
        info_value: menuResource.info_value,
        image_name: menuResource.image_name,
        parent_menu_id: menuResource.parent_menu_id
    };
    return menu;
}

module.exports = {
    ViewWebsiteMenus,
    ViewStaticPages,
    SaveWebsiteMenu,
    UploadStaticPageImage,
    DeleteStaticPageImages,
    SaveStaticPage,
    GetLandingPageMenus,
    GetCustomPageData,
    GetFeatureMenusAndRoutes
}