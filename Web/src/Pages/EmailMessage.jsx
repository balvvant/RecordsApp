import TextField from '@material-ui/core/TextField';
import React from 'react';
import { connect } from 'react-redux';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader, setUserDetail } from '../actions/commonActions';
import { API_METHODS, DashboardStatus, resourceFields, CONSTANTS, resourceGroups } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class EmailMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            emailMsg: '',
            emptyEmailMsg: '',
            emailMessageError: '',
            resources: [],
            languageId: props.languageId,
        }
    }
    componentDidMount() {
        this.basicApiCall()
        this.getResources();
    }
    componentDidUpdate(prevProps) {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getResources() });
        }
    }
    getResources = async () => {
        try {
            globalLoader(true);
            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.COMMON, resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.UNLOCK_DECK, resourceGroups.FEATURE_MENU, resourceGroups.CREATE_PROFILE],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);
            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ resources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, resourcesResult.data.status.toString()));
            }
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "EmailMessageModal/getResources",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }
    basicApiCall = async () => {
        this.setState({
            emailMsg: this.props.userDetail?.email_message
        })
    }
    formSubmit = async () => {
        try {
            this.setState({ emailMessageError: '' });
            let messageMaxLength = getResourceValue(this.state.resources, "DEFAULT_MESSAGE", resourceFields.Max_Length);
            let validate = true;
            if(this.state.emailMsg) {
                if (this.state.emailMsg.length > messageMaxLength) {
                    validate = false;
                    this.setState({ emailMessageError: getResourceValue(this.state.resources, 'FIELD_LENGTH').replace('{max_length}', messageMaxLength) });
                }
            } else {
                validate = false;
                this.setState({ emailMessageError: getResourceValue(this.state.resources, 'FIELD_REQUIRED') });
            }
            
            if (validate) {
                globalLoader(true)
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: '/edit-default-email-template',
                    body: {
                        email_message: this?.state?.emailMsg
                    }
                }
                let res = await CallApiAsync(obj);
                if (res?.data?.status === 200) {
                    let userDetail = this.props.userDetail;
                    userDetail.email_message = this?.state?.emailMsg;
                    setUserDetail(userDetail);
                    globalAlert('success', getResourceValue(this.state.resources, 'EMAIL_TEMPLATE_UPDATED'));
                    globalLoader(false);
                } else {
                    if (res.data?.data?.errors) {
                        let messageMaxLength = getResourceValue(this.state.resources, "DEFAULT_MESSAGE", resourceFields.Max_Length);
                        this.setState({ emailMessageError: getResourceValue(this.state.resources, res.data?.data?.errors?.email_message).replace('{max_length}', messageMaxLength) });
                    }
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, res.data.status.toString()))
                    globalLoader(false)
                }

            }
        } catch (error) {
            let errorObject = {
                methodName: "EmailMessageModal/formSubmit",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }
    render() {
        return (
            <div className="sidebar-container">
                <div className="container" style={{ maxWidth: '100%' }}>
                    <div className='d-flex justify-content-between cpt-10'>
                        <div>
                            <p className="login-txt mb-0 d-flex align-self-center font-20 primary-color">
                                {getResourceValue(this.state.resources, "CHANGE_EMAIL_MESSAGE_LABEL")}
                            </p>
                            <p className="font-14">{getResourceValue(this.state.resources, "DEFAULT_MESSAGE")}</p>
                        </div>
                        <div className=" btn-wrapper  ">
                            <button type="submit" className="btn full-width-xs btn-own btn-own-primary min-height-btn mw-100" onClick={this.formSubmit}>{getResourceValue(this.state.resources, "UPDATE_BUTTON")}</button>
                        </div>
                    </div>
                    <div className="content-container cpl-10 cpt-10 cpr-10 cpb-10" >
                        <TextField
                            type="text"
                            multiline
                            className='mt-0 mb-0 d-flex'
                            margin="normal"
                            variant="outlined"
                            name="emailMsg"
                            onChange={(ev) => this.setState({
                                emailMsg: ev.target.value
                            })}
                            value={this.state.emailMsg}
                            rows={1}
                        />
                        <div className="error-wrapper">
                            <span>{this.state.emailMessageError}</span>
                            {this.state.emptyEmailMsg && !this.state.emailMsg ? <span >{getResourceValue(this.state.resources, "FIELD_REQUIRED")}</span> : null}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
const mapStateToProps = state => ({
    userDetail: state.user.userDetail,
    orgId: state.user.orgId,
    languageId: state.common.languageId
})

export default connect(mapStateToProps)(withRouter(EmailMessage));
