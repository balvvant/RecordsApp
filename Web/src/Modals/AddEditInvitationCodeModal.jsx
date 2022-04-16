import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, resourceFields, RESOURCE_KEYS, STATUS_CODES, INVITATION_CODE_FOR } from '../Constants/types';
import { CallApiAsync, getResourceValue, ValidateField } from '../Functions/CommonFunctions';

const AddEditInvitationCodeModal = React.memo((props) => {
    let [ActivationCode, SetActivationCode] = useState('');
    let [ActivationCodeErrorMessage, setActivationCodeErrorMessage] = useState('');
    let [ActivationCodeFor, SetActivationCodeFor] = useState('');
    let [ActivationCodeForErrorMessage, SetActivationCodeForErrorMessage] = useState('');

    const SaveData = async (ev) => {
        ev.preventDefault();
        try {
            let formValidate = await FormValidateAsync();
            if (formValidate) {
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/create-invitation-code',
                    body: {
                        records: JSON.stringify([{
                            InvitationCodeID: props.codeID ? props.codeID : 0,
                            INVITATION_CODE: ActivationCode,
                            INVITATION_CODE_FOR: ActivationCodeFor
                        }])
                    }
                }
                let ticketResult = await CallApiAsync(obj);
                if (ticketResult.data.status === STATUS_CODES.OK) {
                    props.onCloseModal(CONSTANTS.SUCCESS)
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, ticketResult.data.status.toString()))
                }
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "AddEditInvitationCodeModal/saveData",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const FormValidateAsync = async () => {
        let formValid = true;
        let messageHeader = ValidateField(props.resources, RESOURCE_KEYS.INVITATIONCODES.INVITATION_CODE, ActivationCode);
        if (messageHeader.error) {
            formValid = false;
            setActivationCodeErrorMessage(messageHeader.message)
        } else {
            setActivationCodeErrorMessage('');
        }
        let messageBody = ValidateField(props.resources, RESOURCE_KEYS.INVITATIONCODES.INVITATION_CODE_FOR, ActivationCodeFor);
        if (messageBody.error) {
            formValid = false;
            SetActivationCodeForErrorMessage(messageBody.message);
        } else {
            SetActivationCodeForErrorMessage('');
        }
        return formValid
    }

    return (
        <Modal classNames={{ modal: "modal-lg modal-own" }} open={true} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
            <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => ev.preventDefault()}>
                <p className="login-txt  primary-color mb-0 cpb-10">{props.data?.codeID ? getResourceValue(props.resources, RESOURCE_KEYS.COMMON.EDIT) : getResourceValue(props.resources, RESOURCE_KEYS.COMMON.ADD)} {getResourceValue(props.resources, RESOURCE_KEYS.INVITATIONCODES.HEADER_MY_INVITATION_CODE)}</p>
                <div className="form-own add-list-form flex-wrap row m-0 p-0" >
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.INVITATIONCODES.INVITATION_CODE)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.INVITATIONCODES.INVITATION_CODE, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => SetActivationCode(ev.target.value)}
                                value={ActivationCode}
                                disabled ={!props.codeID}
                            />
                            <div className="error-wrapper">
                                <span>{ActivationCodeErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 col-12  p-0 cmt-10" >
                        <div className="form-group" style={{ display: 'unset' }}>
                            <p className="font-12 m-0">{getResourceValue(props.resources, 'INVITATION_LABEL')}</p>
                            <div className="row">
                                <div className="col-12">
                                    <RadioGroup name="lockContent" className="flex-row" value={ActivationCodeFor} >
                                        <div>
                                            <FormControlLabel value={INVITATION_CODE_FOR.Buyer} control={<Radio onChange={(ev) => SetActivationCodeFor(INVITATION_CODE_FOR.Buyer)} />} label={getResourceValue(props.resources, RESOURCE_KEYS.COMMON.Code4Buyer)}   />
                                        </div>
                                        <div>
                                            <FormControlLabel value={INVITATION_CODE_FOR.Seller} control={<Radio onChange={(ev) => SetActivationCodeFor(INVITATION_CODE_FOR.Seller)} />} label={getResourceValue(props.resources, RESOURCE_KEYS.COMMON.Code4Seller)} />
                                        </div>
                                    </RadioGroup>
                                    <div className="error-wrapper">
                                        <span>{ActivationCodeForErrorMessage}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="btn-wrapper cpt-10">
                        <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.CANCEL)}</button>
                        <button type="button" onClick={SaveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.SAVE)}</button>
                    </div>
                </div>
            </form>
        </Modal>
    )
})

export default AddEditInvitationCodeModal;