import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert } from '../actions/commonActions';
import { ACTIONS, API_METHODS, DashboardStatus, CONSTANTS,resourceGroups, ROLES } from '../Constants/types';
import ManageProfileComponent from '../Components/ManageProfileComponent';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class ClinicianManageProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: [],
        }
    }
    componentDidMount = () => {
        this.getResource();
    }

    getResource = async () => {
        try {
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.COMMON, resourceGroups.CREATE_PROFILE, resourceGroups.FEATURE_MENU]
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ resources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, resourcesResult.data.status.toString()));
            };
        }
        catch (error) {
            let errorObject = {
                methodName: "ClinicianManageProfile/getResource",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }
    render() {
        return (
            <div className="sidebar-container">
                <div className="container" style={{ maxWidth: '100%' }}>
                    <ManageProfileComponent roleType={ROLES.CLINICIAN} currentAction={ACTIONS.MANAGE_OWN} />
                </div>
            </div>
        )
    }
}

export default withRouter(ClinicianManageProfile);