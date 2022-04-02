import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES,CONSTANTS, GLOBAL_API, ResourceExportType, resourceGroups } from "../Constants/types";
import AddLanguageResourceModal from '../Modals/addLanguageResourceModal';
import BulkUploadResource from '../Modals/bulkUploadModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue, logOut } from '../Functions/CommonFunctions';

class LanguageResources extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openAddUserModal: false,
            openBulkUploadModal: false,
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            resources: [],
            groups: [],
            totalUserId: [],
            allChecked: false,
            checkedUserInfo: false,
            totalDocument: null,
            currentActiveData: null,
            editMode: false,
            adminResources: [],
            columns: [],
            languageId: props.languageId,
        }
    }

    componentDidMount = () => {
        globalLoader(true)
        this.viewLanguageResources()
        this.getKeyResources();
    }

    componentDidUpdate = () => {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getKeyResources() });
        }
    }

    getKeyResources = async () => {
        try {
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.COMMON, resourceGroups.FEATURE_MENU, resourceGroups.MANAGE_ORGANIZATION, resourceGroups.UPLOAD_MEDIA, resourceGroups.LANGUAGE_RESOURCES, resourceGroups.ADMIN_DASHBOARD],
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;

                let columns = [
                    {
                        databaseColumn: 'group_name',
                        columnName: getResourceValue(resources, 'GROUP'),
                        isSort: true
                    },
                    {
                        databaseColumn: 'resource_key',
                        columnName: getResourceValue(resources, 'RESOURCE_KEY'),
                        isSort: true
                    }
                ];

                this.setState({ adminResources: resources, columns: columns });

            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }
        }
        catch (error) {
            let errorObject = {
                methodName: "LanguageResources/getKeyResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    viewLanguageResources = async () => {
        try {
            globalLoader(true)

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-resources',
                body: {
                    view_records: this.state.pageSize,
                    view_page: this.state.currentPage,
                    search_string: this.state.searchVal && this.state.searchVal,
                    sort_col_name: this.state.sortColName && this.state.sortColName,
                    sort_col_type: this.state.sortType ? "ASC" : "DESC",
                }
            }
            let Result = await CallApiAsync(obj);

            if (Result.data.status === 200) {
                let count = Result.data.data.totalCount;

                if (count <= 0) {
                    // globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, 'NO_RECORDS'));
                }

                this.setState({
                    resources: Result.data.data.resources,
                    groups: Result.data.data.groups,
                    totalDocument: count,
                    allChecked: false,
                    checkedUserInfo: false,
                }, () => {
                    globalLoader(false)

                })


            }
            else {
                 globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, Result.data.status.toString()))
                this.setState({
                    resources: [],
                    totalDocument: null,

                }, () => {
                    globalLoader(false)

                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "LanguageResources/viewLanguageResources",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    getExportData = async (exportType) => {
        try {
            globalLoader(true);

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/export-resource-data',
                body: { export_type: exportType }
            }
            let Result = await CallApiAsync(obj);

            if (Result.data.status === 200) {
                let filePath = Result.data.data.export_file;

                if (filePath) {
                    const url = `${GLOBAL_API}/${filePath}`;
                    // let newTab = window.open();
                    // newTab.location.href = url;
                    // newTab.close();
                    window.open(url);
                } else {
                    // globalAlert("error", getResourceValue(this.state.adminResources, 'NO_RECORDS'));
                }
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, Result.data.status.toString()));
                globalLoader(false);
            }
            globalLoader(false);
        } catch (error) {
            let errorObject = {
                methodName: "LanguageResources/getExportData",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    closeAddUserModal = (val) => {
        if (val) {
            this.setState({
                openAddUserModal: false,
                currentActiveData: null,
                editMode: false,
            }, () => {
                this.viewLanguageResources()
            })
        }
        else {
            this.setState({
                openAddUserModal: false,
                currentActiveData: null,
                editMode: false,
            })
        }
    }

    openBulkUploadModal = () => {
        this.setState({ openBulkUploadModal: true });
    }

    closeBulkUploadModal = () => {
        this.setState({
            openBulkUploadModal: false,
        })
    }

    openEditUserModalFunc = (id) => {
        try {
            let localCurrentActiveData = this.state.resources.find(x => x.resource_key_id === id);
            this.setState({
                currentActiveData: localCurrentActiveData,
                editMode: true,

            }, () => {
                this.setState({
                    openAddUserModal: true,
                })

            })
        } catch (error) {
            let errorObject = {
                methodName: "LanguageResources/openEditUserModalFunc",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    searchFilter = (ev) => {
        ev.preventDefault();

        this.viewLanguageResources()

    }

    checkedUsers = (ev, id, type) => {
        try {


            let localTotalUserId = [...this.state.resources];

            if (type === "All") {
                localTotalUserId.forEach(element => {
                    element.checked = ev.target.checked
                });
                this.setState({
                    resources: localTotalUserId,
                    allChecked: ev.target.checked,
                    checkedUserInfo: ev.target.checked,
                })
            }

            else {
                let index = localTotalUserId.findIndex(x => x.organization_id === id);
                localTotalUserId[index].checked = ev.target.checked;
                let check = localTotalUserId.some(x => x.checked)
                this.setState({
                    resources: localTotalUserId,
                    checkedUserInfo: check
                })

            }
        } catch (error) {
            let errorObject = {
                methodName: "LanguageResources/checkedUsers",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    sortingTable = (val) => {
        if (val === this.state.sortColName) {
            this.setState((prevState => ({
                sortType: !prevState.sortType,
                currentPage: 1,
            }

            )), () => {
                this.viewLanguageResources()
            })
        }
        else {
            this.setState({
                sortColName: val,
                sortType: true,
                currentPage: 1,
            }, () => {
                this.viewLanguageResources()
            })
        }
    }

    addNewUser = () => {

    }

    changePageSize = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value,
            currentPage: 1,
        }, () => {
            this.viewLanguageResources()
        })
    }

    changeValue = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value
        })
    }


    logOut = () => {
        logOut(this.props.history, '/');
    }
    setcurrentTabActive = (tab) => {
        this.props.history.push(`?manage=${tab}`)
        this.setState({
            currentTabActive: tab
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
            this.viewLanguageResources()
        })
    }

    goToPage = (ev, val) => {
        try {
            if (ev) {
                this.setState({
                    currentPage: ev.target.value
                }, () => {
                    this.viewLanguageResources()
                })
            }
            else {
                if (val === 'next') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage + 1
                    }

                    )), () => {
                        this.viewLanguageResources()
                    })
                }
                else if (val === 'prev') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage - 1
                    }

                    )), () => {
                        this.viewLanguageResources()
                    })
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "LanguageResources/goToPage",
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
                                    text: getResourceValue(this.state.adminResources, 'EXPORT_DATA'),
                                    onClick: () => this.getExportData(ResourceExportType.WITH_DATA),
                                    type: BUTTON_TYPES.PRIMARY
                                },
                                {
                                    text: getResourceValue(this.state.adminResources, 'EXPORT_FORMAT'),
                                    onClick: () => this.getExportData(ResourceExportType.ONLY_FORMAT),
                                    type: BUTTON_TYPES.PRIMARY
                                },
                                {
                                    text: getResourceValue(this.state.adminResources, 'BULK_UPLOAD'),
                                    onClick: () => this.openBulkUploadModal(),
                                    type: BUTTON_TYPES.PRIMARY
                                }
                            ]}

                            showSearchBar={true}
                            showTitle={true}
                            showFilter={true}

                            resources={this.state.adminResources}
                            sortingTable={this.sortingTable}
                            allChecked={this.state.allChecked}
                            totalUserId={this.state.totalUserId}
                            dataArray={this.state.resources}
                            openEditUserModalFunc={this.openEditUserModalFunc}
                            sortObj={{
                                sortVal: this.state.sortColName,
                                sortType: this.state.sortType,
                            }}

                            tabArray={this.state.tabArray}
                            currentTabActive={this.state.currentTabActive}
                            setcurrentTabActive={this.setcurrentTabActive}
                            columnArray={this.state.columns}
                            tableTitle={getResourceValue(this.state.adminResources, 'RESOURCES')}
                            primaryKey={'resource_key_id'}
                            pageSize={this.state.pageSize}
                            goToPage={this.goToPage}
                            totalCount={this.state.totalDocument}
                            currentPage={this.state.currentPage}
                            changePageSize={this.changePageSize}
                            searchVal={this.state.searchVal}
                            changeValue={this.changeValue}
                            searchFilter={this.searchFilter}
                            viewBasicApi={this.viewLanguageResources}
                            checkedUsers={this.checkedUsers}
                            yes={getResourceValue(this.state.adminResources, 'YES')}
                            no={getResourceValue(this.state.adminResources, 'NO')}
                        />
                    </div>

                    {this.state.openAddUserModal ?
                        <AddLanguageResourceModal
                            editMode={this.state.editMode}
                            currentData={this.state.currentActiveData}
                            groups={this.state.groups}
                            closeCallBackOption={this.viewLanguageResources}
                            open={true}
                            onCloseModal={this.closeAddUserModal}
                            resources={this.state.adminResources}
                        /> : null}

                    {
                        this.state.openBulkUploadModal ?
                            <BulkUploadResource
                                open={true}
                                onCloseModal={this.closeBulkUploadModal}
                                resources={this.state.adminResources}
                            />
                            : null
                    }
                </div>
            </>

        )
    }


}

const mapStateToProps = state => ({
    userData: state.user.userData,
    languageId: state.common.languageId
})

export default connect(mapStateToProps)(withRouter(LanguageResources));