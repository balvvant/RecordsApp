import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS,CONSTANTS, GLOBAL_API } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';


const BulkUploadModal = React.memo((props) => {
    const [resourceExcelFile, setResourceExcelFile] = useState(null);
    const [bulkResourceFile, setBulkResourceFile] = useState(null);
    const [resourceUploadError, setResourceUploadError] = useState('');
    const [uploadStatus, setUploadStatus] = useState(false);
    const [resourceSuccess, setResourceSuccess] = useState("");
    const [resourceFailed, setResourceFailed] = useState("");

    const changeFile = (ev) => {
        try {


            if (ev.target.files && ev.target.files.length > 0) {
                if ((ev.target.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
                    if (ev.target.files[0].size / 1024 == 0) {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "FILE_SIZE_LIMIT"));
                    } else {
                        setResourceExcelFile(ev.target.files[0]);
                    }
                }
                else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "EXCEL_FILE_LIMIT"));

                }
            }


        } catch (error) {
            let errorObject = {
                methodName: "BulkUploadModal/changeFile",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const downloadFormatFile = (ev) => {
        ev.preventDefault()
        window.open(`${GLOBAL_API}/uploads/resources.xlsx`);
    }

    const removeExcel = () => {
        setResourceExcelFile(null);
        setResourceUploadError('');
    }

    const downloadStatusFile = (ev) => {
        window.open(`${GLOBAL_API}/${bulkResourceFile}`);
    }


    const uploadResourceFile = async () => {
        if (!resourceExcelFile) {
            setResourceUploadError(getResourceValue(props.resources, "FIELD_REQUIRED"));
        } else {
            globalLoader(true)
            let formData = new FormData();
            formData.append('bulk_upload', resourceExcelFile);
            let obj = {
                method: API_METHODS.POST,
                history: props.history,
                api: '/upload-resources',
                body: formData
            }
            let result = await CallApiAsync(obj);
            if (result.data.status === 200) {
                // props.onCloseModal('success')

                setUploadStatus(true);
                setBulkResourceFile(result.data.data.bulkResourceFile);
                setResourceSuccess(result.data.data.resourceSuccessCount);
                setResourceFailed(result.data.data.resourceFailedCount);

                globalAlert('success', result.data.status.toString())
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()))
                if (result.data.data.errors) {
                    setResourceUploadError(getResourceValue(props.resources, result.data.data.errors.bulk_upload))
                }
            }
            globalLoader(false)
        }
    }


    const renderContent = () => {
        return (
            <form className="form-own" noValidate autoComplete="off">
                <div className="">
                    <p className="login-txt primary-color mb-0">{getResourceValue(props.resources, 'BULK_UPLOAD_RESOURCE')}</p>
                    <div className="form-own row " >
                        <div className="form-group col-12 upload-bulk-user">
                            <div className="upload-btn-wrapper">
                                <div className="upload-btn ">
                                    <div className="upload-btn-txt btn">
                                        {resourceExcelFile ? getResourceValue(props.resources, 'CHANGE_FILE') : "+" + getResourceValue(props.resources, 'ADD_FILE')}
                                    </div>
                                    <div className={`own-custom-label`}>
                                        {getResourceValue(props.resources, "UPLOADABLE_EXCEL_FILE")}
                                    </div>

                                    <input type="file" onClick={e => (e.target.value = null)} multiple accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="upload-input cursor"
                                        onChange={(ev) => changeFile(ev)} title={resourceExcelFile ? resourceExcelFile.name : getResourceValue(props.resources, 'NO_FILE')} />
                                </div>
                                {resourceExcelFile &&

                                    <div className="d-flex flex-wrap">
                                        <div className="flex-1 mr-3">
                                            {getResourceValue(props.resources, 'FILENAME')} :- <span className="font-600 primary-color">{resourceExcelFile.name}</span>
                                        </div>
                                        <div className="cross-icon-wrapper cursor" onClick={() => removeExcel('patient')}>
                                            <img src="/assets/img/icons/cross.svg" alt="cross-icon" />
                                        </div>
                                    </div>}
                                <div className="error-wrapper">
                                    {resourceUploadError !== '' && <span >{resourceUploadError}</span>}
                                </div>

                            </div>
                        </div>

                        {
                            uploadStatus &&
                            <>
                                <div className="col-12">
                                    <div className="font-600 font-16 flex-1">
                                        {getResourceValue(props.resources, 'UPLOAD_STATUS')}
                                    </div>

                                    <p className="  font-14">{getResourceValue(props.resources, 'SUCCESS_TEXT')} : {resourceSuccess}, {getResourceValue(props.resources, 'FAILED_TEXT')} : {resourceFailed}</p>

                                    <p className=" font-14"><strong>{getResourceValue(props.resources, 'DOWNLOAD_TEXT')} </strong></p>

                                    <div className=" btn-wrapper">
                                        <button type="button" onClick={() => downloadStatusFile('clinician')} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mr-3 mw-100">{getResourceValue(props.resources, "RESOURCE_UPLOAD_STATUS")}</button>
                                    </div>
                                </div>
                            </>
                        }


                        <div className=" btn-wrapper col-12 cpt-20">
                            <button type="button" className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, 'CANCEL')}</button>
                            <button type="button" className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100" onClick={() => uploadResourceFile()} >{getResourceValue(props.resources, 'UPLOAD')}</button>
                        </div>
                    </div>
                </div>
            </form>
        )
    };

    return (
        <div>

            <Modal classNames={{ modal: "modal-md modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
                {renderContent()}
            </Modal>

        </div>

    )
})

const mapStateToProps = (state) => ({
    orgId: state.user.orgId,
});

export default connect(mapStateToProps)(withRouter(BulkUploadModal));