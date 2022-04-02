import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from "react-responsive-modal";
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS, GLOBAL_API, resourceGroups , RESOURCE_KEYS } from "../Constants/types";
import AddEditTicket from '../Modals/AddEditSupportTicketModal';
import BulkUploadRecords from '../Modals/BulkUploadRecordsModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class SupportTickets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            records: [],
            resources: [],
            totalRecords: 0,
            columns: [],
            ticketId: null,
            searchCategories: [],
            searchCategory: '',
            openAddEditTicketModal: false,
            pageSize: 25,
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
                api: '/get-my-support-tickets',
                body: {
                    groupIds: this.state.resources.length == 0 ? `${resourceGroups.COMMON},${resourceGroups.SUPPORT_TICKETS}` : ``,
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
                            databaseColumn: 'MessageHeader',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.BIN),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'CreatedAt',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_TYPE),
                            isSort: true,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'IsResponded',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_EXPIRY),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RespondedON',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.SUB_TYPE),
                            isSort: true,
                            width: "15%",
                        },
                    ];
                    localStorage.setItem("resources", JSON.stringify(resources));
                    this.setState({ columns: columns, resources: resources, searchCategories: searchCategories });
                }
                if (recordsResult.data.data?.UserRecords && recordsResult.data.data?.UserRecords.length > 0) {
                    this.setState({ records: recordsResult.data.data.UserRecords, totalRecords: recordsResult.data.data.totalCount });
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
                methodName: "uploadRecords/ViewRecordsAsync",
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
        this.setState({ openAddEditTicketModal: false });
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
                methodName: "records/goToPage",
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
                                        onClick: () => this.setState({ ticketId: null, openAddEditTicketModal: true }),
                                        type: BUTTON_TYPES.PRIMARY
                                    }
                                ]}
                            showSearchBar={true}
                            showFilter={true}
                            showSpecficSearch={true}
                            dataArray={this.state.records}
                            resources={this.state.resources}
                            columnArray={this.state.columns}
                            tableTitle={getResourceValue(this.state.resources, RESOURCE_KEYS.RECORD.RECORDS)}
                            primaryKey={'TicketID'}
                            totalCount={this.state.totalRecords}
                            searchVal={this.state.searchVal}
                            changeValue={(ev) => this.setState({ searchVal: ev.target.value })}
                            searchFilter={this.SearchFilter}
                            viewBasicApi={this.ViewRecordsAsync}
                            openEditUserModalFunc={(id) => this.setState({ ticketId: id }, () => { this.setState({ openAddEditTicketModal: true }) })}
                            customColumn={getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ACTION)}
                            tabArray={this.state.searchCategories}
                            currentTabActive={this.state.searchCategory}
                            setcurrentTabActive={(ev) => this.setState({ searchCategory: ev.target.value }, () => this.ViewRecordsAsync())}
                            goToPage={this.GoToPage}
                            changePageSize={(ev) => this.setState({ pageSize: ev.target.value, currentPage: 1 }, () => this.ViewRecordsAsync())}
                        />
                    </div>
                    {this.state.openAddEditTicketModal ?
                        <AddEditTicket
                            ticketId={this.state.ticketId}
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

export default connect(mapStateToProps)(withRouter(SupportTickets));