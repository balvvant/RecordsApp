import { TextField } from '@material-ui/core';
import React, { Component } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { changeCurrentSidebarSubMenu, changeOpenComponent, changeOrgId, changeResourceKey, changeTheScreen, errorLogger, globalAlert, globalLoader, updateLanguageList, verifyRoute } from '../actions/commonActions';
import { API_METHODS, defaultLanguage, PRIMARY_COLOR, PRIMARY_FONT_COLOR, resourceFields, resourceGroups, RESOURCE_KEYS,CONSTANTS, SCREENS ,STATUS_CODES } from '../Constants/types';
import { CallApiAsync, clearSSOUser, getResourceValue, sessionSetup, validEmail } from '../Functions/CommonFunctions';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            emailId: '',
            passwordVisible: false,
            emailErrorMessage: '',
            passwordErrorMessage: '',
            timer: '',
            isLockout: false,
            loginResources: [],
            languageId: props.languageId
        }
    }
    componentDidMount = () => {

        let newdate = new Date();
        let getTimein = localStorage.getItem('timeIn');
        if (getTimein) {
            let oldDate = new Date(getTimein)
            var difference = (newdate - oldDate) / 1000;
            if (Math.floor(difference) >= 295) {
                this.setState({ isLockout: false })
                localStorage.removeItem('isLockout');
                localStorage.removeItem('endTime');
                localStorage.removeItem('timeIn');
            } else {
                let endTime = localStorage.getItem('endTime');
                localStorage.setItem('endTime', (endTime - difference));
            }
        }
        if (localStorage.getItem('token')) {
            let isSSOUser = localStorage.getItem('isSSOUser');
            if (isSSOUser) {
                clearSSOUser(this.props.history, '/')
                this.fetchData();
            } else {
                verifyRoute(this.props.history, `/dashboard`);
            }

        } else {
            this.fetchData();
        }
    }

    fetchData = () => {
        //get login resources
        this.getLoginResources();

        changeOrgId(null)
        changeCurrentSidebarSubMenu(null);

        // reverse back to default primary color
        document.body.style.setProperty('--primary-color', PRIMARY_COLOR);
        document.body.style.setProperty('--primary-font-color', PRIMARY_FONT_COLOR);

        let isLockout = JSON.parse(localStorage.getItem('isLockout'));
        let timeEnd = JSON.parse(localStorage.getItem('endTime'));

        if (timeEnd || (isLockout && isLockout > 2)) {
            this.setState({ isLockout: true });
            this.timeCount();
        }
    }

    componentDidUpdate() {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getLoginResources() });
        }
    }

    getLoginResources = async () => {
        try {
            globalLoader(true);

            //get language data
            let languageId = localStorage.getItem('language_id');
            if (!languageId) {
                languageId = defaultLanguage;
            }

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.LOGIN, resourceGroups.ACTIVATE_USER, resourceGroups.COMMON],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);
            if (resourcesResult.data.status === STATUS_CODES.OK) {
                let resources = resourcesResult.data.data.resources;
                let languages = resourcesResult.data.data.languages;
                this.setState({ loginResources: resources });
                if (languages.length > 0) {
                    updateLanguageList(languages);
                    localStorage.setItem('languageList', JSON.stringify(languages))
                }
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.loginResources, resourcesResult.data.status.toString()));
            }
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "login/getLoginResources",
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
        this.setState({
            [name]: value,
        })
    }

    userLogin = async (ev) => {
        ev.preventDefault();
        try {
            if (this.formValidation()) {
                globalLoader(true)
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: '/login',
                    body: {
                        email: this.state.emailId,
                        password: this.state.password,
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
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.loginResources, result?.data?.status.toString()))
                    }
                } else  {
                    if (result?.data?.data?.errors) {
                        let emailMinLength = getResourceValue(this.state.loginResources, "EMAIL_ID", resourceFields.Min_Length);
                        let emailMaxLength = getResourceValue(this.state.loginResources, "EMAIL_ID", resourceFields.Max_Length);
                        let passwordMinLength = getResourceValue(this.state.loginResources, "PASSWORD", resourceFields.Min_Length);
                        let passwordMaxLength = getResourceValue(this.state.loginResources, "PASSWORD", resourceFields.Max_Length);
                        this.setState({ emailErrorMessage: getResourceValue(this.state.loginResources, result?.data?.data?.errors?.email).replace('{min_length}', emailMinLength).replace('{max_length}', emailMaxLength) });
                        this.setState({ passwordErrorMessage: getResourceValue(this.state.loginResources, result?.data?.data?.errors?.password).replace('{min_length}', passwordMinLength).replace('{max_length}', passwordMaxLength) });

                        const count = Number(1)
                        let isLockout = JSON.parse(localStorage.getItem('isLockout'));

                        if (isLockout && isLockout >= 2) {
                            this.setState({ isLockout: true });
                            this.timeCount();
                        }
                        else {
                            localStorage.setItem('isLockout', isLockout ? isLockout + 1 : JSON.parse(count));
                        }
                    }
                    globalLoader(false)
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.loginResources, result?.data?.status.toString()))
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "login/userLogin",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }

    }

    formValidation = async () => {
        let formValidation = true;
        let emailMaxLength = getResourceValue(this.state.loginResources, "EMAIL_ID", resourceFields.Max_Length);
        if (!this.state.emailId) {
            formValidation = false;
            this.setState({
                emailErrorMessage: getResourceValue(this.state.loginResources, 'FIELD_REQUIRED')
            })
        }
        else {
            let validEmailLocal = await validEmail(this.state.emailId);
            if (!validEmailLocal) {
                formValidation = false;
                this.setState({
                    emailErrorMessage: getResourceValue(this.state.loginResources, 'FIELD_INVALID')
                })
            } else {
                if (this.state.emailId.length > emailMaxLength) {
                    formValidation = false;
                    this.setState({ emailErrorMessage: getResourceValue(this.state.loginResources, 'FIELD_LENGTH').replace('{max_length}', emailMaxLength) })
                } else {
                    this.setState({ emailErrorMessage: '' })
                }
            }
        }

        let passwordMinLength = getResourceValue(this.state.loginResources, "PASSWORD", resourceFields.Min_Length);
        let passwordMaxLength = getResourceValue(this.state.loginResources, "PASSWORD", resourceFields.Max_Length);
        if (!this.state.password) {
            formValidation = false;
            this.setState({ passwordErrorMessage: getResourceValue(this.state.loginResources, 'FIELD_REQUIRED') })
        } else if (this.state.password.length == 0) {
            formValidation = false;
            this.setState({ passwordErrorMessage: getResourceValue(this.state.loginResources, 'FIELD_INVALID') })
        } else if (this.state.password.length < passwordMinLength || this.state.password.length > passwordMaxLength) {
            formValidation = false;
            this.setState({ passwordErrorMessage: getResourceValue(this.state.loginResources, 'FIELD_LIMIT').replace('{min_length}', passwordMinLength).replace('{max_length}', passwordMaxLength) })
        } else {
            this.setState({ passwordErrorMessage: '' })
        }
        return formValidation
    }

    timeCount = () => {
        let t = this;
        let date = new Date();
        var interval = localStorage.getItem('endTime') ? localStorage.getItem('endTime') : 300;
        localStorage.setItem('timeIn', date);
        let counterTimer = setInterval(function () {
            if (interval > 0) {
                var sec_num = parseInt(interval, 10); // don't forget the second param
                var hours = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = sec_num - (hours * 3600) - (minutes * 60);

                t.setState({ timer: minutes + ':' + seconds })
                --interval;
                localStorage.setItem('endTime', interval + 1);

            }
            else {
                t.setState({ isLockout: false })
                localStorage.removeItem('isLockout');
                localStorage.removeItem('endTime');
                localStorage.removeItem('timeIn');
                clearInterval(counterTimer)
            }

        }, 1000);
    }

    render() {
        return (
            <div>
                <div className="d-flex flex-wrap w-100 justify-content-center">
                    <div className="form-width-sm w-100 contain-container" style={{ paddingBottom: "5vw" }}>
                        <div className="px-3">
                            {!this.state.isLockout &&
                                <div>
                                    <p className="login-txt mb-3 pb-1 primary-color">{getResourceValue(this.state.loginResources, 'HEADER')}</p>

                                    <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => this.userLogin(ev)}>

                                        <div className="form-group-icon position-relative form-group pb-1">
                                            <TextField
                                                label={getResourceValue(this.state.loginResources, 'EMAIL_ID')}
                                                placeholder={getResourceValue(this.state.loginResources, 'EMAIL_ID', resourceFields.Placeholder)}
                                                className='mt-0 mb-0 d-flex'
                                                margin="normal"
                                                variant="outlined"
                                                name="emailId"
                                                onChange={(ev) => this.changeValue(ev)}
                                                value={this.state.emailId}
                                                disabled={this.props.activate}

                                            />
                                            <div className="form-img-wrapper no-pointer">
                                                <img src="/assets/img/lock-arrow.png" alt="lock" />
                                            </div>
                                            <div className="error-wrapper">
                                                {this.state.emailErrorMessage}
                                            </div>
                                        </div>

                                        <div className="form-group-icon form-group">
                                            <TextField
                                                type={this.state.passwordVisible ? "text" : "password"}
                                                id="outlined-password-input"
                                                label={getResourceValue(this.state.loginResources, 'PASSWORD')}
                                                placeholder={getResourceValue(this.state.loginResources, 'PASSWORD', resourceFields.Placeholder)}
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
                                        <div className="pb-3 btn-wrapper">
                                            <button type="submit" className="btn btn-own btn-block btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.loginResources, 'BUTTON')}</button>
                                        </div>
                                        <div className="text-right forgot-wrapper pb-3 font-bold">
                                            <a href={`#`} onClick={() => changeTheScreen(SCREENS.FORGOT_PASSWORD)} className="link-color">{getResourceValue(this.state.loginResources, 'FORGOT_PASSWORD')}</a>
                                        </div>
                                        {
                                            <>
                                                <div className="text-center or-txt-wrapper">  </div>

                                                <p className="or-option-txt text-center">
                                                    {getResourceValue(this.state.loginResources, 'READ_PRIVACY_AND_TERMS_TEXT_LINK')} {<a href={`/static-page/${RESOURCE_KEYS.PRIVACY_NOTICE}`} style={{ textDecoration: 'underline' }} >{getResourceValue(this.state.loginResources, 'PRIVACY_NOTICE')}</a>} {getResourceValue(this.state.loginResources, 'AND')} {<a href={`/static-page/${RESOURCE_KEYS.TERMS_OF_USE}`}  style={{ textDecoration: 'underline' }} >{getResourceValue(this.state.loginResources, 'TERMS_OF_USE')}</a>}
                                                </p>
                                                <p className="link-color or-option-txt text-center cursor">
                                                    <a href={`#`} onClick={() => changeTheScreen(SCREENS.SUPPORT)} className="link-color" >{getResourceValue(this.state.loginResources, 'SUPPORT')}</a>
                                                </p>
                                            </>
                                        }
                                    </form>
                                </div>
                            }
                            {
                                this.state.isLockout &&
                                <div className="text-center mb-5">{getResourceValue(this.state.loginResources, 'LOCKOUT_MESSAGE')} <span id="timer" > {this.state.timer}</span></div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
    routes: state.common.routes,
})

export default connect(mapStateToProps)(withRouter(Login));

