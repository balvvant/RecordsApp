import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from "react-responsive-modal";
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS, GLOBAL_API, resourceGroups, STATUS_CODES, RESOURCE_KEYS } from "../Constants/types";
import AddEditTicket from '../Modals/AddEditSupportTicketModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class UserTransacations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            records: [],
            resources: [],
            totalRecords: 0,
            columns: [],
            searchCategories: [],
            searchCategory: '',
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
                api: '/get-user-transactions',
                body: {
                    groupIds: this.state.resources.length == 0 ? `${resourceGroups.COMMON_GROUP},${resourceGroups.USER_RECORDS_GROUP}` : ``,
                    searchString: this.state.searchVal ? this.state.searchVal : "",
                    deleted: 0,
                    search_column: this.state.searchCategory,
                    view_records: this.state.pageSize,
                    view_page: this.state.currentPage,
                }
            }
            let recordsResult = await CallApiAsync(obj);
            if (recordsResult.data.status === STATUS_CODES.OK) {
                if (recordsResult.data.data?.PageResources && recordsResult.data.data?.PageResources.length > 0 && this.state.resources.length == 0) {
                    let resources = recordsResult.data.data.PageResources;
                    let columns = [
                        {
                            databaseColumn: 'PaymentAmount',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.TransacationAmount),
                            isSort: true,
                            width: "25%",
                        },
                        {
                            databaseColumn: 'PaymentType',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.PaymentType),
                            isSort: true,
                            width: "25%",
                        },
                        {
                            databaseColumn: 'CreatedAt',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.PaymentDateTime),
                            isSort: true,
                            width: "25%",
                        },
                        {
                            databaseColumn: 'TranscationType',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.TransacationType),
                            isSort: false,
                            width: "25%",
                        },
                    ];
                    localStorage.setItem("resources", JSON.stringify(resources));
                    this.setState({ columns: columns, resources: resources, searchCategories: searchCategories });
                }
                if (recordsResult.data.data?.UserTickets && recordsResult.data.data?.UserTickets.length > 0) {
                    this.setState({ records: recordsResult.data.data.UserTickets, totalRecords: recordsResult.data.data.totalCount });
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
                methodName: "UserTransacations/ViewRecordsAsync",
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
                methodName: "UserTransacations/goToPage",
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
                            showSearchBar={true}
                            showFilter={true}
                            showSpecficSearch={true}
                            dataArray={this.state.records}
                            resources={this.state.resources}
                            columnArray={this.state.columns}
                            tableTitle={getResourceValue(this.state.resources, RESOURCE_KEYS.RECORD.RECORDS)}
                            totalCount={this.state.totalRecords}
                            searchVal={this.state.searchVal}
                            changeValue={(ev) => this.setState({ searchVal: ev.target.value })}
                            searchFilter={this.SearchFilter}
                            viewBasicApi={this.ViewRecordsAsync}
                            customColumn={getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ACTION)}
                            tabArray={this.state.searchCategories}
                            currentTabActive={this.state.searchCategory}
                            setcurrentTabActive={(ev) => this.setState({ searchCategory: ev.target.value }, () => this.ViewRecordsAsync())}
                            goToPage={this.GoToPage}
                            changePageSize={(ev) => this.setState({ pageSize: ev.target.value, currentPage: 1 }, () => this.ViewRecordsAsync())}
                        />
                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(UserTransacations));