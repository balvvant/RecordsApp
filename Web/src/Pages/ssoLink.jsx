import React from 'react';
import { connect } from 'react-redux';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, DashboardStatus,CONSTANTS, resourceGroups } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class SSOLink extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            resources: [],
            languageId: props.languageId
        }
    }
    componentDidMount = () => {
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
                    group_id: [resourceGroups.SSO, resourceGroups.COMMON, resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.UNLOCK_DECK, resourceGroups.FEATURE_MENU, resourceGroups.CREATE_PROFILE],
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
                methodName: "SSOLink/getResources",
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
                    <div className=" cpt-10" >
                        <p className="login-txt mb-0 primary-color">{getResourceValue(this.state.resources, "SSOLink")}:</p>
                    </div>
                    <div className="  content-container cpt-10 cpb-10 cpr-10 cpl-10">
                        <p style={{ wordBreak: 'break-all' }}><span style={{ width: '30%', fontWeight: 'bold' }}>{getResourceValue(this.state.resources, "SSO_URL")}:</span> {window.location.origin}/sso?user_id={this.props.userDetail?.user_id}</p>
                        <p style={{ wordBreak: 'break-all' }}><span style={{ width: '30%', fontWeight: 'bold' }}>{getResourceValue(this.state.resources, "LOGIN_NAME")}:</span> {this.props.userDetail?.username}</p>
                        <p style={{ wordBreak: 'break-all' }}><span style={{ width: '30%', fontWeight: 'bold' }}>{getResourceValue(this.state.resources, "LOGIN_PASSWORD")}:</span> {this.props.userDetail?.password}</p>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({
    userDetail: state.user.userDetail,
    orgId: state.user.orgId,
    languageId: state.common.languageId,
})
export default connect(mapStateToProps)(withRouter(SSOLink));
