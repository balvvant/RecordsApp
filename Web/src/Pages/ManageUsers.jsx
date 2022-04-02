import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader, otherUserData, organizationsArray } from '../actions/commonActions';
import { ACTIONS, API_METHODS, BUTTON_TYPES, CONSTANTS, resourceGroups, ROLES, USER_STATUS } from "../Constants/types";
import AddAdminModal from '../Modals/addAdminModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import ManageProfileComponent from '../Components/ManageProfileComponent';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class ManageUsers extends Component {
    constructor(props) {
        super(props);
        let currentTabActive = '';
        if (props.role == ROLES.SUPER_ADMIN) {
            currentTabActive = ROLES.SUPER_ADMIN;
        } else {
            currentTabActive = ROLES.CLINICIAN;
        }
        this.state = {
            openEditUserModal: false,
            openAddUserModal: false,
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            userDataArray: [],
            currentUserId: null,
            currentUserOrg: null,
            totalDocument: null,
            currentTabActive: currentTabActive,
            tabArray: [],
            organizations: [],
            patientTags: [],
            adminResources: [],
            languageId: props.languageId,
            patientEditTags: "",
            columns: [],
            isArchive: props.isArchive ? props.isArchive : false,
            statusModal: false,
            selectedUserId: null,
        }
    }

    componentDidMount = () => {
        try {
            this.getAdminResources();
            this.viewUserApi()
        } catch (error) {
            let errorObject = {
                methodName: "manageUsers/componentDidMount",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    componentDidUpdate = () => {
        const { languageId, isArchive } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources() });
        }
        if (isArchive != this.state.isArchive) {
            this.setState({ isArchive: isArchive }, () => { this.viewUserApi() });
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
                    group_id: [resourceGroups.MANAGE_USERS, resourceGroups.COMMON, resourceGroups.FORGOTPASSWORD, resourceGroups.CREATE_PROFILE, resourceGroups.MANAGE_MEDIA, resourceGroups.UPLOAD_MEDIA, resourceGroups.FEATURE_MENU],
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
            let columns = [
                {
                    databaseColumn: 'first_name',
                    columnName: getResourceValue(this.state.adminResources, 'FIRSTNAME'),
                    isSort: true
                },
                {
                    databaseColumn: 'last_name',
                    columnName: getResourceValue(this.state.adminResources, 'LASTNAME'),
                    isSort: true
                },
                {
                    databaseColumn: 'email',
                    columnName: getResourceValue(this.state.adminResources, 'EMAIL_ID'),
                    isSort: true
                },
                {
                    databaseColumn: 'activation_status',
                    columnName: getResourceValue(this.state.adminResources, 'STATUS'),
                    isSort: true
                }
            ];
            this.setState({ columns: columns });
            let tempTabArray = [];
            if (this.props.role == ROLES.ADMIN) {
                this.setState({ currentTabActive: ROLES.CLINICIAN })
                this.resetApiVal()
                tempTabArray.push({ name: getResourceValue(this.state.adminResources, 'CLINICIAN'), val: ROLES.CLINICIAN });
                tempTabArray.push({ name: getResourceValue(this.state.adminResources, 'PATIENT'), val: ROLES.PATIENT });
            } else {
                this.setState({ currentTabActive: ROLES.SUPER_ADMIN })
                tempTabArray.push({ name: getResourceValue(this.state.adminResources, 'SUPER_ADMIN'), val: ROLES.SUPER_ADMIN });
                this.resetApiVal()
            }
            tempTabArray.push({ name: getResourceValue(this.state.adminResources, 'ADMIN'), val: ROLES.ADMIN });
            this.setState({ tabArray: tempTabArray });
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "manageUsers/getAdminResources",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    viewUserApi = async () => {
        try {
            globalLoader(true)
            let obj = {
                method:API_METHODS.POST,
                history:this.props.history,
                api:'',
                body:{
                role: this.state.currentTabActive,
                view_records: this.state.pageSize,
                view_page: this.state.currentPage,
                search_string: this.state.searchVal && this.state.searchVal,
                sort_col_name: this.state.sortColName && this.state.sortColName,
                sort_col_type: this.state.sortType ? "ASC" : "DESC"
            }}
            if (this.state.isArchive) {
                obj.body.deleted = '1';
            }
            if(this.state.currentTabActive=== ROLES.SUPER_ADMIN) {
                obj.api='/view-superadmin-users'
            }
            else if(this.state.currentTabActive=== ROLES.ADMIN) {
                obj.api='/view-admin-users'
            }
            else if(this.state.currentTabActive=== ROLES.CLINICIAN) {
                obj.api='/view-clinician-users'
            }
            else if(this.state.currentTabActive=== ROLES.PATIENT) {
                obj.api='/view-patient-users'
            }
            let userResult = await CallApiAsync(obj);
            if (userResult.data.status === 200) {
                let tagsList = userResult.data?.data.patientTags;
                if (tagsList.length > 0) {
                    const patientTags = tagsList.map((obj) => ({
                        id: obj.tag_id.toString(),
                        text: obj.tag_name
                    }));
                    this.setState({ patientTags: patientTags });
                }
                if(userResult.data?.data?.users) {
                    let statusKey = ``;
                    for (let userData of userResult.data.data.users) {
                        statusKey = ``;
                        if(userData.activation_status == USER_STATUS.CREATED) {
                            statusKey = 'USER_CREATED';
                        } else if (userData.activation_status == USER_STATUS.INVITED) {
                            statusKey = 'USER_INVITED_STATUS';
                        } else if (userData.activation_status == USER_STATUS.ACTIVATED) {
                            statusKey = 'USER_REGISTERED';
                        }
                        userData.activation_status = getResourceValue(this.state.adminResources, statusKey);
                    }
                }
                if(obj.api == '/view-admin-users') {
                    organizationsArray(userResult.data?.data?.organizations);
                }
                this.setState({
                    userDataArray: userResult.data?.data?.users,
                    totalDocument: userResult.data?.data?.totalCount,
                    organizations: userResult.data?.data?.organizations
                }, () => {
                    globalLoader(false)
                })
            } else  {
                this.setState({
                    userDataArray: [],
                    totalDocument: 0,
                }, () => {
                    globalLoader(false)
                })
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, userResult.data.status.toString()))
                this.setState({
                    userDataArray: [],
                    totalDocument: null,
                    organizations: userResult.data.data.organizations
                }, () => {
                    globalLoader(false)
                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageUsers/viewUserApi",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    deactivateUser = async (id) => {
        try {
            globalLoader(true);
            let localTotalUserId = this.state.userDataArray.find(y => y.user_id == id);
            let obj = {
                method:API_METHODS.POST,
                history:this.props.history,
                api:'',
                body:{
                ids: localTotalUserId.user_id.toString(),
                status: this.state.isArchive ? "1" : "0",
            }}
            if(this.state.currentTabActive=== ROLES.SUPER_ADMIN) {
                obj.api='/archive-restore-superadmin'
            }
            else if(this.state.currentTabActive=== ROLES.ADMIN) {
                obj.api='/archive-restore-admin'
            }
            else if(this.state.currentTabActive=== ROLES.CLINICIAN) {
                obj.api='/archive-restore-clinician'
            }
            else if(this.state.currentTabActive=== ROLES.PATIENT) {
                obj.api='/archive-restore-patient'
            }
            let userResult = await CallApiAsync(obj);
            if (userResult.data.status === 200) {
                if (localTotalUserId.length == this.state.userDataArray.length) {
                    this.setState((prevState => ({ currentPage: prevState.currentPage - 1 })));
                }
                this.viewUserApi()
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, userResult.data.status.toString()))
                globalLoader(false);
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageUsers/deactivateUser",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }

    }

    openEditUserModalFunc = (id) => {
        let org = {};
        let user = this.state.userDataArray.find(e => e.user_id == id);
        otherUserData(user)
        if (user.organizations && user.organizations.length > 0) {
            org = user.organizations[0];
        }
        const patientEditTags = user.patient_tags.map((obj) => ({
            id: obj.tag_id.toString(),
            text: obj.tag_name
        }));

        this.setState({
            currentUserId: id,
            currentUserOrg: org,
            patientEditTags: patientEditTags,
            editMode: true,
        }, () => {
            this.setState({
                openEditUserModal: true,
            })
        })
    }

    searchFilter = (ev) => {
        ev.preventDefault();
        this.viewUserApi()
    }

    sortingTable = (val) => {
        if (val === this.state.sortColName) {
            this.setState((prevState => ({
                sortType: !prevState.sortType,
                currentPage: 1,
            })), () => {
                this.viewUserApi()
            })
        }
        else {
            this.setState({
                sortColName: val,
                sortType: true,
                currentPage: 1,
            }, () => {
                this.viewUserApi()
            })
        }
    }

    onCloseChangeModal = (val) => {
        this.setState({
            openEditUserModal: false,
        }, () => {
            if (val) {
                this.viewUserApi();
            }
        })
    }

    changePageSize = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value,
            currentPage: 1,
        }, () => {
            this.viewUserApi()
        })
    }

    changeValue = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value
        })
    }

    setcurrentTabActive = (event) => {
        this.setState({
            currentTabActive: event.target.value,
        }, () => {
            this.resetApiVal()
        })
    }

    resetApiVal = () => {
        this.setState({
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
        }, () => {
            this.viewUserApi()
        })
    }

    goToPage = (ev, val) => {
        try {
            if (ev) {
                this.setState({ currentPage: ev.target.value }, () => this.viewUserApi());
            }
            else {
                if (val === CONSTANTS.NEXT) {
                    this.setState((prevState => ({ currentPage: prevState.currentPage + 1 })), () => this.viewUserApi());
                }
                else if (val === CONSTANTS.PREV) {
                    this.setState((prevState => ({ currentPage: prevState.currentPage - 1 })), () => this.viewUserApi());
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageUsers/goToPage",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    resendUserEmail = async (orgId) => {
        globalLoader(true)
        let obj = {
            method:API_METHODS.POST,
            history:this.props.history,
            api:'',
            body:{
            user_id: this.state.currentUserId,
            orgId: orgId,
            role: this.state.currentTabActive
        }}
        if(this.state.currentTabActive=== ROLES.SUPER_ADMIN) {
            obj.api='/superadmin-resend-activation-link'
        }
        else if(this.state.currentTabActive=== ROLES.ADMIN) {
            obj.api='/admin-resend-activation-link'
        }
        else if(this.state.currentTabActive=== ROLES.CLINICIAN) {
            obj.api='/clinician-resend-activation-link'
        }
        else if(this.state.currentTabActive=== ROLES.PATIENT) {
            obj.api='/patient-resend-activation-link'
        }
        let res = await CallApiAsync(obj);
        if (res.data.status === 200) {
            globalAlert('success', getResourceValue(this.state.adminResources, 'USER_INVITED'))
        }
        else {
            globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, res.data.status.toString()))

        }
        globalLoader(false)
    }

    onOpenModal = (data) => {
        this.setState({ statusModal: true, selectedUserId: data.user_id })
    };

    onSaveModal = () => {
        this.setState({ statusModal: false })
        this.deactivateUser(this.state.selectedUserId);
    };

    renderCustomRow = (data) => {
        return (
            <a
                className={this.state.isArchive ? "activateLink cursor " : "dactivateLink cursor "}
                onClick={() => this.onOpenModal(data)}
            >
                {
                    this.state.isArchive ? getResourceValue(this.state.adminResources, 'RESTORE') : getResourceValue(this.state.adminResources, 'ADD_TO_ARCHIVE')
                }
            </a>
        )
    }

    render() {
        let menu = '';
        if (this.state.isArchive) {
            menu = "archive";
        } else {
            menu = "manageUsers";
        }
        return (
            <>
                <div className="mb-10">
                    <CustomTableComponent
                        buttons={
                            this.state.isArchive ? [] :
                                [
                                    {
                                        text: `+ ${getResourceValue(this.state.adminResources, 'ADD')}`,
                                        onClick: () => this.setState({ openAddUserModal: true }),
                                        type: BUTTON_TYPES.PRIMARY
                                    }
                                ]}

                        showCheckbox={true}
                        showSearchBar={true}
                        showTitle={true}
                        showFilter={true}
                        customColumn={getResourceValue(this.state.adminResources, 'ACTION')}
                        customRow={this.renderCustomRow}
                        resources={this.state.adminResources}
                        sortingTable={this.sortingTable}
                        totalUserId={this.state.totalDocument}
                        dataArray={this.state.userDataArray}
                        openEditUserModalFunc={!this.state.isArchive && this.openEditUserModalFunc}
                        sortObj={{
                            sortVal: this.state.sortColName,
                            sortType: this.state.sortType,
                        }}
                        tabArray={this.state.tabArray}
                        currentTabActive={this.state.currentTabActive}
                        setcurrentTabActive={this.setcurrentTabActive}
                        columnArray={this.state.columns}
                        tableTitle={getResourceValue(this.state.adminResources, 'ArchiveUsers')}
                        primaryKey={'user_id'}
                        pageSize={this.state.pageSize}
                        goToPage={this.goToPage}
                        totalCount={this.state.totalDocument}
                        currentPage={this.state.currentPage}
                        inputLabel={getResourceValue(this.state.adminResources, 'SHOW_PER_PAGE')}
                        pageCount={getResourceValue(this.state.adminResources, 'PAGE_COUNT')}
                        changePageSize={this.changePageSize}
                        searchVal={this.state.searchVal}
                        changeValue={this.changeValue}
                        searchFilter={this.searchFilter}
                        viewBasicApi={this.viewBasicApi}
                        editColumn={getResourceValue(this.state.adminResources, 'EDIT')}
                        yes={getResourceValue(this.state.adminResources, 'YES')}
                        no={getResourceValue(this.state.adminResources, 'NO')}
                    />
                </div>

                {this.state.openEditUserModal ?
                    <Modal classNames={{ modal: "modal-lg-full modal-own" }} open={this.state.openEditUserModal}
                        onClose={() => this.onCloseChangeModal()} center closeOnOverlayClick={false} closeIcon={''} showCloseIcon={false}>

                        <ManageProfileComponent currentUserId={this.state.currentUserId} currentUserOrg={this.state.currentUserOrg} roleType={this.props.role} organizationsArray={this.state.organizations} roleAction={this.state.currentTabActive}
                            patientTags={this.state.patientTags}
                            patientEditTags={this.state.patientEditTags}
                            resendUserEmail={this.resendUserEmail}
                            closeModal={this.onCloseChangeModal} currentAction={ACTIONS.MANAGE_USER} infoDes={getResourceValue(this.state.adminResources, 'INFO_DESCRIPTION')} />
                    </Modal> : null}

                {this.state.openAddUserModal ?
                    <AddAdminModal closeCallBackOption={this.viewUserApi} open={true} organizations={this.state.organizations} onCloseChangeModal={() => this.setState({ openAddUserModal: false })} roleType={this.state.currentTabActive}
                        resources={this.state.adminResources}
                        patientTags={this.state.patientTags}
                        add={getResourceValue(this.state.adminResources, 'ADD')}
                        clinicianLabel={getResourceValue(this.state.adminResources, 'ADD_CLINICIAN')}
                        patientLabel={getResourceValue(this.state.adminResources, 'ADD_PATIENT')}
                        requiredField={getResourceValue(this.state.adminResources, 'FIELD_REQUIRED')}
                    /> : null}

                <Modal showCloseIcon={false} classNames={{ modal: "modal-md modal-own" }} open={this.state.statusModal} onClose={() => this.setState({ statusModal: false })} center closeOnOverlayClick={true}>
                    <div className="video-player-wrapper">
                        <h3 className="font-20 primary-color py-3">
                            {this.state.isArchive ? getResourceValue(this.state.adminResources, 'RESTORE_CONFIRMATION') : getResourceValue(this.state.adminResources, 'ARCHIVE_CONFIRMATION')}
                        </h3>
                        <div className=" btn-wrapper">
                            <button type="button" onClick={() => this.setState({ statusModal: false })} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 text-uppercase mw-100"> {getResourceValue(this.state.adminResources, 'NO')}</button>
                            <button type="submit" onClick={() => { this.onSaveModal() }} className="btn full-width-xs btn-own btn-own-primary min-height-btn min-width-btn-md text-uppercase mw-100">{getResourceValue(this.state.adminResources, 'YES')}</button>
                        </div>
                    </div>
                </Modal>
            </>
        )
    }
}
const mapStateToProps = state => ({
    userData: state.user.userData,
    languageId: state.common.languageId
})
export default connect(mapStateToProps)(withRouter(ManageUsers));