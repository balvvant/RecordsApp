import { TextField } from '@material-ui/core';
import React, { Component } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { changeCurrentSidebarSubMenu, changeOpenComponent, changeOrgId, changeResourceKey, changeTheScreen, errorLogger, globalAlert, globalLoader, updateLanguageList, verifyRoute } from '../actions/commonActions';
import { API_METHODS, defaultLanguage, PRIMARY_COLOR, PRIMARY_FONT_COLOR, STATUS_CODES, resourceFields, resourceGroups, RESOURCE_KEYS,CONSTANTS, SCREENS, INVITATION_CODE_FOR} from '../Constants/types';
import { CallApiAsync, getResourceValue, ValidateField} from '../Functions/CommonFunctions';

class Registration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userRole: '',
            userRoleErrorMessage: '',
            userName: '',
            userNameErrorMessage: '',
            btcAddress: '',
            btcAddressErrorMessage: '',
            emailId: '',
            emailErrorMessage: '',
            jabberId: '',
            jabberIdErrorMessage: '',
            telegramId: '',
            telegramIdErrorMessage: '',
            activationCode: '',
            activationCodeErrorMessage: '',
            password: '',
            passwordErrorMessage: '',
            passwordVisible: false,
            confirmPassword: '',
            confirmPasswordErrorMessage: '',
            confirmPasswordVisible: false,
            minEightChar: false,
            oneVarIncluded: false,
            numberIncluded: false,
            specialCharacter: false,
            notMatchPassword: false,
            passwordValid: false,
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
        this.setState({
            [name]: value,
        })
    }

    registerUser = async (ev) => {
        ev.preventDefault();
        try {
            if (this.formValidation()) {
                globalLoader(true)
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: '/register-user',
                    body: {
                        username: this.state.userName,
                        userregistrationtype : this.state.userRole,
                        emailid : this.state.emailId,
                        btcaddress : this.state.btcAddress,
                        jabberid : this.state.jabberId,
                        telegramid : this.state.telegramId,
                        activationcode : this.state.activationCode,
                        userpassword : this.state.password
                    }
                }
                let result = await CallApiAsync(obj);
                if (result.data?.status === STATUS_CODES.OK) {
                    if (result?.data?.data?.userInfo) {
                        changeOpenComponent(false);
                        await sessionSetup(result?.data?.data, this.props.history);
                    }
                    else {
                        globalLoader(false)
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result?.data?.status.toString()))
                    }
                } else  {
                    if (result?.data?.data?.errors) {
                        let emailMinLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Min_Length);
                        let emailMaxLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Max_Length);
                        let passwordMinLength = getResourceValue(props.resources, "PASSWORD", resourceFields.Min_Length);
                        let passwordMaxLength = getResourceValue(props.resources, "PASSWORD", resourceFields.Max_Length);
                        this.setState({ emailErrorMessage: getResourceValue(props.resources, result?.data?.data?.errors?.email).replace('{min_length}', emailMinLength).replace('{max_length}', emailMaxLength) });
                        this.setState({ passwordErrorMessage: getResourceValue(props.resources, result?.data?.data?.errors?.password).replace('{min_length}', passwordMinLength).replace('{max_length}', passwordMaxLength) });
                    }
                    globalLoader(false)
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result?.data?.status.toString()))
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "Registration/registerUser",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }

    }

    formValidation = async () => {
        let isValid = true;
        errObj = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.USERTYPE, this.state.userRole);
        if (errObj.error) {
            isValid = false;
            this.state.userRoleErrorMessage(errObj.message);
        } else {
            this.state.userRoleErrorMessage('');
        }
        let errObj = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.USERNAME, this.state.userName);
        if (errObj.error) {
            isValid = false;
            this.state.userNameErrorMessage(errObj.message);
        } else {
            this.state.userNameErrorMessage('');
        }
        errObj = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.BTCADDRESS, this.state.btcAddress);
        if (errObj.error) {
            isValid = false;
            this.state.btcAddressErrorMessage(errObj.message);
        } else {
            this.state.btcAddressErrorMessage('');
        }
        errObj = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.EMAIL, this.state.emailId);
        if (errObj.error) {
            isValid = false;
            this.state.emailErrorMessage(errObj.message);
        } else {
            this.state.emailErrorMessage('');
        }
        errObj = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.JABBERID, this.state.jabberId);
        if (errObj.error) {
            isValid = false;
            this.state.jabberIdErrorMessage(errObj.message);
        } else {
            this.state.jabberIdErrorMessage('');
        }
        errObj = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.TELEGRAMID, this.state.telegramId);
        if (errObj.error) {
            isValid = false;
            this.state.telegramIdErrorMessage(errObj.message);
        } else {
            this.state.telegramIdErrorMessage('');
        }
        errObj = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.ACTIVATIONCODE, this.state.activationCode);
        if (errObj.error) {
            isValid = false;
            this.state.activationCodeErrorMessage(errObj.message);
        } else {
            this.state.activationCodeErrorMessage('');
        }
        errObj = ValidateField(props.resources, RESOURCE_KEYS.USER_PROFILE.PASSWORD, this.state.password);
        if (errObj.error) {
            isValid = false;
            this.state.passwordErrorMessage(errObj.message);
        } else {
            this.state.passwordErrorMessage('');
        }
        if(this.state.password != this.state.confirmPassword){
            isValid = false;
            this.state.confirmPasswordErrorMessage(errObj.message);
        } else {
            this.state.confirmPasswordErrorMessage('');
        }
        return isValid
    }

    render() {
        return (
            <div>
                <div className="d-flex flex-wrap w-100 justify-content-center">
                    <div className="form-width-sm w-100 contain-container" style={{ paddingBottom: "5vw" }}>
                        <div className="px-3">
                            <div>
                                <p className="login-txt mb-3 pb-1 primary-color">{getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.HEADER_REGISTER_USER)}</p>
                                <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => this.registerUser(ev)}>  
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <RadioGroup name="lockContent" className="flex-row" value={userRole} >
                                            <div>
                                                <FormControlLabel value={INVITATION_CODE_FOR.Buyer} control={<Radio onChange={(ev) => SetActivationCodeFor(INVITATION_CODE_FOR.Buyer)} />} label={getResourceValue(props.resources, RESOURCE_KEYS.COMMON.Code4Buyer)} />
                                            </div>
                                            <div>
                                                <FormControlLabel value={INVITATION_CODE_FOR.Seller} control={<Radio onChange={(ev) => SetActivationCodeFor(INVITATION_CODE_FOR.Seller)} />} label={getResourceValue(props.resources, RESOURCE_KEYS.COMMON.Code4Buyer)} />
                                            </div>
                                        </RadioGroup>
                                        <div className="form-img-wrapper no-pointer">
                                            <img src="/assets/img/lock-arrow.png" alt="lock" />
                                        </div>
                                        <div className="error-wrapper">
                                            {this.state.userNameErrorMessage}
                                        </div>
                                    </div>
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <TextField
                                            label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USERNAME)}
                                            placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.USERNAME, resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            name="username"
                                            onChange={(ev) => this.changeValue(ev)}
                                            value={this.state.userName}
                                        />
                                        <div className="form-img-wrapper no-pointer">
                                            <img src="/assets/img/lock-arrow.png" alt="lock" />
                                        </div>
                                        <div className="error-wrapper">
                                            {this.state.userNameErrorMessage}
                                        </div>
                                    </div>
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <TextField
                                            label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.EMAIL)}
                                            placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.EMAIL, resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            name="emailId"
                                            onChange={(ev) => this.changeValue(ev)}
                                            value={this.state.emailId}
                                        />
                                        <div className="form-img-wrapper no-pointer">
                                            <img src="/assets/img/lock-arrow.png" alt="lock" />
                                        </div>
                                        <div className="error-wrapper">
                                            {this.state.emailErrorMessage}
                                        </div>
                                    </div>
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <TextField
                                            label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.BTCADDRESS)}
                                            placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.BTCADDRESS, resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            name="emailId"
                                            onChange={(ev) => this.changeValue(ev)}
                                            value={this.state.btcAddress}
                                        />
                                        <div className="form-img-wrapper no-pointer">
                                            <img src="/assets/img/lock-arrow.png" alt="lock" />
                                        </div>
                                        <div className="error-wrapper">
                                            {this.state.btcAddressErrorMessage}
                                        </div>
                                    </div>
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <TextField
                                            label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.JABBERID)}
                                            placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.JABBERID, resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            name="emailId"
                                            onChange={(ev) => this.changeValue(ev)}
                                            value={this.state.jabberId}
                                        />
                                        <div className="form-img-wrapper no-pointer">
                                            <img src="/assets/img/lock-arrow.png" alt="lock" />
                                        </div>
                                        <div className="error-wrapper">
                                            {this.state.jabberIdErrorMessage}
                                        </div>
                                    </div>
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <TextField
                                            label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.TELEGRAMID)}
                                            placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.TELEGRAMID, resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            name="emailId"
                                            onChange={(ev) => this.changeValue(ev)}
                                            value={this.state.telegramId}
                                        />
                                        <div className="form-img-wrapper no-pointer">
                                            <img src="/assets/img/lock-arrow.png" alt="lock" />
                                        </div>
                                        <div className="error-wrapper">
                                            {this.state.telegramIdErrorMessage}
                                        </div>
                                    </div>
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <TextField
                                            label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.ACTIVATIONCODE)}
                                            placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.ACTIVATIONCODE, resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            name="emailId"
                                            onChange={(ev) => this.changeValue(ev)}
                                            value={this.state.activationCode}
                                        />
                                        <div className="form-img-wrapper no-pointer">
                                            <img src="/assets/img/lock-arrow.png" alt="lock" />
                                        </div>
                                        <div className="error-wrapper">
                                            {this.state.activationCodeErrorMessage}
                                        </div>
                                    </div>
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <TextField
                                            type={this.state.passwordVisible ? "text" : "password"}
                                            id="outlined-password-input"
                                            label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.PASSWORD)}
                                            placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.PASSWORD, resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            name="password"
                                            onChange={(ev) => this.changeValue(ev)}
                                            value={this.state.password}
                                        />
                                        <div className="form-img-wrapper cursor" onClick={() => this.toggleEye('passwordVisible')}>
                                            {this.state.passwordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                        </div>
                                        <div className="error-wrapper">
                                            <span>{this.state.passwordErrorMessage}</span>
                                        </div>
                                    </div>
                                    <div className="form-group-icon position-relative form-group pb-1">
                                        <TextField
                                            type={this.state.confirmPasswordVisible ? "text" : "password"}
                                            id="outlined-password-input"
                                            label={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.CONFIRMPASSWORD)}
                                            placeholder={getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.CONFIRMPASSWORD, resourceFields.Placeholder)}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            name="password"
                                            onChange={(ev) => this.changeValue(ev)}
                                            value={this.state.confirmPassword}
                                        />
                                        <div className="form-img-wrapper cursor" onClick={() => this.toggleEye('confirmPasswordVisible')}>
                                            {this.state.confirmPasswordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                        </div>
                                        <div className="error-wrapper">
                                            <span>{this.state.confirmPasswordErrorMessage}</span>
                                        </div>
                                    </div>
                                    <div className="pb-3 btn-wrapper">
                                        <button type="submit" className="btn btn-own btn-block btn-own-primary min-height-btn mw-100">{getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.REGISTERBUTTON)}</button>
                                    </div>
                                    <div className="text-right forgot-wrapper pb-3 font-bold">
                                        <a href={`#`} onClick={() => changeTheScreen(SCREENS.LOGIN)} className="link-color">{getResourceValue(props.resources, RESOURCE_KEYS.USER_PROFILE.ALREADYUSER)}</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps)(withRouter(Registration));

