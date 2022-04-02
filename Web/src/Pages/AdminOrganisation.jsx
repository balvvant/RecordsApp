import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, resourceGroups,CONSTANTS, ROLES } from "../Constants/types";
import AddOrganisationModal from '../Modals/addOrganisationModal';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class AdminOrganisation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentData: null,
            adminResources: [],
            languageId: props.languageId,
        }
    }

    componentDidMount = () => {
        globalLoader(true)
        this.viewUserApi();
        this.getAdminResources();
    }
    componentDidUpdate = () => {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources() });
        }
    }

    getAdminResources = async () => {
        try {
            globalLoader(true);
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.MANAGE_ORGANIZATION, resourceGroups.COMMON, resourceGroups.UPLOAD_MEDIA, resourceGroups.MEDIA_CATEGORY],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);
            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "editOrganization/getAdminResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    viewUserApi = async () => {
        try {
            globalLoader(true)

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-organizations',
                body: {
                    orgId: this.props.orgId.organization_id
                }
            }

            let organizationResult = await CallApiAsync(obj);
            if (organizationResult.data.status === 200) {
                if (organizationResult.data.data.organizations.length > 0) {
                    this.setState({ currentData: organizationResult.data.data.organizations[0] }, () => { globalLoader(false) })
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, 'NO_ORGANIZATION'));
                }
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, organizationResult.data.status.toString()))
                this.setState({ currentData: null }, () => globalLoader(false));
            }
        } catch (error) {
            let errorObject = {
                methodName: "editOrganization/viewUserApi",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    render() {
        return (
            <>
                {this.state.currentData && <AddOrganisationModal editMode={true} currentData={this.state.currentData} roleType={ROLES.ADMIN} resources={this.state.adminResources} />}
            </>
        )
    }
}

const mapStateToProps = state => ({
    orgId: state.user.orgId,
    languageId: state.common.languageId
})

export default connect(mapStateToProps)(withRouter(AdminOrganisation));