import * as FileSaver from 'file-saver';
import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import * as XLSX from 'xlsx';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, FILE_EXTANSION_TYPE, RESOURCE_KEYS ,STATUS_CODES} from '../Constants/types';
import { CallApiAsync, getResourceValue, ValidateField } from '../Functions/CommonFunctions';

let templateHeader = {
    BIN: 0,
    RECORD_TYPE: 1,
    SUB_TYPE: 2,
    EXPIRY: 3,
    COUNTRY: 4,
    STATE: 5,
    CITY: 6,
    ZIP: 7,
};

const BulkUploadRecordsModal = React.memo((props) => {
    let [excelFileName, setExcelFileName] = useState(null);
    let [uploadStatus, setUploadStatus] = useState(false);
    let [recordSuccess, setRecordSuccess] = useState("");
    let [recordFailed, setRecordFailed] = useState("");
    let [records, setRecords] = useState([]);
    let [isUploadDisabled, setIsUploadDisabled] = useState(true);

    const ChangeFile = (ev) => {
        try {
            if (ev.target.files && ev.target.files.length > 0 && ev.target.files[0].type === FILE_EXTANSION_TYPE.EXCEL) {
                if (ev.target.files[0].size / 1024 == 0) {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, RESOURCE_KEYS.COMMON.FILE_SIZE_LIMIT));
                } else {
                    let excelFile = ev.target.files[0];
                    let reader = new FileReader();
                    reader.onload = async function (ev) {
                        let fileRecords = ValidateExcel(ev);
                        if (fileRecords) {
                            if (await ValidateExcelData(fileRecords)) {
                                setExcelFileName(excelFile.name);
                            } else {
                                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, STATUS_CODES.VALIDATION_ERROR));
                            }
                        } else {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, STATUS_CODES.EXCEL_FILE_MISSING));
                        }
                    };
                    reader.readAsBinaryString(excelFile)
                }
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, RESOURCE_KEYS.COMMON.EXCEL_FILE_LIMIT));
            }
        } catch (error) {
            let errorObject = {
                methodName: "BulkUploadRecords/ChangeFile",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const ValidateExcel = (ev) => {
        let readData = XLSX.read(ev.target.result, { type: CONSTANTS.BINARY });
        let excelData = XLSX.utils.sheet_to_json(readData.Sheets[readData.SheetNames[0]], { header: 1 });
        if (excelData.length > CONSTANTS.EXCEL_STARTING_ROW) {
            let headers = excelData[1];
            let templateHeaderArray = Object.keys(templateHeader);
            if (headers.length >= templateHeaderArray.length) {
                for (let [key, value] of headers.entries()) {
                    if (templateHeaderArray[key] && templateHeaderArray[key] != value.replace('*', '')) {
                        return false;
                    }
                }
                return excelData;
            }
        }
        return false;
    }

    const ValidateExcelData = async (excelData) => {
        let validate = true;
        let records = [];
        let success = 0;
        let record = {};
        for (let i = CONSTANTS.EXCEL_STARTING_ROW; i < excelData.length; i++) {
            record = {
                BIN: excelData[i][templateHeader.BIN] ? excelData[i][templateHeader.BIN] : '',
                RECORD_TYPE: excelData[i][templateHeader.RECORD_TYPE] ? excelData[i][templateHeader.RECORD_TYPE] : '',
                SUB_TYPE: excelData[i][templateHeader.SUB_TYPE] ? excelData[i][templateHeader.SUB_TYPE] : '',
                EXPIRY: excelData[i][templateHeader.EXPIRY] ? excelData[i][templateHeader.EXPIRY] : '',
                COUNTRY: excelData[i][templateHeader.COUNTRY] ? excelData[i][templateHeader.COUNTRY] : '',
                STATE: excelData[i][templateHeader.STATE] ? excelData[i][templateHeader.STATE] : '',
                CITY: excelData[i][templateHeader.CITY] ? excelData[i][templateHeader.CITY] : '',
                ZIP: excelData[i][templateHeader.ZIP] ? excelData[i][templateHeader.ZIP] : '',
                STATUS: ''
            }
            record = await FormValidateAsync(record);
            if (record.STATUS) {
                validate = false;
            } else {
                success++;
            }
            records.push(record);
        }
        if (validate) {
            setUploadStatus(false);
            setIsUploadDisabled(false);
        } else {
            setUploadStatus(true);
            setRecordFailed(records.length - success);
            setRecordSuccess(success);
        }
        setRecords(records);
        return validate;
    }

    const FormValidateAsync = async (record) => {
        let bin = ValidateField(props.resources, RESOURCE_KEYS.RECORD.BIN, record.BIN);
        if (bin.error) {
            record.STATUS = bin.message;
        }
        let recordType = ValidateField(props.resources, RESOURCE_KEYS.RECORD.RECORD_TYPE, record.RECORD_TYPE);
        if (recordType.error) {
            record.STATUS = recordType.message;
        }
        let subType = ValidateField(props.resources, RESOURCE_KEYS.RECORD.SUB_TYPE, record.SUB_TYPE);
        if (subType.error) {
            record.STATUS = subType.message;
        }
        return record
    }

    const SaveRecordAsync = async () => {
        try {
            if (records.length > 0) {
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/save-record',
                    body: {
                        records: JSON.stringify(records)
                    }
                }
                let recordResult = await CallApiAsync(obj);
                if (recordResult.data.status === STATUS_CODES.OK) {
                        setUploadStatus(true);
                        setRecordFailed(recordResult.data.data.records.length - recordResult.data.data.successCount);
                        setRecordSuccess(recordResult.data.data.successCount);
                        setRecords(recordResult.data.data.records);
                        setIsUploadDisabled(true);
                    } else {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, recordResult.data.status.toString()))
                    }
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "BulkUploadRecords/saveData",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const RemoveExcel = () => {
        setExcelFileName(null);
        setRecords([]);
        setUploadStatus(false);
    }

    const DownloadStatusFile = () => {
        let ws = XLSX.utils.json_to_sheet(records);
        let wb = { Sheets: { 'data': ws }, SheetNames: [CONSTANTS.DATA] };
        let excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: CONSTANTS.ARRAY });
        let data = new Blob([excelBuffer], { type: FILE_EXTANSION_TYPE.EXCEL });
        FileSaver.saveAs(data, 'Upload-records-status' + '.xlsx');
    }

    const RenderContent = () => {
        return (
            <form className="form-own" noValidate autoComplete="off">
                <div className="">
                    <p className="login-txt primary-color mb-0">{getResourceValue(props.resources, RESOURCE_KEYS.RECORD.BULK_UPLOAD_RECORDS)}</p>
                    <div className="form-own row " >
                        <div className="form-group col-12 upload-bulk-user">
                            <div className="upload-btn-wrapper">
                                <div className="upload-btn ">
                                    <div className="upload-btn-txt btn">
                                        {excelFileName ? getResourceValue(props.resources, RESOURCE_KEYS.COMMON.CHANGE_FILE) : "+" + getResourceValue(props.resources, RESOURCE_KEYS.COMMON.ADD_FILE)}
                                    </div>
                                    <div className={`own-custom-label`}>
                                        {getResourceValue(props.resources, RESOURCE_KEYS.COMMON.UPLOADABLE_EXCEL_FILE)}
                                    </div>

                                    <input type="file" onClick={e => (e.target.value = null)} multiple accept={FILE_EXTANSION_TYPE.EXCEL} className="upload-input cursor"
                                        onChange={(ev) => ChangeFile(ev)} title={excelFileName ? excelFileName : getResourceValue(props.resources, RESOURCE_KEYS.COMMON.NO_FILE)} />
                                </div>
                                {excelFileName &&
                                    <div className="d-flex flex-wrap">
                                        <div className="flex-1 mr-3">
                                            {getResourceValue(props.resources, RESOURCE_KEYS.COMMON.FILENAME)} :- <span className="font-600 primary-color">{excelFileName}</span>
                                        </div>
                                        <div className="cross-icon-wrapper cursor" onClick={() => RemoveExcel()}>
                                            <img src="/assets/img/icons/cross.svg" alt="cross-icon" />
                                        </div>
                                    </div>}
                            </div>
                        </div>
                        {
                            uploadStatus &&
                            <>
                                <div className="col-12">
                                    <div className="font-600 font-16 flex-1">
                                        {getResourceValue(props.resources, RESOURCE_KEYS.COMMON.UPLOAD_STATUS)}
                                    </div>
                                    <p className="  font-14">{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.SUCCESS_TEXT)} : {recordSuccess}, {getResourceValue(props.resources, RESOURCE_KEYS.COMMON.FAILED_TEXT)} : {recordFailed}</p>
                                    <p className=" font-14"><strong>{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.DOWNLOAD_TEXT)} </strong></p>
                                    <div className="btn-wrapper">
                                        <button type="button" onClick={() => DownloadStatusFile()} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mr-3 mw-100">{getResourceValue(props.resources, RESOURCE_KEYS.RECORD.RECORDS_UPLOAD_STATUS)}</button>
                                    </div>
                                </div>
                            </>
                        }
                        <div className=" btn-wrapper col-12 cpt-20">
                            <button type="button" className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.CANCEL)}</button>
                            <button disabled={isUploadDisabled} type="button" className={` ${isUploadDisabled ? 'disabled' : ''} btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100`} onClick={() => SaveRecordAsync()} >{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.UPLOAD)}</button>
                        </div>
                    </div>
                </div>
            </form>
        )
    };

    return (
        <div>
            <Modal classNames={{ modal: "modal-md modal-own" }} open={true} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
                {RenderContent()}
            </Modal>
        </div>

    )
})

export default BulkUploadRecordsModal;