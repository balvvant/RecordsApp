import TextField from '@material-ui/core/TextField';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS,STATUS_CODES, DashboardStatus, OPERATION_PERMISSION_KEYS,CONSTANTS, resourceFields, resourceGroups, ROLES } from "../Constants/types";
import { CallApiAsync, CheckPermission, getResourceValue, logOut } from '../Functions/CommonFunctions';

class ChangePassword extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            currentPassword: '',
            confirmPassword: '',
            passwordVisible: false,
            currentPasswordVisible: false,
            confirmPasswordVisible: false,
            minEightChar: false,
            oneVarIncluded: false,
            numberIncluded: false,
            specialCharacter: false,
            passwordValid: false,
            currentPasswordError: '',
            newPasswordError: '',
            confirmPasswordError: '',
            changePasswordResource: [],
            languageId: props.languageId
        }
    }
    componentDidMount() {
        this.getChangePasswordResource();
    }


    componentDidUpdate(prevProps) {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getChangePasswordResource() });
        }
    }


    getChangePasswordResource = async () => {
        try {

            globalLoader(true);
            //get language data
            let languageId = this.state.languageId;
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.RESET_PASSWORD, resourceGroups.LOGIN, resourceGroups.ACTIVATE_USER, resourceGroups.COMMON, resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.UNLOCK_DECK, resourceGroups.PATIENT_DASHBOARD, resourceGroups.FEATURE_MENU, resourceGroups.CREATE_PROFILE],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);
            if (resourcesResult.data.status === STATUS_CODES.OK) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ changePasswordResource: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.changePasswordResource, resourcesResult.data.status.toString()));
            }
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "ChangePassword/getChangePasswordResource",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    toggleEye = (val) => {
        this.setState(prevState => {
            return {
                [val]: !prevState[val]
            }
        })
    }

    changeValue = (ev) => {
        let name = ev.target.name;
        let value = ev.target.value;
        this.setState({ [name]: value })
    }

    changePassword = (ev) => {
        let name = ev.target.name;
        let value = ev.target.value;
        var containsNumber = /\d+/;
        var specailChar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        var variableChar = /[A-Z]/
        if (value.length >= 8) {
            this.setState({ minEightChar: true })
        }
        else {
            this.setState({ minEightChar: false })
        }


        if (variableChar.test(value)) {
            this.setState({ oneVarIncluded: true })
        }
        else {
            this.setState({ oneVarIncluded: false })
        }
        if (specailChar.test(value)) {
            this.setState({ specialCharacter: true })
        }
        else {
            this.setState({ specialCharacter: false })
        }
        if (containsNumber.test(value)) {
            this.setState({ numberIncluded: true })
        }
        else {
            this.setState({ numberIncluded: false })
        }
        if (value.length >= 8 && containsNumber.test(value) && specailChar.test(value) && variableChar.test(value)) {
            this.setState({ passwordValid: true })
        }
        else {
            this.setState({ passwordValid: false })
        }
        this.setState({ [name]: value })

    }

    userPostData = (ev) => {
        ev.preventDefault();
        try {
            this.formValidation().then(async (value) => {
                if (value) {
                    globalLoader(true)
                    let obj = {
                        method: API_METHODS.POST,
                        history: this.props.history,
                        api: '/change-password',
                        body: {
                            current_password: this.state.currentPassword,
                            new_password: this.state.password
                        }
                    }
                    await CallApiAsync(obj).then(data => {
                        if (data.data.status === STATUS_CODES.OK) {
                            globalAlert('success', getResourceValue(this.state.changePasswordResource, 'PASSWORD_RESET_SUCCESS'));
                            globalLoader(false)
                            logOut(this.props.history, '/')
                        } else  {
                            if (data?.data?.data?.errors) {

                                let currentPasswordminLength = getResourceValue(this.state.changePasswordResource, "CURRENT_PASSWORD", resourceFields.Min_Length);
                                let currentPasswordmaxLength = getResourceValue(this.state.changePasswordResource, "CURRENT_PASSWORD", resourceFields.Max_Length);

                                let newPasswordminLength = getResourceValue(this.state.changePasswordResource, "NEW_PASSWORD", resourceFields.Min_Length);
                                let newPasswordmaxLength = getResourceValue(this.state.changePasswordResource, "NEW_PASSWORD", resourceFields.Max_Length);

                                this.setState({ currentPasswordError: getResourceValue(this.state.changePasswordResource, data?.data?.data?.errors?.current_password).replace('{min_length}', currentPasswordminLength).replace('{max_length}', currentPasswordmaxLength) });
                                this.setState({ newPasswordError: getResourceValue(this.state.changePasswordResource, data?.data?.data?.errors?.new_password).replace('{min_length}', newPasswordminLength).replace('{max_length}', newPasswordmaxLength) });
                            }
                            globalLoader(false)
                            globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.changePasswordResource, data.data.status.toString()))
                        }
                    }).catch(err => {
                    })
                }
            }).catch(err => {
            })
        } catch (error) {
            let errorObject = {
                methodName: "ChangePassword/userPostData",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    formValidation = async () => {
        this.setState({
            notMatchPassword: false,
        })
        let formValidation = true;
        let currentPasswordminLength = getResourceValue(this.state.changePasswordResource, "CURRENT_PASSWORD", resourceFields.Min_Length);
        let currentPasswordmaxLength = getResourceValue(this.state.changePasswordResource, "CURRENT_PASSWORD", resourceFields.Max_Length);

        let newPasswordminLength = getResourceValue(this.state.changePasswordResource, "NEW_PASSWORD", resourceFields.Min_Length);
        let newPasswordmaxLength = getResourceValue(this.state.changePasswordResource, "NEW_PASSWORD", resourceFields.Max_Length);

        let confirmPasswordminLength = getResourceValue(this.state.changePasswordResource, "CONFIRM", resourceFields.Min_Length);
        let confirmPasswordmaxLength = getResourceValue(this.state.changePasswordResource, "CONFIRM", resourceFields.Max_Length);

        if (!this.state.confirmPassword) {
            formValidation = false;
            this.setState({
                confirmPasswordError: getResourceValue(this.state.changePasswordResource, 'FIELD_REQUIRED')
            })

        } else if (this.state.confirmPassword.length == 0) {
            formValidation = false;
            this.setState({ confirmPasswordError: getResourceValue(this.state.changePasswordResource, 'FIELD_REQUIRED') })
        } else if (this.state.confirmPassword.length < confirmPasswordminLength || this.state.confirmPassword.length > confirmPasswordmaxLength) {
            formValidation = false;
            this.setState({ confirmPasswordError: getResourceValue(this.state.changePasswordResource, 'FIELD_LIMIT').replace('{min_length}', confirmPasswordminLength).replace('{max_length}', confirmPasswordmaxLength) })
        } else if (!this.state.passwordValid) {
            formValidation = false;
        } else {
            this.setState({ confirmPasswordError: '' })
        }

        if (!this.state.currentPassword) {
            formValidation = false;
            this.setState({
                currentPasswordError: getResourceValue(this.state.changePasswordResource, 'FIELD_REQUIRED')
            })
        } else if (this.state.currentPassword.length == 0) {
            formValidation = false;
            this.setState({ currentPasswordError: getResourceValue(this.state.changePasswordResource, 'FIELD_REQUIRED') })
        } else if (this.state.currentPassword.length < currentPasswordminLength || this.state.currentPassword.length > 100) {
            formValidation = false;
            this.setState({ currentPasswordError: getResourceValue(this.state.changePasswordResource, 'FIELD_LIMIT').replace('{min_length}', currentPasswordminLength).replace('{max_length}', currentPasswordmaxLength) })
        } else {
            this.setState({ currentPasswordError: '' })
        }

        if (this.state.password.length == 0) {
            this.setState({ newPasswordError: getResourceValue(this.state.changePasswordResource, 'FIELD_REQUIRED') })
        } else if (this.state.password.length < newPasswordminLength || this.state.password.length > newPasswordmaxLength) {
            formValidation = false;
            this.setState({ newPasswordError: getResourceValue(this.state.changePasswordResource, 'FIELD_LIMIT').replace('{min_length}', newPasswordminLength).replace('{max_length}', newPasswordmaxLength) })
        } else {
            this.setState({ newPasswordError: '' })
        }

        if (this.state.password && this.state.confirmPassword && this.state.confirmPassword !== this.state.password) {
            formValidation = false;
            this.setState({
                notMatchPassword: true,
            })
        }

        return formValidation
    }


    render() {
        let sideBarPermission = CheckPermission(this.props.operationList, OPERATION_PERMISSION_KEYS.SHOW_CATEGORY_SIDEBAR);
        let classes = '';
        if (this.props.roleKey == ROLES.PATIENT) {
            classes += `container align-middle`;
        }
        if (sideBarPermission) {
            classes += `sidebar-container`;
        }
        return (
            <div className={classes} >
                <div className={sideBarPermission ? "container cpt-10" : ''} style={{ maxWidth: '100%' }}>
                    <form noValidate autoComplete="off" onSubmit={(ev) => this.userPostData(ev)}>
                        <div className={`d-flex justify-content-between cpb-10`}   >
                            <div className="d-flex" >
                                <p className="login-txt mb-0 d-flex align-self-center font-20 primary-color">{getResourceValue(this.state.changePasswordResource, "CHANGE_PASSWORD")}</p>
                            </div>
                            
                        </div>

                        <div className='content-container cpt-10 cpl-10 cpr-10 cpb-10'>
                            <div className="col-12 m-0 p-0">
                                <div className="cpb-10">
                                    <TextField
                                        type={this.state.currentPasswordVisible ? "text" : "password"}
                                        label={getResourceValue(this.state.changePasswordResource, "CURRENT_PASSWORD")}
                                        placeholder={getResourceValue(this.state.changePasswordResource, "CURRENT_PASSWORD", resourceFields.Placeholder)}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="currentPassword"
                                        onChange={(ev) => this.changeValue(ev)}
                                        value={this.state.currentPassword}
                                    />
                                    <div className="form-img-wrapper cursor form-imgIcon" onClick={() => this.toggleEye('currentPasswordVisible')}>
                                        {this.state.currentPasswordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                    </div>
                                    <div className="error-wrapper">
                                        {this.state.currentPasswordError}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 m-0 p-0">
                                <div className="cpb-10">
                                    <TextField
                                        type={this.state.passwordVisible ? "text" : "password"}
                                        label={getResourceValue(this.state.changePasswordResource, "NEW_PASSWORD")}
                                        placeholder={getResourceValue(this.state.changePasswordResource, "NEW_PASSWORD", resourceFields.Placeholder)}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="password"
                                        onChange={(ev) => this.changePassword(ev)}
                                        value={this.state.password}
                                    />
                                    <div className="form-img-wrapper cursor form-imgIcon" onClick={() => this.toggleEye('passwordVisible')}>
                                        {this.state.passwordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                    </div>
                                    <div className="error-wrapper">
                                        {this.state.newPasswordError}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 m-0 p-0">
                                <div className="cpb-10">
                                    <TextField
                                        type={this.state.confirmPasswordVisible ? "text" : "password"}
                                        label={getResourceValue(this.state.changePasswordResource, 'CONFIRM')}
                                        placeholder={getResourceValue(this.state.changePasswordResource, 'CONFIRM')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="confirmPassword"
                                        onChange={(ev) => this.changeValue(ev)}
                                        value={this.state.confirmPassword}
                                    />
                                    <div className="form-img-wrapper cursor form-imgIcon" onClick={() => this.toggleEye('confirmPasswordVisible')}>
                                        {this.state.confirmPasswordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                    </div>
                                    <div className="error-wrapper">
                                        {this.state.confirmPasswordError}
                                        {this.state.notMatchPassword ? <span >{getResourceValue(this.state.changePasswordResource, 'PASSWORD_NOT_MATCH')}.</span> : null}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 input-helper-wrapper font-14 m-0 p-0">
                                <div className="">
                                    {getResourceValue(this.state.changePasswordResource, 'PASSWORD_DESCRIPTION')}
                                </div>

                                <div className="right-side-helper-txt">
                                    <ul className="pswrd-info-list pt-0 pb-0 mb-0 list-unstyled">
                                        <li className={`${this.state.minEightChar && this.state.password ? 'active' : ''}`}>{getResourceValue(this.state.changePasswordResource, 'CRITERIA_MIN')}</li>
                                        <li className={`${this.state.oneVarIncluded && this.state.password ? 'active' : ''}`}>{getResourceValue(this.state.changePasswordResource, 'CRITERIA_CASE')}</li>
                                        <li className={`${this.state.numberIncluded && this.state.password ? 'active' : ''}`}>{getResourceValue(this.state.changePasswordResource, 'CRITERIA_NUM')}</li>
                                        <li className={`${this.state.specialCharacter && this.state.password ? 'active' : ''}`}>{getResourceValue(this.state.changePasswordResource, 'CRITERIA_SPECIAL')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className='d-flex justify-content-end cpt-10'>
                            <div className=" btn-wrapper  ">
                                    <button type="submit" className="btn full-width-xs btn-own btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.changePasswordResource, "CHANGE_PASSWORD_BUTTON")}</button>
                                </div>
                            </div>
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
    operationList: state.common.operationList,
    roleKey: state.common.roleKey,

})
export default connect(mapStateToProps)(withRouter(ChangePassword));
