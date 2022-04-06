const STATUS_CODES = {
    OK: 200,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    TOKEN_EXPIRED: 5000,
    INVALID_CREDENTIAL: 5001,
    DATA_RETRIEVAL_ERROR: 5002,
    DATA_SAVE_ERROR: 5003,
    LOW_BALANCE :5005,
    VALIDATION_ERROR: 5006,
    WRONG_PASSWORD: 5017,
    NEW_PASSWORD_SAME: 5019,
    INVALID_UNLOCK_CODE: 5020,
    USER_EXISTS : 5021,
    REGISTRATION_FEE : 5022
}

const Roles = {
    SuperAdmin: 1,
    Seller: 2,
    Buyer: 3,
    Anonymous: 4
};

const UserActivationStatuses = {
    OPEN: "Open",
    PAID: "Paid"
};

const InvitationCodeFor = {
    Seller: "Seller",
    Buyer: "Buyer"
};

const UserTicketStatuses = {
    RAISED: "Raised",
    RESPONDED: "Responded"
};

const RecordStatues = {
    ADDED: "Added",
    SUSPENDED: "Suspended",
    INCART: "InCart",
    SOLD: "Sold"
};

const TransactionTypes = {
    REGISTRATIONFEE: "RegistrationFee",
    BUYINGFEE: "BuyingFee",
    REFUND: "Refund",
    RECHARGE: "Recharge"
};

const PaymentTypes = {
    CREDIT: "Credit",
    DEBIT: "Debit"
};

const ConfigKey = {
    ROOT_USER_EMAIL: "ROOT_USER_EMAIL",
    CLIENT_SIDE_APPLCIATION: "CLIENT_SIDE_APPLCIATION",
    API_BASE_URL: "API_BASE_URL",
    ACCOUNT_CREATION_EMAIL_ID: "ACCOUNT_CREATION_EMAIL_ID",
    SUPPORT_EMAIL_ID: "SUPPORT_EMAIL_ID",
    TOKEN_EXPIRY_TIME: "TOKEN_EXPIRY_TIME",
    REFRESH_TOKEN_EXPIRY_TIME: "REFRESH_TOKEN_EXPIRY_TIME",
};

/**
 * configuration key with value
 */
const ConfigDetails = [];

/**
 * SecretKey
 */
const SecretKey = {
    //  only for UAT
    // SENDGRID_API_KEY: "UAT_SENDGRID_API_KEY",
    // JWT_SECRET_KEY: "UAT_JWT_SECRET_KEY",
    // CIPHER_KEY: "UAT_CIPHER_KEY",
    // CIPHER_IV_KEY: "UAT_CIPHER_IV_KEY",
    // AWS_ACCESS_ID: "UAT_AWS_ACCESS_ID",
    // AWS_SECRET_KEY: "UAT_AWS_SECRET_KEY",
    // AWS_S3_BUCKET: "UAT_AWS_S3_BUCKET",

    // for dev and local
    SENDGRID_API_KEY: "SENDGRID_API_KEY",
    JWT_SECRET_KEY: "JWT_SECRET_KEY",
    CIPHER_KEY: "CIPHER_KEY",
    CIPHER_IV_KEY: "CIPHER_IV_KEY",
    AWS_ACCESS_ID: "AWS_ACCESS_ID",
    AWS_SECRET_KEY: "AWS_SECRET_KEY",
    AWS_S3_BUCKET: "AWS_S3_BUCKET",

    KMS_ENCRYPT_KEY: "KMS_ENCRYPT_KEY",
    PORT: "PORT",
    HOSTNAME: "HOSTNAME",
    MYSQL_DB_NAME: "MYSQL_DB_NAME",
    MYSQL_DB_HOST: "MYSQL_DB_HOST",
    MYSQL_DB_PORT: "MYSQL_DB_PORT",
    MYSQL_DB_USER: "MYSQL_DB_USER",
    MYSQL_DB_PASS: "MYSQL_DB_PASS",
    AWS_REGION: "AWS_REGION",
};

/**
 * Secret details
 */
const SecretDetails = [];

/** Local Configuration */
SecretDetails["PORT"] = 8082;
SecretDetails["HOSTNAME"] = "0.0.0.0";
SecretDetails["MYSQL_DB_NAME"] = "LearningDB";
SecretDetails["MYSQL_DB_HOST"] = "liberate-lite-local-dev.caaxod81wbah.ap-south-1.rds.amazonaws.com";
SecretDetails["MYSQL_DB_PORT"] = 3306;
SecretDetails["MYSQL_DB_USER"] = "admin";
SecretDetails["MYSQL_DB_PASS"] = "Libratelite123";
SecretDetails["AWS_REGION"] = "ap-south-1";


/** Development Configuration 
SecretDetails["PORT"] = 8081;
SecretDetails["HOSTNAME"] = "0.0.0.0";
SecretDetails["MYSQL_DB_NAME"] = "LearningDB";
SecretDetails["MYSQL_DB_HOST"] = "alpha-dev-db.caaxod81wbah.ap-south-1.rds.amazonaws.com";
SecretDetails["MYSQL_DB_PORT"] = 3306;
SecretDetails["MYSQL_DB_USER"] = "admin";
SecretDetails["MYSQL_DB_PASS"] = "Blaze123";
SecretDetails["AWS_REGION"] = "ap-south-1";
*/

/** Stage Configuration */
// SecretDetails["PORT"] = 8081;
// SecretDetails["HOSTNAME"] = "0.0.0.0";
// SecretDetails["MYSQL_DB_NAME"] = "liberate";
// SecretDetails["MYSQL_DB_HOST"] = "alpha-uat-db.caaxod81wbah.ap-south-1.rds.amazonaws.com";
// SecretDetails["MYSQL_DB_PORT"] = 3306;
// SecretDetails["MYSQL_DB_USER"] = "admin";
// SecretDetails["MYSQL_DB_PASS"] = "Admin1234";
// SecretDetails["AWS_REGION"] = "ap-south-1";

/** Local Configuration 
SecretDetails["PORT"] = 8082;
SecretDetails["HOSTNAME"] = "0.0.0.0";
SecretDetails["MYSQL_DB_NAME"] = "mylocaldb";
SecretDetails["MYSQL_DB_HOST"] = "localhost";
SecretDetails["MYSQL_DB_PORT"] = 3306;
SecretDetails["MYSQL_DB_USER"] = "root";
SecretDetails["MYSQL_DB_PASS"] = "";
SecretDetails["AWS_REGION"] = "ap-south-1"; 
*/

SecretDetails["CIPHER_KEY"] = "14feb514c098df15794bf79cc";
SecretDetails["CIPHER_IV_KEY"] = "My@Rec0rd@Vale@";


const ActiveStatus = {
    Active_Status: 1,
    Inactive_Status: 0,
};

const FullStatus = {
    Full_Viewed: 1,
    Patial_Viewed: 0
}

const AllCategories = {
    All: 1,
    NotAll: 0
}

const AttachmentTypes = {
    Others: 1,
    PDF: 2,
    Video: 3,
    Audio: 4,
    Image: 5,
    Doc: 6,
};

const OtherConstants = {
    Default_View_Records: 1000,
    Default_View_Page: 1,
    Default_Sort_Col_Name: "id",
    Default_Sort_Col_Type: "DESC",
    Default_Org_Pic_Path: "uploads/default-logo.png",
    Default_Org_CopyRight: "Powered by LiberateHealth",
};

const ColorCodes = {
    BLUE_COLOR: "#0076BC",
    ORANGE_COLOR: "#F58220",
    PURPLE_COLOR: "#96368D",
    GREY_COLOR: "#8A8C8E",
    GREEN_COLOR: "#00AB4E",
};

const ColorCodesArray = [
    [ColorCodes.BLUE_COLOR, ColorCodes.BLUE_COLOR],
    [ColorCodes.ORANGE_COLOR, ColorCodes.ORANGE_COLOR],
    [ColorCodes.PURPLE_COLOR, ColorCodes.PURPLE_COLOR],
    [ColorCodes.GREY_COLOR, ColorCodes.GREY_COLOR],
    [ColorCodes.GREEN_COLOR, ColorCodes.GREEN_COLOR],
];

const ImageFileTypes = ['png', 'jpg', 'jpeg'];

const ResourceGroups = {
    MENU_PAGE: 23,
    MENUS: 24,
    FOOTER_MENU_HEADER: 25,
    ARTICLE: 27,
    FOOTER_STATIC_PAGE: 28,
    UPLOAD_MEDIA: 13,
    MANAGE_USERS: 10,
    CREATE_PROFILE: 6,
    MANAGE_ORGANIZATION: 9,
    MEDIA_CATEGORY: 12,
    USER_CATEGORY: 11,
    CLINICIAN_DASHBOARD: 18,
    COMMON: 2,
    LOGIN: 1,
    USER_PROFILE : 50,
    RECORDS: 51,
    ERROR_CODES: 54
}

const Languages = {
    ENGLISH: 1,
    HINDI: 2
}

const MenuTypeKeys = {
    HEADER: 'HEADER',
    FOOTER: 'FOOTER',
    SLIDER: 'SLIDER'
}

const MENU_LOCATIONS = {
    HEADER: "HeaderMenu",
    LEFT: "LeftMenu",
    FOOTER: "FooterMenu"
}

const ExcludedResourceGroups = [24, 27, 28];

const ResourceExportType = {
    WITH_DATA: "WITH_DATA",
    ONLY_FORMAT: "ONLY_FORMAT"
}

const PatientFileExtension = {
    PDF: "pdf",
    VIDEO: "mp4"
}


module.exports = {
    Roles,
    ConfigKey,
    ConfigDetails,
    SecretKey: SecretKey,
    SecretDetails: SecretDetails,
    Status: ActiveStatus,
    FullStatus: FullStatus,
    AttachmentTypes: AttachmentTypes,
    OtherConstants: OtherConstants,
    ColorCodes: ColorCodes,
    ColorCodesArray: ColorCodesArray,
    AllCategories: AllCategories,
    ImageFileTypes: ImageFileTypes,
    ResourceGroups,
    MenuTypeKeys,
    Languages,
    ExcludedResourceGroups,
    ResourceExportType,
    PatientFileExtension,
    UserActivationStatuses,
    TransactionTypes,
    PaymentTypes,
    RecordStatues,
    UserTicketStatuses,
    STATUS_CODES,
    InvitationCodeFor,
    MENU_LOCATIONS
};