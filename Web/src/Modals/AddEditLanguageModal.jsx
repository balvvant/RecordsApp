import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { CONSTANTS,STATUS_CODES,API_METHODS } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

const AddEditLanguageModal = React.memo((props) => {
    const [languageId, setLanguageId] = useState('');
    const [languageName, setLanguageName] = useState('');
    const [languageCode, setLanguageCode] = useState('');
    const [isDefault, setIsDefault] = useState('');
    const [languageNameErrorMessage, setLanguageNameErrorMessage] = useState('');
    const [languageCodeErrorMessage, setLanguageCodeErrorMessage] = useState('');
    const [isDefaultErrorMessage, setIsDefaultErrorMessage] = useState('');

    useEffect(() => {
        if (props.currentData && props.editMode) {
            setLanguageId(props.currentData.language_id)
            setLanguageName(props.currentData.language_name)
            setLanguageCode(props.currentData.language_code)
            setIsDefault(props.currentData.is_default.toString())
        }
    }, []);


    const saveData = async (ev) => {
        ev.preventDefault();
        try {
            let formValidateVal = await formValidate();
            if (formValidateVal) {


                let obj = {
                    method:API_METHODS.POST,
                    history:props.history,
                    api:'',
                    body:{
                    language_name: languageName,
                    language_code: languageCode,
                    // is_default: isDefault,
                }}

                let result;
                if (props.editMode) {
                    obj.body.language_id = languageId;
                    obj.api='/edit-language'
                    result = await CallApiAsync(obj);

                } else {
                    obj.api='/add-language';
                    result = await CallApiAsync(obj);
                }

                if (result.data.status === STATUS_CODES.OK) {
                    props.onCloseModal('success')
                    globalAlert('success', getResourceValue(props.resources, "LANGUAGE_SAVED"));
                } else{
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()));

                    if (result.data.errors) {
                        setLanguageNameErrorMessage(getResourceValue(props.resources, result.data.errors.language_name));
                        setLanguageCodeErrorMessage(getResourceValue(props.resources, result.data.errors.language_code));
                        setIsDefaultErrorMessage(getResourceValue(props.resources, result.data.errors.is_default));
                    }
                }
               

                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "addEditLanguage/saveData",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const formValidate = async () => {
        let formValid = true;
        if (!languageName) {
            formValid = false;
            setLanguageNameErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        } else {
            setLanguageNameErrorMessage("");
        }

        if (!languageCode) {
            formValid = false;
            setLanguageCodeErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        } else {
            setLanguageCodeErrorMessage("");
        }

        // if(!isDefault){
        //     formValid = false;
        //     setIsDefaultErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        // }else{
        //     setIsDefaultErrorMessage("");
        // }


        return formValid

    }

    return (
        <Modal classNames={{ modal: "modal-md modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
            <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => ev.preventDefault()}>
                <p className="login-txt  primary-color mb-0 cpb-10"> {props.editMode ? getResourceValue(props.resources, 'EDIT') : getResourceValue(props.resources, 'ADD_NEW')} {getResourceValue(props.resources, 'LANGUAGE')}</p>
                <div className="form-own  add-list-form flex-wrap" >
                    <div className="col-md-12 col-12   cpt-10 cpb-10 pl-0" >
                        <div className="form-group" style={{ display: 'contents' }}>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, 'LANGUAGE_NAME')}
                                placeholder={getResourceValue(props.resources, 'LANGUAGE_NAME')}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                name="name"
                                onChange={(ev) => setLanguageName(ev.target.value)}
                                value={languageName}
                            />

                            <div className="error-wrapper">
                                <span>{languageNameErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 col-12  cpt-10 cpb-10 pl-0">
                        <div className="form-group  flex-1" style={{ display: 'contents' }}>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, 'LANGUAGE_CODE')}
                                placeholder={getResourceValue(props.resources, 'LANGUAGE_CODE')}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                name="name"
                                onChange={(ev) => setLanguageCode(ev.target.value)}
                                value={languageCode}
                            />

                            <div className="error-wrapper">
                                <span>{languageCodeErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="btn-wrapper cpt-10 d-flex justify-content-end">
                        <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, 'CANCEL')}</button>
                        <button type="button" onClick={saveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, 'SAVE')}</button>
                    </div>
                </div>
            </form>
        </Modal>
    )
})

export default AddEditLanguageModal