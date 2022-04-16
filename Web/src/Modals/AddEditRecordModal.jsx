import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, resourceFields, STATUS_CODES, RESOURCE_KEYS } from '../Constants/types';
import { CallApiAsync, getResourceValue, ValidateField } from '../Functions/CommonFunctions';

const AddEditRecordModal = React.memo((props) => {
    let [recordBin, setRecordBin] = useState('');
    let [recordBinErrorMessage, setRecordBinErrorMessage] = useState('');
    let [recordType, setRecordType] = useState('');
    let [recordTypeErrorMessage, setRecordTypeErrorMessage] = useState('');
    let [recordSubType, setRecordSubType] = useState('');
    let [recordSubTypeErrorMessage, setRecordSubTypeErrorMessage] = useState('');
    let [recordExp, setRecordExp] = useState('');
    let [recordCountry, setRecordCountry] = useState('');
    let [recordState, setRecordState] = useState('');
    let [recordCity, setRecordCity] = useState('');
    let [recordZip, setRecordZip] = useState('');

    useEffect(() => {
        if (props.recordId) {
            FetchRecordAsync(props.recordId);
        }
    }, []);

    const FetchRecordAsync = async (id) => {
        try {
            globalLoader(true);
            let obj = {
                method: API_METHODS.POST,
                history: props.history,
                api: '/get-record',
                body: { recordId: id }
            }
            let recordResult = await CallApiAsync(obj);
            if (recordResult) {
                if (recordResult.data.status === STATUS_CODES.OK) {
                    let record = recordResult.data.data.UserRecord;
                    setRecordBin(record.RecordBin);
                    setRecordType(record.RecordType);
                    setRecordSubType(record.RecordSubType);
                    setRecordExp(record.RecordExp);
                    setRecordCountry(record.RecordCountry);
                    setRecordState(record.RecordState);
                    setRecordCity(record.RecordCity);
                    setRecordZip(record.RecordZip);
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, recordResult.data.status.toString()));
                }
            }
            globalLoader(false);
        } catch (error) {
            let errorObject = {
                methodName: "AddEditRecord/FetchRecordAsync",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const SaveRecordAsync = async (ev) => {
        ev.preventDefault();
        try {
            let formValidate = await FormValidateAsync();
            if (formValidate) {
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/save-record',
                    body: {
                        records: JSON.stringify([{
                            RecordID: props.recordId ? props.recordId : '',
                            BIN: recordBin,
                            RECORD_TYPE: recordType,
                            SUB_TYPE: recordSubType,
                            EXPIRY: recordExp,
                            COUNTRY: recordCountry,
                            STATE: recordState,
                            CITY: recordCity,
                            ZIP: recordZip
                        }])
                    }
                }
                let recordResult = await CallApiAsync(obj);
                if (recordResult.data.status === STATUS_CODES.OK) {
                    props.onCloseModal(CONSTANTS.SUCCESS)
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, recordResult.data.status.toString()))
                }
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "AddEditRecord/saveData",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const FormValidateAsync = async () => {
        let formValid = true;
        let bin = ValidateField(props.resources, RESOURCE_KEYS.RECORD.BIN, recordBin);
        if (bin.error) {
            formValid = false;
            setRecordBinErrorMessage(bin.message)
        } else {
            setRecordBinErrorMessage('');
        }
        let type = ValidateField(props.resources, RESOURCE_KEYS.RECORD.RECORD_TYPE, recordType);
        if (type.error) {
            formValid = false;
            setRecordTypeErrorMessage(type.message);
        } else {
            setRecordTypeErrorMessage('');
        }
        let subType = ValidateField(props.resources, RESOURCE_KEYS.RECORD.SUB_TYPE, recordSubType);
        if (subType.error) {
            formValid = false;
            setRecordSubTypeErrorMessage(subType.message);
        } else {
            setRecordSubTypeErrorMessage('');
        }
        return formValid
    }

    return (
        <Modal classNames={{ modal: "modal-lg modal-own" }} open={true} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
            <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => ev.preventDefault()}>
                <p className="login-txt  primary-color mb-0 cpb-10">{props.data?.RecordID ? getResourceValue(props.resources, RESOURCE_KEYS.COMMON.EDIT) : getResourceValue(props.resources, RESOURCE_KEYS.COMMON.ADD)} {getResourceValue(props.resources, RESOURCE_KEYS.RECORD.RECORD)}</p>
                <div className="form-own add-list-form flex-wrap row m-0 p-0" >
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.BIN)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.BIN, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setRecordBin(ev.target.value)}
                                value={recordBin}
                            />
                            <div className="error-wrapper">
                                <span>{recordBinErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.RECORD_TYPE)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.RECORD_TYPE, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setRecordType(ev.target.value)}
                                value={recordType}
                            />
                            <div className="error-wrapper">
                                <span>{recordTypeErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.SUB_TYPE)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.SUB_TYPE, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setRecordSubType(ev.target.value)}
                                value={recordSubType}
                            />
                            <div className="error-wrapper">
                                <span>{recordSubTypeErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.EXPIRY)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.EXPIRY, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setRecordExp(ev.target.value)}
                                value={recordExp}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.COUNTRY)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.COUNTRY, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setRecordCountry(ev.target.value)}
                                value={recordCountry}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.STATE)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.STATE, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setRecordState(ev.target.value)}
                                value={recordState}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.CITY)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.CITY, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setRecordCity(ev.target.value)}
                                value={recordCity}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.ZIP)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.RECORD.ZIP, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setRecordZip(ev.target.value)}
                                value={recordZip}
                            />
                        </div>
                    </div>
                    <div className="btn-wrapper cpt-10">
                        <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.CANCEL)}</button>
                        <button type="button" onClick={SaveRecordAsync} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.SAVE)}</button>
                    </div>
                </div>
            </form>
        </Modal>
    )
})

export default AddEditRecordModal;