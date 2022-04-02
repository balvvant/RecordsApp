import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, DashboardStatus, resourceFields,CONSTANTS, resourceGroups } from "../Constants/types";
import { CallApiAsync, getResourceValue, logOut } from '../Functions/CommonFunctions';



const ClinicianDeleteAccount = (props) => {
    const [password, setPassword] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [resources, setResources] = useState([])

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
                group_id: [resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.COMMON, resourceGroups.CREATE_PROFILE, resourceGroups.FEATURE_MENU]

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
            let formValid = await formValidation();
            if (formValid) {
                globalLoader(true);
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/delete-user-account',
                    body: { password: password }
                }
                let res = await CallApiAsync(obj);
                if (res.data.status === 200) {
                    globalAlert('success', getResourceValue(resources, 'USER_ACCOUNT_DELETED'));
                    logOut(props.history, '/')
                } else  {
                    if (res.data?.data?.errors) {
                        setPasswordError(getResourceValue(resources, res.data?.data?.errors?.password).replace('{min_length}', getResourceValue(resources, "CURRENT_PASSWORD", resourceFields.Min_Length)).replace('{max_length}', getResourceValue(resources, "CURRENT_PASSWORD", resourceFields.Max_Length)));
                    }
                    globalAlert(CONSTANTS.ERROR, getResourceValue(resources, res.data.status.toString()))
                }
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "ClinicianDeleteAccount/postData",
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
        <div className="d-flex sidebar-container">
            <div className="container" style={{ maxWidth: '100%' }}>
                <div classname="d-flex">
                    <div className="d-flex cpt-10 cpb-10" >
                        <div>
                            <p className="login-txt mb-1 pb-1 primary-color">{getResourceValue(resources, "DeleteAccount")}</p>
                        </div>
                    </div>
                    <div className="content-container cpt-10 cpb-10">
                        <form onSubmit={postData}>
                            <div className="col-12 col-md-12">
                                <div className="form-group form-group-icon ">
                                    <p className="font-14">
                                        {getResourceValue(resources, "LOGIN_ROLE")} {props?.userDetail?.email}
                                    </p>
                                    <p className="font-16">
                                        {getResourceValue(resources, "DELETE_ACCOUNT_SUBMESSAGE_ONE")}
                                    </p>
                                    <p className="font-16">
                                        {getResourceValue(resources, "DELETE_ACCOUNT_SUBMESSAGE_TWO")}
                                    </p>
                                    <div className='d-flex flex-row' >
                                        <TextField
                                            type={passwordVisible ? "text" : "password"}
                                            label={getResourceValue(resources, "CURRENT_PASSWORD")}
                                            placeholder={getResourceValue(resources, "CURRENT_PASSWORD", resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex w-100'
                                            margin="normal"
                                            variant="outlined"
                                            name="password"
                                            onChange={(ev) => setPassword(ev.target.value)}
                                            value={password}
                                        />
                                        <div className="form-img-wrapper2 cursor " onClick={() => setPasswordVisible(!passwordVisible)}>
                                            {passwordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                        </div>
                                    </div>
                                    <div className="error-wrapper">
                                        {passwordError}
                                    </div>
                                </div>
                            </div>
                            <p className="color-grey col-12 font-14">{getResourceValue(resources, "DELETE_ACCOUNT_MAIN_MESSAGE")}</p>
                            <div className="  btn-wrapper col-12">
                                <button type="submit" className="btn btn-own btn-own-primary min-height-btn mw-100">{getResourceValue(resources, "DELETE_ACCOUNT")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    )
}

const mapStateToProps = state => ({
    userDetail: state.user.userDetail,
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(ClinicianDeleteAccount));