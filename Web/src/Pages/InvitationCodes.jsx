import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from "react-responsive-modal";
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS, GLOBAL_API, resourceGroups , RESOURCE_KEYS, SINGLE_VALUES } from "../Constants/types";
import AddEditInvitationCode from '../Modals/AddEditInvitationCodeModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class InvitationCodes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            records: [],
            resources: [],
            totalRecords: 0,
            columns: [],
            inviteCodeId: null,
            searchCategories: [],
            searchCategory: '',
            openAddEditInvitationCodeModal: false,
            pageSize: SINGLE_VALUES.PAGE_SIZE,
            currentPage: 1,
        }
    }

    componentDidMount = () => {
        this.ViewRecordsAsync();
    }

    ViewRecordsAsync = async () => {
        try {
            globalLoader(true)
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-invitation-codes',
                body: {
                    groupIds: this.state.resources.length == 0 ? `${resourceGroups.COMMON_GROUP},${resourceGroups.INVITATION_CODES_GROUP}` : ``,
                    searchString: this.state.searchVal ? this.state.searchVal : "",
                    deleted: 0,
                    search_column: this.state.searchCategory,
                    view_records: this.state.pageSize,
                    view_page: this.state.currentPage,
                }
            }
            let recordsResult = await CallApiAsync(obj);
            if (recordsResult.data.status === 200) {
                if (recordsResult.data.data?.PageResources && recordsResult.data.data?.PageResources.length > 0 && this.state.resources.length == 0) {
                    let resources = recordsResult.data.data.PageResources;
                    let columns = [
                        {
                            databaseColumn: 'ActivationCodeType',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.INVITATIONCODES.INVITATION_CODE_FOR),
                            isSort: true,
                        },
                        {
                            databaseColumn: 'ActivationCode',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.INVITATIONCODES.INVITATION_CODE),
                            isSort: true,
                            width: "40%",
                        },
                        {
                            databaseColumn: 'Status',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.INVITATIONCODES.INVITATION_CODE_STATUS),
                            isSort: true,
                            width: "10%",
                        },
                    ];
                    localStorage.setItem("resources", JSON.stringify(resources));
                    this.setState({ columns: columns, resources: resources, searchCategories: searchCategories });
                }
                if (recordsResult.data.data?.ActivationCodes && recordsResult.data.data?.ActivationCodes.length > 0) {
                    this.setState({ records: recordsResult.data.data.ActivationCodes, totalRecords: recordsResult.data.data.totalCount });
                } else {
                    this.setState({ records: [], totalRecords: 0 });
                }
                globalLoader(false)
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, recordsResult.data.status.toString()));
                this.setState({ records: [], totalRecords: 0 }, () => { globalLoader(false) });
            }
        } catch (error) {
            let errorObject = {
                methodName: "InvitationCodes/ViewRecordsAsync",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    SearchFilter = (ev) => {
        ev.preventDefault();
        this.ViewRecordsAsync();
    }

    CloseAddUserModal = (val = null) => {
        if (val) {
            this.ViewRecordsAsync();
        }
        this.setState({ openAddEditInvitationCodeModal: false });
    }

    GoToPage = (ev, val) => {
        try {
            if (ev) {
                this.setState({ currentPage: ev.target.value }, () => { this.ViewRecordsAsync() });
            }
            else {
                if (val === CONSTANTS.NEXT) {
                    this.setState((prevState => ({ currentPage: prevState.currentPage + 1 })), () => this.ViewRecordsAsync());
                }
                else if (val === CONSTANTS.PREV) {
                    this.setState((prevState => ({ currentPage: prevState.currentPage - 1 })), () => this.ViewRecordsAsync());
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "InvitationCodes/goToPage",
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
                    <div className="mb-10">
                        <CustomTableComponent
                            buttons={[
                                    {
                                        text: `+ ${getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ADD)}`,
                                        onClick: () => this.setState({ inviteCodeId: null, openAddEditInvitationCodeModal: true }),
                                        type: BUTTON_TYPES.PRIMARY
                                    }
                                ]}
                            showSearchBar={true}
                            showFilter={true}
                            showSpecficSearch={true}
                            dataArray={this.state.records}
                            resources={this.state.resources}
                            columnArray={this.state.columns}
                            tableTitle={getResourceValue(this.state.resources, RESOURCE_KEYS.INVITATIONCODES.HEADER_MY_TICKETS)}
                            primaryKey={'InvitationCodeID'}
                            totalCount={this.state.totalRecords}
                            searchVal={this.state.searchVal}
                            changeValue={(ev) => this.setState({ searchVal: ev.target.value })}
                            searchFilter={this.SearchFilter}
                            viewBasicApi={this.ViewRecordsAsync}
                            //openEditUserModalFunc={(id) => this.setState({ inviteCodeId: id }, () => { this.setState({ openAddEditInvitationCodeModal: true }) })}
                            customColumn={getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ACTION)}
                            tabArray={this.state.searchCategories}
                            currentTabActive={this.state.searchCategory}
                            setcurrentTabActive={(ev) => this.setState({ searchCategory: ev.target.value }, () => this.ViewRecordsAsync())}
                            goToPage={this.GoToPage}
                            changePageSize={(ev) => this.setState({ pageSize: ev.target.value, currentPage: 1 }, () => this.ViewRecordsAsync())}
                        />
                    </div>
                    {this.state.openAddEditInvitationCodeModal ?
                        <AddEditInvitationCode
                            inviteCodeId={this.state.inviteCodeId}
                            closeCallBackOption={this.ViewRecordsAsync}
                            onCloseModal={this.CloseAddUserModal}
                            history={this.props.history}
                            resources={this.state.resources}
                        /> : null}
                </div>
            </>
        )
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(InvitationCodes));