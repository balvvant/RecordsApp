import { TextField } from '@material-ui/core';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { changeTheScreen, errorLogger, globalAlert, globalLoader, storeResetParam } from '../actions/commonActions';
import { API_METHODS, resourceFields,CONSTANTS, SCREENS, resourceGroups } from '../Constants/types';
import { CallApiAsync, getResourceValue, validEmail } from '../Functions/CommonFunctions';


class ForgotPasswordComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            emailId: '',
            optValue: '',
            securityQues: [],
            securityAns: '',
            emptysecurityAns: false,
            validEmailRes: false,
            hideOpt: false,
            securityQuesId: '',
            emptyQues: false,
            emailErrorMessage: '',
            securityAnsError: '',
            timer: '',
            isLockout: false,
            forgotPasswordResources: [],
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
        let isLockout = JSON.parse(localStorage.getItem('isLockout'));
        let timeEnd = JSON.parse(localStorage.getItem('endTime'));
        if (timeEnd || (isLockout && isLockout > 2)) {
            this.setState({ isLockout: true });
            this.timeCount();
        }

        this.getForgotPasswordResources();
    }

    componentDidUpdate = () => {

        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getForgotPasswordResources() });
        }
    }

    /**
     * Forgot password resources
     */
    getForgotPasswordResources = async () => {
        try {


            globalLoader(true);

            //get language data
            let languageId = this.state.languageId;
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id : resourceGroups.FORGOTPASSWORD,
                    common : true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ forgotPasswordResources: resources });

            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.forgotPasswordResources, resourcesResult.data.status.toString()));
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "forgotPassword/getForgotPasswordResources",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    changeValue = (ev) => {

        let name = ev.target.name;
        let value = ev.target.value;

        this.setState({
            [name]: value,
        })
    }

    userSendForgotOption = async (ev) => {
        ev.preventDefault();
        try {
            if (this.formValidation('mail')) {
                globalLoader(true)
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: '/validate-user',
                    body: {
                        email: this.state.emailId
                    }
                }
                let apiRes = await CallApiAsync(obj);
                if (apiRes && apiRes.data.status === 200) {
                    globalAlert('success', getResourceValue(this.state.forgotPasswordResources, 'OTP_SUCCESS'));
                    this.setState({
                        hideOpt: true,
                    })
                    let userData = {
                        role: apiRes.data.data.role,
                        mail: obj.body.email
                    }
                    storeResetParam(userData);
                    changeTheScreen(SCREENS.RESET_PASSWORD);
                    globalLoader(false)

                } else {
                    if (apiRes?.data?.data?.errors) {
                        let minLength = getResourceValue(this.state.forgotPasswordResources, "EMAIL_ID", resourceFields.Min_Length);
                        let maxLength = getResourceValue(this.state.forgotPasswordResources, "EMAIL_ID", resourceFields.Max_Length);
                        this.setState({ emailErrorMessage: getResourceValue(this.state.forgotPasswordResources, apiRes?.data?.data?.errors?.email).replace('{min_length}', minLength).replace('{max_length}', maxLength) });
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
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.forgotPasswordResources, apiRes.data.status.toString()))
                }
               
            }

        } catch (error) {
            let errorObject = {
                methodName: "forgotPassword/userSendForgotOption",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }

    }

    formValidation = async (input) => {
        let formValidation = true;
        if (input === 'mail') {
            if (!this.state.emailId) {
                formValidation = false;
                this.setState({
                    emailErrorMessage: getResourceValue(this.state.forgotPasswordResources, 'FIELD_REQUIRED')
                })
            }
            else {

                let minLength = getResourceValue(this.state.forgotPasswordResources, "EMAIL_ID", resourceFields.Min_Length);
                let maxLength = getResourceValue(this.state.forgotPasswordResources, "EMAIL_ID", resourceFields.Max_Length);

                let validEmailLocal = await validEmail(this.state.emailId);
                if (!validEmailLocal) {
                    formValidation = false;
                    this.setState({
                        emailErrorMessage: getResourceValue(this.state.forgotPasswordResources, 'FIELD_INVALID')
                    })
                } else {
                    if (this.state.emailId.length > maxLength) {
                        formValidation = false;
                        this.setState({ emailErrorMessage: getResourceValue(this.state.forgotPasswordResources, 'FIELD_LENGTH').replace('{max_length}', maxLength) })
                    } else {
                        this.setState({ emailErrorMessage: '' })
                    }
                }
            }
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
        const { validEmailRes } = this.state;
        return (
            <div className="px-3">
                {!this.state.isLockout &&
                    <div>
                        {/* <LanguageComponent /> */}

                        <p className="login-txt mb-3 pb-1 primary-color">{getResourceValue(this.state.forgotPasswordResources, 'HEADER')}</p>
                        <form className="form-own pb-3" noValidate autoComplete="off" onSubmit={(ev) => this.userSendForgotOption(ev)}>
                            <div className="form-group-icon position-relative form-group pb-1">
                                <TextField
                                    id="outlined-textarea"
                                    label={getResourceValue(this.state.forgotPasswordResources, 'EMAIL_ID')}
                                    placeholder={getResourceValue(this.state.forgotPasswordResources, 'EMAIL_ID', resourceFields.Placeholder)}
                                    className='mt-0 mb-0 d-flex'
                                    margin="normal"
                                    variant="outlined"
                                    name="emailId"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.emailId}
                                    disabled={validEmailRes}
                                />
                                <div className="form-img-wrapper no-pointer">
                                    <img src="/assets/img/lock-arrow.png" alt="lock" />
                                </div>
                                <div className="error-wrapper">
                                    {this.state.emailErrorMessage}
                                </div>
                            </div>

                            <div className="pb-3 btn-wrapper">
                                <button type="submit" className="btn btn-own btn-block btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.forgotPasswordResources, 'SUBMIT')}</button>
                            </div>
                        </form>
                    </div>
                }
                {
                    this.state.isLockout &&
                    <div className="text-center">{getResourceValue(this.state.forgotPasswordResources, 'LOCKOUT_MESSAGE')} <span id="timer" > {this.state.timer}</span></div>
                }
            </div>
        )
    }

}

const mapStateToProps = state => ({
    userDetail: state.user.userDetail,
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(ForgotPasswordComponent));

