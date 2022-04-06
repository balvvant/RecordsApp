import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS, GLOBAL_API, resourceGroups , RESOURCE_KEYS } from "../Constants/types";
import AddEditUser from '../Modals/AddEditUserModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            users: [],
            resources: [],
            totalRecords: 0,
            columns: [],
            userId: null,
            searchCategories: [],
            searchCategory: '',
            openAddEditUserModal: false,
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
                api: '/get-users',
                body: {
                    groupIds: this.state.resources.length == 0 ? `${resourceGroups.COMMON_GROUP},${resourceGroups.USER_PROFILE_GROUP}` : ``,
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
                            databaseColumn: 'UserName',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.USERNAME),
                            isSort: true,
                        },
                        {
                            databaseColumn: 'role_name',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.USERTYPE),
                            isSort: true,
                            width: "10%",
                        },
                        {
                            databaseColumn: 'EmailID',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.EMAIL),
                            isSort: false,
                            width: "10%",
                        },
                        {
                            databaseColumn: 'BTCAddress',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.BTCADDRESS),
                            isSort: false,
                            width: "10%",
                        },
                        {
                            databaseColumn: 'JabberID',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.JABBERID),
                            isSort: false,
                            width: "10%",
                        },
                        {
                            databaseColumn: 'TelegramID',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.TELEGRAMID),
                            isSort: false,
                            width: "10%",
                        },
                        {
                            databaseColumn: 'ActivationStatus',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.USER_ACTIVATION_STATUS),
                            isSort: true,
                            width: "10%",
                        },
                        {
                            databaseColumn: 'Earnings',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.USER_EARNINGS),
                            isSort: false,
                            width: "10%",
                        },
                        {
                            databaseColumn: 'Expenses',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.USER_PROFILE.USER_EXPENSES),
                            isSort: false,
                            width: "10%",
                        },
                    ];
                    localStorage.setItem("resources", JSON.stringify(resources));
                    this.setState({ columns: columns, resources: resources, searchCategories: searchCategories });
                }
                if (recordsResult.data.data?.Users && recordsResult.data.data?.Users.length > 0) {
                    this.setState({ users: recordsResult.data.data.Users, totalRecords: recordsResult.data.data.totalCount });
                } else {
                    this.setState({ users: [], totalRecords: 0 });
                }
                globalLoader(false)
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, recordsResult.data.status.toString()));
                this.setState({ users: [], totalRecords: 0 }, () => { globalLoader(false) });
            }
        } catch (error) {
            let errorObject = {
                methodName: "Users/ViewRecordsAsync",
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
        this.setState({ openAddEditUserModal: false });
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
                methodName: "users/goToPage",
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
                                        onClick: () => this.setState({ userId: null, openAddEditUserModal: true }),
                                        type: BUTTON_TYPES.PRIMARY
                                    }
                                ]}
                            showSearchBar={true}
                            showFilter={true}
                            showSpecficSearch={true}
                            dataArray={this.state.users}
                            resources={this.state.resources}
                            columnArray={this.state.columns}
                            tableTitle={getResourceValue(this.state.resources, RESOURCE_KEYS.USER_PROFILE.HEADER_USER_LIST)}
                            primaryKey={'UserID'}
                            totalCount={this.state.totalCount}
                            searchVal={this.state.searchVal}
                            changeValue={(ev) => this.setState({ searchVal: ev.target.value })}
                            searchFilter={this.SearchFilter}
                            viewBasicApi={this.ViewRecordsAsync}
                            openEditUserModalFunc={(id) => this.setState({ userId: id }, () => { this.setState({ openAddEditUserModal: true }) })}
                            customColumn={getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ACTION)}
                            tabArray={this.state.searchCategories}
                            currentTabActive={this.state.searchCategory}
                            setcurrentTabActive={(ev) => this.setState({ searchCategory: ev.target.value }, () => this.ViewRecordsAsync())}
                            goToPage={this.GoToPage}
                            changePageSize={(ev) => this.setState({ pageSize: ev.target.value, currentPage: 1 }, () => this.ViewRecordsAsync())}
                        />
                    </div>
                    {this.state.openAddEditUserModal ?
                        <AddEditUser
                            userId={this.state.userId}
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

export default connect(mapStateToProps)(withRouter(Users));