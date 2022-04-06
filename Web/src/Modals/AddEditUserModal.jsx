import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, resourceFields, RESOURCE_KEYS } from '../Constants/types';
import { CallApiAsync, getResourceValue, ValidateField } from '../Functions/CommonFunctions';

const AddEditUserModal = React.memo((props) => {
    let [UserName, setUserName] = useState('');
    let [UserRole, setUserRole] = useState('');
    let [EmailID, setEmailID] = useState('');
    let [EmailIDErrorMessage, setEmailIDErrorMessage] = useState('');
    let [BTCAddress, setBTCAddress] = useState('');
    let [BTCAddressErrorMessage, setBTCAddressErrorMessage] = useState('');
    let [JabberID, setJabberID] = useState('');
    let [JabberIDErrorMessage, setJabberIDErrorMessage] = useState('');
    let [TelegramID, setTelegramID] = useState('');
    let [TelegramIDErrorMessage, setTelegramIDErrorMessage] = useState('');
    let [ActivationStatus, setActivationStatus] = useState('');
    let [Earnings, setEarnings] = useState('');
    let [Expenses, setExpenses] = useState('');

    useEffect(() => {
        if (props.userID) {
            FetchData(props.userID);
        }
    }, []);

    const FetchData = async (id) => {
        try {
            globalLoader(true);
            let obj = {
                method: API_METHODS.POST,
                history: props.history,
                api: '/get-user',
                body: { userID: id }
            }
            let userResult = await CallApiAsync(obj);
            if (userResult) {
                if (userResult.data.status === 200) {
                    setUserName(userResult.data.data.ProfileData.UserName);
                    setUserRole(userResult.data.data.ProfileData.UserRole);
                    setEmailID(userResult.data.data.ProfileData.EmailID);
                    setBTCAddress(userResult.data.data.ProfileData.BTCAddress);
                    setJabberID(userResult.data.data.ProfileData.JabberID);
                    setTelegramID(userResult.data.data.ProfileData.TelegramID);
                    setActivationStatus(userResult.data.data.ProfileData.ActivationStatus);
                    setEarnings(userResult.data.data.ProfileData.Earnings);
                    setExpenses(userResult.data.data.ProfileData.Expenses);
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, userResult.data.status.toString()));
                }
            }
            globalLoader(false);
        } catch (error) {
            let errorObject = {
                methodName: "AddEditUserModal/FetchData",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const SaveData = async (ev) => {
        ev.preventDefault();
        try {
            let formValidate = await FormValidateAsync();
            if (formValidate) {
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/save-user',
                    body: {
                        records: JSON.stringify([{
                            userID: props.userID ? props.userID : 0,
                            EMAIL_ID: EmailID,
                            BTC_ADDRESS: BTCAddress,
                            JABBER_ID: JabberID,
                            TELEGRAM_ID: TelegramID
                        }])
                    }
                }
                let userResult = await CallApiAsync(obj);
                if (userResult.data.status === 200) {
                    props.onCloseModal(CONSTANTS.SUCCESS)
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, userResult.data.status.toString()))
                }
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "AddEditUserModal/saveData",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const FormValidateAsync = async () => {
        let formValid = true;
        let emailID = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.EMAIL_ID, EmailID);
        if (emailID.error) {
            formValid = false;
            setEmailIDErrorMessage(emailID.message)
        } else {
            setEmailIDErrorMessage('');
        }
        let btcAddress = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.BTCADDRESS, BTCAddress);
        if (btcAddress.error) {
            formValid = false;
            setBTCAddressErrorMessage(btcAddress.message);
        } else {
            setBTCAddressErrorMessage('');
        }
        let jabberID = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.JABBERID, JabberID);
        if (jabberID.error) {
            formValid = false;
            setJabberIDErrorMessage(jabberID.message);
        } else {
            setBTCAddressErrorMessage('');
        }
        let telegramID = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.TELEGRAMID, TelegramID);
        if (telegramID.error) {
            formValid = false;
            setTelegramIDErrorMessage(telegramID.message);
        } else {
            setTelegramIDErrorMessage('');
        }
        return formValid
    }

    return (
        <Modal classNames={{ modal: "modal-lg modal-own" }} open={true} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
            <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => ev.preventDefault()}>
                <p className="login-txt  primary-color mb-0 cpb-10">{props.data?.userID ? getResourceValue(props.resources, RESOURCE_KEYS.COMMON.EDIT) : getResourceValue(props.resources, RESOURCE_KEYS.COMMON.ADD)} {getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.HEADER_ADD_TICKET)}</p>
                <div className="form-own add-list-form flex-wrap row m-0 p-0" >
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USERNAME)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USERNAME, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setUserName(ev.target.value)}
                                value={UserName}
                                disabled ={true}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" > 
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USERTYPE)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setUserRole(ev.target.value)}
                                value={UserRole}
                                disabled ={true}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.EMAIL)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.EMAIL, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setEmailID(ev.target.value)}
                                value={EmailID}
                            />
                            <div className="error-wrapper">
                                <span>{EmailIDErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.BTCADDRESS)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.BTCADDRESS, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setBTCAddress(ev.target.value)}
                                value={BTCAddress}
                            />
                            <div className="error-wrapper">
                                <span>{BTCAddressErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.JABBERID)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.JABBERID, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setJabberID(ev.target.value)}
                                value={JabberID}
                            />
                            <div className="error-wrapper">
                                <span>{JabberIDErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.TELEGRAMID)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.TELEGRAMID, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setTelegramID(ev.target.value)}
                                value={TelegramID}
                            />
                            <div className="error-wrapper">
                                <span>{TelegramIDErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USER_ACTIVATION_STATUS)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USER_ACTIVATION_STATUS, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setActivationStatus(ev.target.value)}
                                value={ActivationStatus}
                                disabled ={true}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USER_EARNINGS)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USER_EARNINGS, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setEarnings(ev.target.value)}
                                value={Earnings}
                                disabled ={true}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USER_EXPENSES)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USER_EXPENSES, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setExpenses(ev.target.value)}
                                value={Expenses}
                                disabled ={true}
                            />
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

export default AddEditUserModal;