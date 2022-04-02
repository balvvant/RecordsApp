import { TextField } from '@material-ui/core';
import format from "date-fns/format";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, DashboardStatus,CONSTANTS, OPERATION_PERMISSION_KEYS, resourceFields, resourceGroups, ROLES } from '../Constants/types';
import { CallApiAsync, CheckPermission, getResourceValue, validEmail } from '../Functions/CommonFunctions';

class Support extends Component {
    constructor(props) {
        super(props);
        const token = localStorage.getItem('token');
        this.state = {
            emailId: '',
            message: '',
            emailError: '',
            messageError: '',
            first: false,
            apiRes: false,
            token: token,
            supportResources: [],
            languageId: props.languageId,
        }
    }

    componentDidMount = () => {
        this.getSupportResources();
    }

    componentDidUpdate = () => {
        if (!this.state.emailId && !this.state.first) {
            this.setState({
                emailId: this.props.userDetail?.email,
                first: true,
            })
        }
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getSupportResources() });
        }
    }

    changeValue = (ev) => {
        let name = ev.target.name;
        let value = ev.target.value;
        this.setState({
            [name]: value,
        })
    }

    postData = async (ev) => {
        ev.preventDefault();
        try {
            let formValid = await this.formValidation();
            if (formValid) {
                globalLoader(true)
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: '/send-support-mail',
                    body: {
                        email: this.state.emailId,
                        message: this.state.message,
                        date_time: format(new Date(), "dd/MM/yyyy HH:MM:SS")
                    }
                }
                let res = await CallApiAsync(obj)
                if (res && res.data.status === 200) {
                    this.setState({ successMessage: getResourceValue(this.state.supportResources, 'SUCCESS') })
                    this.setState({
                        emailId: '',
                        message: '',
                        apiRes: true
                    })
                } else  {
                    if (res.data?.data?.errors) {

                        let emailMinLength = getResourceValue(this.state.supportResources, "EMAIL_ID", resourceFields.Min_Length);
                        let emailMaxLength = getResourceValue(this.state.supportResources, "EMAIL_ID", resourceFields.Max_Length);

                        let messageMinLength = getResourceValue(this.state.supportResources, "MESSAGE", resourceFields.Min_Length);
                        let messageMaxLength = getResourceValue(this.state.supportResources, "MESSAGE", resourceFields.Max_Length);

                        this.setState({ emailError: getResourceValue(this.state.supportResources, res.data?.data?.errors?.email).replace('{min_length}', emailMinLength).replace('{max_length}', emailMaxLength) });
                        this.setState({ messageError: getResourceValue(this.state.supportResources, res.data?.data?.errors?.message).replace('{min_length}', messageMinLength).replace('{max_length}', messageMaxLength) });
                    }
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.supportResources, res.data.status.toString()))
                }
               
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "support/postData",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    formValidation = async () => {
        this.setState({
            emailError: '',
            messageError: '',
        })
        let formValidation = true;
        let emailMaxLength = getResourceValue(this.state.supportResources, "EMAIL_ID", resourceFields.Max_Length);
        let messageMinLength = getResourceValue(this.state.supportResources, "MESSAGE", resourceFields.Min_Length);
        let messageMaxLength = getResourceValue(this.state.supportResources, "MESSAGE", resourceFields.Max_Length);

        if (!this.state.emailId) {
            formValidation = false;
            this.setState({
                emailError: getResourceValue(this.state.supportResources, 'FIELD_REQUIRED'),
            })
        }
        else {
            let res = await validEmail(this.state.emailId);
            if (!res) {
                formValidation = false;
                this.setState({
                    emailError: getResourceValue(this.state.supportResources, 'FIELD_INVALID'),
                })
            } else {
                if (this.state.emailId.length > emailMaxLength) {
                    formValidation = false;
                    this.setState({ emailError: getResourceValue(this.state.supportResources, 'FIELD_LENGTH').replace('{max_length}', '100') })
                } else {
                    this.setState({ emailError: '' })
                }
            }
        }

        if (!this.state.message) {
            formValidation = false;
            this.setState({
                messageError: getResourceValue(this.state.supportResources, 'FIELD_REQUIRED'),
            })
        }
        else if (this.state.message.length < messageMinLength || this.state.message.length > messageMaxLength) {
            formValidation = false;
            this.setState({
                messageError: getResourceValue(this.state.supportResources, 'FIELD_LIMIT').replace('{min_length}', messageMinLength).replace('{max_length}', messageMaxLength),
            })
        }
        return formValidation
    }

    renderSupportContent = () => {
        return (
            <>
                <div className="cpl-12 success-wrapper">
                    <span >{this.state.apiRes && this.state.successMessage}</span>
                </div>
                <form className="form-own" onSubmit={this.postData}>
                    <div className="cpb-10 col-12">
                        <div className="font-16 cmt-10 text-justify">
                            <span className="primary-color">{getResourceValue(this.state.supportResources, 'CONTACT_US_NOTE_ONE')}</span> {getResourceValue(this.state.supportResources, 'CONTACT_US_NOTE_TWO')}
                        </div>
                    </div>
                    <div className="col-12 cpb-10">
                        <TextField
                            label={getResourceValue(this.state.supportResources, 'EMAIL_ID')}
                            placeholder={getResourceValue(this.state.supportResources, 'EMAIL_ID', resourceFields.Placeholder)}
                            className={this.state.token ? 'nonEditable mt-0 mb-0 d-flex' : 'mt-0 mb-0 d-flex'}
                            margin="normal"
                            variant="outlined"
                            name="emailId"
                            onChange={(ev) => this.changeValue(ev)}
                            value={this.state.emailId}
                            autoComplete="off"
                            disabled={this.state.token ? true : false}
                        />
                        <div className="error-wrapper">
                            <span>{this.state.emailError}</span>
                        </div>
                    </div>
                    <div className="col-12 own-textarea cpb-10">
                        <TextField
                            multiline
                            label={getResourceValue(this.state.supportResources, 'MESSAGE')}
                            placeholder={getResourceValue(this.state.supportResources, 'MESSAGE', resourceFields.Placeholder)}
                            className='mt-0 mb-0 d-flex'
                            margin="normal"
                            variant="outlined"
                            name="message"
                            onChange={(ev) => this.changeValue(ev)}
                            value={this.state.message}
                            autoComplete="off"
                            rows={3}
                            rowsMax={8}
                        />
                        <div className="error-wrapper">
                            <span >{this.state.messageError}</span>
                        </div>

                    </div>
                    <div className="pb-3 btn-wrapper col-12">
                        <button type="submit" className="btn btn-own min-width-btn-md btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.supportResources, 'SUBMIT')}</button>
                    </div>
                </form>
            </>
        )
    }

    renderSupport = () => {
        let sideBarPermission = CheckPermission(this.props.operationList, OPERATION_PERMISSION_KEYS.SHOW_CATEGORY_SIDEBAR);
        let classes = ``;
        if (this.props.roleKey == ROLES.PATIENT) {
            classes += `container align-middle`;
        }
        if (sideBarPermission) {
            classes += `sidebar-container`;
        }
        return (
            <div className={classes} >
                <div className="container " style={sideBarPermission ? { maxWidth: '100%', margin: '10px' } : { maxWidth: '100%' }}>
                    <div className="justify-content-between cpb-10">
                        <div className="row justify-content-end">
                            <div className="col-12 m-0 p-0">
                                <div className={`${this.state.token ? 'content-container' : 'row max-width-form mx-auto'}`}>
                                    {this.renderSupportContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }

    getSupportResources = async () => {
        try {
            globalLoader(true);

            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.SUPPORT, resourceGroups.COMMON, resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.UNLOCK_DECK, resourceGroups.PATIENT_DASHBOARD, resourceGroups.FEATURE_MENU, resourceGroups.CREATE_PROFILE],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;

                this.setState({ supportResources: resources });
                
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.supportResources, resourcesResult.data.status.toString()));
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "support/getSupportResources",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    render() {
        return (
            <>
                <div>
                    {this.renderSupport()}
                </div>
            </>
        )
    }
}

const mapStateToProps = state => ({
    userDetail: state.user.userDetail,
    languageId: state.common.languageId,
    roleKey: state.common.roleKey,
    operationList: state.common.operationList
})

export default connect(mapStateToProps)(withRouter(Support));