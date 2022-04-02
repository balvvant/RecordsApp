import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, resourceFields,CONSTANTS, resourceGroups } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

const PatientDeleteAccount = (props) => {
    const [password, setPassword] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [passwordError, setPasswordError] = useState('');
    const [resources, setResources] = useState([]);

    useEffect(() => {
        fetchResources();
    }, [props.languageId]);

    const fetchResources = async () => {
        globalLoader(true);
        let languageId = props.languageId;

        let obj = {
            method: API_METHODS.POST,
            history: props.history,
            api: '/get-page-resources',
            body: {
                group_id: [resourceGroups.PATIENT_DASHBOARD, resourceGroups.COMMON, resourceGroups.CREATE_PROFILE, resourceGroups.CLINICIAN_DASHBOARD]

            }
        }
        let resourcesResult = await CallApiAsync(obj);
        if (resourcesResult.data.status === 200) {
            let resources = resourcesResult.data.data.resources;
            setResources(resources);
        }
        else {
            globalAlert(CONSTANTS.ERROR, getResourceValue(resources, resourcesResult.data.status.toString()));
        }
        globalLoader(false);

    }

    const postData = async (ev) => {
        ev.preventDefault();
        try {
            let formValid = await formValidation()
            if (formValid) {
                globalLoader(true);
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/opt-out-user-account',
                    body: { password: password }
                }
                let res = await CallApiAsync(obj);
                if (res.data.status === 200) {
                    globalAlert('success', getResourceValue(resources, 'USER_ACCOUNT_OPT_OUT'));
                    localStorage.setItem('optOutStatus', 1);
                    props.history.push(`/dashboard`);
                } else {
                    if (res.data?.data?.errors) {
                        let minLength = getResourceValue(resources, "CURRENT_PASSWORD", resourceFields.Min_Length);
                        let maxLength = getResourceValue(resources, "CURRENT_PASSWORD", resourceFields.Max_Length);
                        setPasswordError(getResourceValue(resources, res.data?.data?.errors?.password).replace('{min_length}', minLength).replace('{max_length}', maxLength));
                    }
                    globalAlert(CONSTANTS.ERROR, getResourceValue(resources, res.data.status.toString()))
                }
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "deleteAccount/postData",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }
    const formValidation = async () => {
        let formValidation = true;
        if (!password) {
            formValidation = false;
            setPasswordError(getResourceValue(resources, "FIELD_REQUIRED"))
        }
        let minLength = getResourceValue(resources, "CURRENT_PASSWORD", resourceFields.Min_Length);
        let maxLength = getResourceValue(resources, "CURRENT_PASSWORD", resourceFields.Max_Length);
        if (password.length == 0) {
            formValidation = false;
            setPasswordError(getResourceValue(resources, "FIELD_REQUIRED"))
        } else if (password.length < minLength || password.length > maxLength) {
            formValidation = false;
            setPasswordError(getResourceValue(resources, 'FIELD_LIMIT').replace('{min_length}', minLength).replace('{max_length}', maxLength))
        } else {
            setPasswordError('')
        }
        return formValidation
    }

    return (
        <>
            <div className="container">
                <div className="col-12 col-md-12 mt-20">
                    <form className="form-own py-3" onSubmit={postData}>
                        <div className="row d-flex justify-content-between cpl-20 cpr-20 cpb-10 " >
                            <div className="d-flex align-self-center" >
                                <p className="login-txt mb-0 primary-color">{getResourceValue(resources, "OPT_OUT_LABEL")}</p>
                            </div>
                            <div className="d-flex btn-wrapper">
                                <div className="cpr-10 ">
                                    <button type="button" className="btn btn-own btn-own-grey min-height-btn mr-3 mw-100" onClick={() => props.history.goBack()}>{getResourceValue(resources, "TEACH_NOW_MAIL_CANCEL")}</button>
                                </div>
                                <div className=" ">
                                    <button type="submit" className="btn btn-own btn-own-primary min-height-btn mw-100">{getResourceValue(resources, "OPT_OUT_BUTTON")}</button>
                                </div>
                            </div>
                        </div>
                        <div className="content-container">
                            <div className="cpl-20 cpr-20 cpt-20 ">
                                <p className="font-16 mb-0">
                                    {getResourceValue(resources, "OPT_OUT_MESSAGE")}
                                </p>
                                <p className="font-16 mb-0">
                                    {getResourceValue(resources, "OPT_OUT_CONFIRM_MESSAGE")}
                                </p>
                            </div>
                            <div className="col-12 col-md-6 cpl-20 cpr-20 cpt-20 cpb-20">
                                <div className="form-group form-group-icon " style={{ display: 'table-cell' }}>
                                    <TextField
                                        type={passwordVisible ? "text" : "password"}
                                        label={getResourceValue(resources, "CURRENT_PASSWORD")}
                                        placeholder={getResourceValue(resources, "CURRENT_PASSWORD", resourceFields.Placeholder)}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="password"
                                        onChange={(ev) => setPassword(ev.target.value)}
                                        value={password}
                                    />
                                    <div className="form-img-wrapper cursor" onClick={() => setPasswordVisible(!passwordVisible)}>
                                        {passwordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                    </div>
                                    <div className="error-wrapper">
                                        {passwordError}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

const mapStateToProps = state => ({
    userDetail: state.user.userDetail,
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(PatientDeleteAccount));