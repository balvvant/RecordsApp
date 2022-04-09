import { TextField } from '@material-ui/core';
import { format } from 'date-fns';
import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { changeTheScreen, errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS,STATUS_CODES, resourceFields, resourceGroups, CONSTANTS,SCREENS, ROLES } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class ResetPasswordComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: '',
            confirmPassword: '',
            passwordVisible: false,
            confirmPasswordVisible: false,
            minEightChar: false,
            oneVarIncluded: false,
            numberIncluded: false,
            specialCharacter: false,
            notMatchPassword: false,
            token: '',
            passwordValid: false,
            passwordErrorMessage: '',
            confirmPasswordErrorMessage: '',
            otpErr: '',
            securityCode: '',
            roleType: this.props.roleType,
            emptyDob: false,
            valueInDate: false,
            languageId: props.languageId,
            resetPasswordResources: [],
        }
    }

    componentDidMount() {
        if (!this.props.mail || !this.props.roleType) {
            changeTheScreen(SCREENS.FORGOT_PASSWORD);
        } else {
            globalLoader(false)
        }
        this.getResetPasswordResources()
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

    toggleLoginMode = () => {
        this.setState({
            password: '',
            securityCode: '',
            signWithCode: !this.state.signWithCode,
            emptySecurityCode: false,

        })
    }

    changePassword = (ev) => {
        let name = ev.target.name;
        let value = ev.target.value;
        var containsNumber = /\d+/;
        var specailChar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        var variableChar = /[A-z]/
        if (value.length >= 8) {
            this.setState({

                minEightChar: true,
            })
        }
        else {
            this.setState({

                minEightChar: false,
            })
        }


        if (variableChar.test(value)) {
            this.setState({


                oneVarIncluded: true,

            })
        }
        else {
            this.setState({


                oneVarIncluded: false,

            })
        }
        if (specailChar.test(value)) {
            this.setState({


                specialCharacter: true,
            })
        }
        else {
            this.setState({


                specialCharacter: false,

            })
        }
        if (containsNumber.test(value)) {
            this.setState({


                numberIncluded: true,

            })
        }
        else {
            this.setState({


                numberIncluded: false,

            })
        }
        if (value.length >= 8 && containsNumber.test(value) && specailChar.test(value) && variableChar.test(value)) {
            this.setState({
                passwordValid: true,
            })
        }
        this.setState({
            [name]: value,
        })

    }

    userResetPassword = (ev) => {
        ev.preventDefault();
        try {
            this.formValidation().then(async (value) => {

                if (value) {
                    globalLoader(true)
                    let obj = {
                        method: API_METHODS.POST,
                        history: this.props.history,
                        api: `/reset-password`,
                        body: {
                            email: this.props.mail,
                            password: this.state.password,
                            otp: this.state.securityCode,
                            userType: this.state.roleType
                        }
                    }

                    if (this.state.roleType === ROLES.PATIENT) {
                        let formattedDob = format(this.state.startDate, 'yyyy-MM-dd');
                        obj = { ...obj, dob: formattedDob };
                    }

                    let resApi = await CallApiAsync(obj);
                    if (resApi.data.status === STATUS_CODES.OK) {
                        changeTheScreen(SCREENS.LOGIN);
                        globalAlert('success', getResourceValue(this.state.resetPasswordResources, 'PASSWORD_RESET_SUCCESS'));
                        globalLoader(false)
                    } else {
                        if (resApi?.data?.data?.errors) {
                            let passwordMinLength = getResourceValue(this.state.resetPasswordResources, "PASSWORD", resourceFields.Min_Length);
                            let passwordMaxLength = getResourceValue(this.state.resetPasswordResources, "PASSWORD", resourceFields.Max_Length);
                            this.setState({ passwordErrorMessage: getResourceValue(this.state.resetPasswordResources, resApi?.data?.data?.errors?.password).replace('{min_length}', passwordMinLength).replace('{max_length}', passwordMaxLength) });
                        }
                        globalLoader(false)
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resetPasswordResources, resApi.data.status.toString()))
                    }

                }
            })
        } catch (error) {
            let errorObject = {
                methodName: "resetPasswordComp/userResetPassword",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    formValidation = async () => {
        this.setState({
            notMatchPassword: false,
            emptyDob: false,
        })
        let formValidation = true;
        if (!this.state.passwordValid) {
            formValidation = false;
        }

        if (this.state.roleType === ROLES.PATIENT) {
            if (!this.state.formattedDate) {
                formValidation = false;
                this.setState({
                    emptyDob: true,
                });
            }
        }

        let confirmPasswordMinLength = getResourceValue(this.state.resetPasswordResources, "CONFIRM", resourceFields.Min_Length);
        let confirmPasswordMaxLength = getResourceValue(this.state.resetPasswordResources, "CONFIRM", resourceFields.Max_Length);

        if (!this.state.confirmPassword) {
            formValidation = false;
            this.setState({
                confirmPasswordErrorMessage: getResourceValue(this.state.resetPasswordResources, 'FIELD_REQUIRED')
            })
        } else if (this.state.confirmPassword.length == 0) {
            formValidation = false;
            this.setState({ confirmPasswordErrorMessage: getResourceValue(this.state.resetPasswordResources, 'FIELD_REQUIRED') })
        } else if (this.state.confirmPassword.length < confirmPasswordMinLength || this.state.confirmPassword.length > confirmPasswordMaxLength) {
            formValidation = false;
            this.setState({ confirmPasswordErrorMessage: getResourceValue(this.state.resetPasswordResources, 'FIELD_LIMIT').replace('{min_length}', confirmPasswordMinLength).replace('{max_length}', confirmPasswordMaxLength) })
        } else {
            this.setState({ confirmPasswordErrorMessage: '' })
        }

        let passwordMinLength = getResourceValue(this.state.resetPasswordResources, "PASSWORD", resourceFields.Min_Length);
        let passwordMaxLength = getResourceValue(this.state.resetPasswordResources, "PASSWORD", resourceFields.Max_Length);

        if (!this.state.password) {
            formValidation = false;
            this.setState({
                passwordErrorMessage: getResourceValue(this.state.resetPasswordResources, 'FIELD_REQUIRED')
            })
        } else if (this.state.password.length == 0) {
            formValidation = false;
            this.setState({ passwordErrorMessage: getResourceValue(this.state.resetPasswordResources, 'FIELD_REQUIRED') })
        } else if (this.state.password.length < passwordMinLength || this.state.password.length > passwordMaxLength) {
            formValidation = false;
            this.setState({ passwordErrorMessage: getResourceValue(this.state.resetPasswordResources, 'FIELD_LIMIT').replace('{min_length}', passwordMinLength).replace('{max_length}', passwordMaxLength) })
        } else {
            this.setState({ passwordErrorMessage: '' })
        }
        let otpMaxLength = getResourceValue(this.state.resetPasswordResources, "OTP", resourceFields.Max_Length);
        let otpMinLength = getResourceValue(this.state.resetPasswordResources, "OTP", resourceFields.Min_Length);

        if (!this.state.securityCode) {
            formValidation = false;
            this.setState({ otpErr: getResourceValue(this.state.resetPasswordResources, 'FIELD_REQUIRED') })
        } else if (this.state.securityCode.length > otpMaxLength) {
            formValidation = false
            this.setState({ otpErr: getResourceValue(this.state.resetPasswordResources, 'OTP_CRITERIA') })
        } else if (this.state.securityCode.length < otpMinLength) {
            formValidation = false
            this.setState({ otpErr: getResourceValue(this.state.resetPasswordResources, 'OTP_CRITERIA') })
        } else {
            this.setState({ otpErr: '' })
        }

        if (this.state.securityCode && this.state.password && this.state.confirmPassword && this.state.confirmPassword !== this.state.password) {
            formValidation = false;
            this.setState({
                notMatchPassword: true,
            })
        }

        return formValidation
    }
    dateChange = date => {
        this.setState({
            startDate: date,
            formattedDate: format(date, 'dd-MM-yyyy'),
            valueInDate: true
        });
    };

    componentDidUpdate() {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getResetPasswordResources() });
        }
    }

    getResetPasswordResources = async () => {
        try {
            globalLoader(true);

            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.RESET_PASSWORD, resourceGroups.ACTIVATE_USER],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === STATUS_CODES.OK) {
                let resources = resourcesResult.data.data.resources;

                this.setState({ resetPasswordResources: resources });

            }
            else  {

                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resetPasswordResources, resourcesResult.data.status.toString()));
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "resetPassword/getResetPasswordResources",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    render() {
        return (
            <div className="px-3">
                <p className="login-txt mb-3 pb-1 primary-color">  {getResourceValue(this.state.resetPasswordResources, 'HEADER_TEXT')}</p>
                <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => this.userResetPassword(ev)}>
                    {this.state.roleType === ROLES.PATIENT ? (
                        <div className="form-group-icon position-relative datepicker-form-group form-group pb-1">
                            <div
                                className={`own-custom-label ${this.state.valueInDate ? "active" : ""
                                    }`}
                            >
                                {getResourceValue(this.state.resetPasswordResources, 'DOB')}
                            </div>
                            <div onClick={this.datePickerClicked}>
                                <DatePicker
                                    selected={this.state.startDate}
                                    onChange={this.dateChange}
                                    onClickOutside={this.datePickerValue}
                                    maxDate={new Date()}
                                    scrollableYearDropdown={true}
                                    yearDropdownItemNumber={100}
                                    dateFormat="dd-MM-yyyy"
                                    popperPlacement="bottom"
                                    popperModifiers={{
                                        flip: {
                                            behavior: ["bottom"] // don't allow it to flip to be above
                                        },
                                        preventOverflow: {
                                            enabled: false // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                                        },
                                        hide: {
                                            enabled: false // turn off since needs preventOverflow to be enabled
                                        }
                                    }}
                                    showYearDropdown
                                    showMonthDropdown
                                    onChangeRaw={(ev) => ev.preventDefault()}
                                />
                            </div>
                            <div className="error-wrapper">
                                {this.state.emptyDob ? (
                                    <span>{getResourceValue(this.state.resetPasswordResources, 'FIELD_REQUIRED')}</span>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                    <div className="form-group-icon form-group">
                        <p className="mb-3 color-green">{getResourceValue(this.state.resetPasswordResources, 'OTP_MESSAGE')}</p>
                    </div>
                    <div className="form-group-icon form-group">
                        <TextField
                            type="text"
                            id="outlined-password-input"
                            label={getResourceValue(this.state.resetPasswordResources, 'OTP')}
                            placeholder={getResourceValue(this.state.resetPasswordResources, 'OTP', resourceFields.Placeholder)}
                            className='mt-0 mb-0 d-flex'
                            margin="normal"
                            variant="outlined"
                            name="securityCode"
                            autoComplete="new-password"
                            onChange={(ev) => this.changeValue(ev)}
                            value={this.state.securityCode}
                        />

                        <div className="error-wrapper">
                            <span >{this.state.otpErr}</span>
                        </div>
                    </div>
                    <div className="form-group-icon form-group">
                        <TextField
                            type={this.state.passwordVisible ? "text" : "password"}
                            id="outlined-password-input"
                            label={getResourceValue(this.state.resetPasswordResources, 'PASSWORD')}
                            placeholder={getResourceValue(this.state.resetPasswordResources, 'PASSWORD', resourceFields.Placeholder)}
                            className='mt-0 mb-0 d-flex'
                            margin="normal"
                            variant="outlined"
                            name="password"
                            autoComplete="new-password"
                            onChange={(ev) => this.changePassword(ev)}
                            value={this.state.password}
                        />
                        <div className="form-img-wrapper cursor" onClick={() => this.toggleEye('passwordVisible')}>
                            {this.state.passwordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                        </div>
                        <div className="error-wrapper">
                            {this.state.passwordErrorMessage}
                        </div>

                    </div>
                    <div className="form-group-icon form-group">
                        <TextField
                            type={this.state.confirmPasswordVisible ? "text" : "password"}
                            id="outlined-password-input"
                            label={getResourceValue(this.state.resetPasswordResources, 'CONFIRM')}
                            placeholder={getResourceValue(this.state.resetPasswordResources, 'CONFIRM', resourceFields.Placeholder)}
                            className='mt-0 mb-0 d-flex'
                            margin="normal"
                            variant="outlined"
                            name="confirmPassword"
                            onChange={(ev) => this.changeValue(ev)}
                            value={this.state.confirmPassword}
                        />
                        <div className="form-img-wrapper cursor" onClick={() => this.toggleEye('confirmPasswordVisible')}>
                            {this.state.confirmPasswordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                        </div>
                        <div className="error-wrapper">
                            {this.state.confirmPasswordErrorMessage}
                            {this.state.notMatchPassword ? <span >{getResourceValue(this.state.resetPasswordResources, 'PASSWORD_NOT_MATCH')}</span> : null}
                        </div>

                    </div>


                    <ul className="pswrd-info-list reset-pswrd-info-list list-unstyled">
                        <li className={`${this.state.minEightChar && this.state.password ? 'active' : ''}`}>{getResourceValue(this.state.resetPasswordResources, 'CRITERIA_MIN')}</li>
                        <li className={`${this.state.oneVarIncluded && this.state.password ? 'active' : ''}`}>{getResourceValue(this.state.resetPasswordResources, 'CRITERIA_CASE')}</li>
                        <li className={`${this.state.numberIncluded && this.state.password ? 'active' : ''}`}>{getResourceValue(this.state.resetPasswordResources, 'CRITERIA_NUM')}</li>
                        <li className={`${this.state.specialCharacter && this.state.password ? 'active' : ''}`}>{getResourceValue(this.state.resetPasswordResources, 'CRITERIA_SPECIAL')}</li>
                    </ul>

                    <div className="pb-3 btn-wrapper">
                        <button type="submit" className="btn btn-own btn-block btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.resetPasswordResources, 'CHANGE_PASSWORD_BUTTON')}</button>
                    </div>
                </form>

            </div>
        )
    }

}

const mapStateToProps = state => ({
    languageId: state.common.languageId
})

export default connect(mapStateToProps)(withRouter(ResetPasswordComponent));

