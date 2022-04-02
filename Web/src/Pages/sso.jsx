import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { changeRoutes, errorLogger, globalLoader, setUserDetail, verifyRoute } from '../actions/commonActions';
import { API_METHODS, resourceGroups, ROLES, TokenStatusValues } from '../Constants/types';
import AddAdminModal from '../Modals/addAdminModal';
import { CallApiAsync, clearStorage, getResourceValue } from '../Functions/CommonFunctions';

class SSO extends Component {

    constructor(props) {
        super(props);

        this.state = {
            validType: false,
            message: "",
            userDetails: {},
            roles: [],
            patientDetails: {},
            openAddPatientModal: false,
            adminResources: [],
            languageId: 0,
            prefilledData: {},
            patientExists: false,
            headerParams: {}
        }
    }


    componentDidMount = () => {

        this.callInitialApi();
    }

    callInitialApi = async () => {
        try {
            globalLoader(true)
            var search = window.location.search;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/sso-authenticate',
                body: this.parseParams(search)
            }

            let result = await CallApiAsync(obj);
            if (result.data.status === 200) {

                if (localStorage.getItem('token')) {
                    clearStorage();
                }

                if (result?.data?.data?.userInfo) {
                    let userDetail = result?.data?.data?.userInfo;
                    let patient_exists = result.data.data.patientExists;
                    let prefilledData = {
                        lastname: obj.lastname,
                        dob: obj.dob,
                        nhsNumber: obj.nhs_number,
                        orgId: obj.org_id
                    }

                    localStorage.setItem('token', userDetail.token);
                    localStorage.setItem('refresh_token', userDetail.refresh_token);
                    localStorage.setItem('routeList', JSON.stringify(userDetail.features));
                    localStorage.setItem('ssoOrgId', obj.org_id);
                    await changeRoutes(userDetail.features);
                    localStorage.setItem('token_status', TokenStatusValues.ALIVE);
                    localStorage.setItem('userDetail', JSON.stringify(userDetail));
                    setUserDetail(userDetail);

                    this.setState({ userDetails: userDetail, roles: result.data.data.roles, patientDetails: result.data.data.patientDetails, prefilledData, patientExists: patient_exists, headerParams: obj }, () => {
                        if (patient_exists == false) {
                            this.getAdminResources();
                        } else {
                            this.checkPatientDetails(200);
                        }
                    });
                }
                else {
                    globalLoader(false)
                    this.setState({ validType: true, message: getResourceValue(this.state.adminResources, result?.data?.status.toString()) });
                }
            }
            else {
                this.setState({ validType: true, message: getResourceValue(this.state.adminResources, result?.data?.status.toString()) });
                globalLoader(false)
            }
        } catch (error) {
            globalLoader(false)
            this.setState({ validType: true });

            let errorObject = {
                methodName: "sso/callInitialApi",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
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
                    group_id: [resourceGroups.MANAGE_USERS, resourceGroups.COMMON, resourceGroups.CREATE_PROFILE, resourceGroups.SSO, resourceGroups.UPLOAD_MEDIA],

                }
            }
            let resourcesResult = await CallApiAsync(obj);
            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources },
                    () => {
                        this.setState({ openAddPatientModal: true });
                    });
                globalLoader(false);
            }
            else {
                this.setState({ validType: true, message: getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()) });
                globalLoader(false);
            }
        }
        catch (error) {
            let errorObject = {
                methodName: "sso/getAdminResources",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    checkPatientDetails = async (status) => {
        this.setState({ closeAddUserModal: false });
        globalLoader(false);
        if (this.state.patientExists == false) {
            if (status == 200) {
                let obj = {
                    method: API_METHODS.post,
                    history: this.props.history,
                    api: '/get-patient-data',
                    body: {
                        nhs_number: this.state.prefilledData.nhsNumber
                    }
                }

                let result = await CallApiAsync(obj);
                if (result.data.status === 200) {
                    this.setState({ patientDetails: result.data.data.patient_details }, () => {
                        this.goToDashboard();
                    })
                } else {
                    this.setState({ validType: true, message: getResourceValue(this.state.adminResources, result?.data?.status.toString()) });
                    globalLoader(false)
                }
            } else {
                this.goToDashboard();
            }
        }
    }

    goToDashboard = () => {
        let userDetails = this.state.userDetails;
        let patientDetails = this.state.patientDetails;

        localStorage.setItem('isSSOUser', true);
        localStorage.setItem('patient_detail', JSON.stringify(patientDetails));

        let history = this.props.history;

        if (!userDetails.user_profile_exist) {
            verifyRoute(history, `/create-profile`);
        } else {
            verifyRoute(history, `/dashboard`);
        }
    }

    parseParams = (querystring) => {

        // parse query string
        const params = new URLSearchParams(querystring);

        const obj = {};

        // iterate over all keys
        for (const key of params.keys()) {
            if (params.getAll(key).length > 1) {
                obj[key] = params.getAll(key);
            } else {
                obj[key] = params.get(key);
            }
        }

        return obj;
    };





    render() {
        return (
            <>
                {this.state.validType &&
                    <section className="login-comp-wrapper main-login-comp">
                        <div className="d-flex flex-wrap w-100 justify-content-center">
                            <div className="form-width-sm w-100">
                                <div style={{
                                    position: 'absolute', left: '50%', top: '50%',
                                    transform: 'translate(-50%, -50%)', textAlign: 'center'
                                }}>
                                    <h3>SSO</h3>
                                    <p>{this.state.message}</p>
                                </div>
                            </div>
                        </div>
                    </section>}

                {
                    this.state.openAddPatientModal ?
                        <AddAdminModal
                            closeCallBackOption={(status) => this.checkPatientDetails(status)}
                            open={true}
                            ssoFlag={true}
                            organizations={[]}
                            noClose={true}
                            roleType={ROLES.PATIENT}
                            resources={this.state.adminResources}
                            patientTags={[]}
                            prefilledData={this.state.prefilledData}
                            history={this.props.history}
                            add={getResourceValue(this.state.adminResources, 'ADD')}
                            clinicianLabel={getResourceValue(this.state.adminResources, 'ADD_CLINICIAN')}
                            patientLabel={getResourceValue(this.state.adminResources, 'SSO_ADD_PATIENT_LABEL')}
                            requiredField={getResourceValue(this.state.adminResources, 'FIELD_REQUIRED')}
                        />
                        : null}
            </>
        )
    }
}

export default withRouter(SSO);