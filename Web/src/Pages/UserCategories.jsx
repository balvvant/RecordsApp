import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS,resourceGroups } from '../Constants/types';
import CategoryModal from '../Modals/addCategoryModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue, logOut } from '../Functions/CommonFunctions';


class UserCategories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upcomingData: [],
            pastData: [],
            doctorApprovalList: [],
            openAddEditModal: false,
            openAddUserModal: false,
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            userDataArray: [],
            totalUserId: [],
            allChecked: false,
            currentUserId: null,
            checkedUserInfo: false,
            totalDocument: null,
            editMode: false,
            currentTabActive: "hcp",
            tabArray: [],
            hcpThead: [{ type: 'checkbox', name: 'hcpcheckbox' }, { type: 'text', name: 'Name', sorting: true }, { type: 'text', name: 'Edit', imgFixWidth: true }, { type: 'blank' }],
            categoryResources: [],
            languageId: props.languageId,
            columnArray: [],
            columnArrayOrg: [],
            primaryKey: '',
            isArchive: props.isArchive ? props.isArchive : false,
            statusModal: false,
            selectedCatId: null,
        }
    }

    componentDidMount = () => {
        try {
            globalLoader(true)
            this.getUserCategoryResources();
            if (window.location.search) {
                let searchString = window.location.search.split('=')[1];
                if (searchString && this.state.tabArray.find(x => x.val === searchString)) {

                    this.setState({
                        currentTabActive: searchString
                    }, () => {
                        this.viewBasicApi()
                    })
                }
                else {
                    this.viewBasicApi()
                }
            }
            else {
                this.viewBasicApi()
            }
        } catch (error) {
            let errorObject = {
                methodName: "categoryUser/componentDidMount",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }
    componentDidUpdate = () => {
        const { languageId, isArchive } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getUserCategoryResources() });
        }

        if (isArchive !== this.state.isArchive) {
            this.setState({ isArchive: isArchive }, () => { this.viewBasicApi() });
        }
    }
    getUserCategoryResources = async () => {
        try {
            globalLoader(true);
            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.USER_CATEGORY, resourceGroups.COMMON, resourceGroups.FEATURE_MENU]

                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ categoryResources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.categoryResources, resourcesResult.data.status.toString()));
            }
            let columnArray = [
                {
                    databaseColumn: 'name',
                    columnName: getResourceValue(this.state.categoryResources, 'NAME'),
                    isSort: true
                },
            ];

            this.setState({ columnArray: columnArray });
            let tempTabArray = [];
            tempTabArray.push({ name: getResourceValue(this.state.categoryResources, 'JOB_TITLE'), val: "hcp" });
            tempTabArray.push({ name: getResourceValue(this.state.categoryResources, 'SPECIALITY'), val: "aop" })
            this.setState({ tabArray: tempTabArray });

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "categoryUser/getUserCategoryResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    viewBasicApi = async () => {
        try {
            const { currentTabActive } = this.state;

            globalLoader(true)

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: currentTabActive === "hcp" ? '/view-job-titles' : '/view-specialties',
                body: {
                    view_records: this.state.pageSize,
                    view_page: this.state.currentPage,
                    search_string: this.state.searchVal && this.state.searchVal,
                    sort_col_name: this.state.sortColName && this.state.sortColName,
                    sort_col_type: this.state.sortType ? "ASC" : "DESC",
                }
            }

            if (this.props.isArchive) {
                obj.body.deleted = '1';
            }

            let userResult = await CallApiAsync(obj);

            if (userResult.data.status === 200) {
                let resData;
                let totalCount = userResult.data.data.totalCount;
                let primaryKey = '';

                if (currentTabActive == "hcp") {
                    resData = userResult.data.data.jobTitles;
                    primaryKey = "job_title_id"
                }
                else if (currentTabActive === "aop") {
                    resData = userResult.data.data.specialities;
                    primaryKey = "specialty_id"
                }

                // globalAlert("success", userResult.data.status.toString());

                this.setState({
                    // userDataArray: currentTabActive === "hcp" ? resData.hcpList :currentTabActive === "aop"?resData.aopList: resData.organizations,
                    userDataArray: resData,
                    totalDocument: totalCount,
                    allChecked: false,
                    checkedUserInfo: false,
                    primaryKey: primaryKey
                }, () => {
                    globalLoader(false)

                })
                globalLoader(false)
            }
            else {
                 globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.categoryResources, userResult.data.status.toString()))
                this.setState({
                    userDataArray: [],
                    totalDocument: null,
                }, () => {
                    globalLoader(false)
                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "categoryUser/viewBasicApi",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    openAddEditModalFunc = () => {
        this.setState({
            openAddEditModal: true,
        })
    }

    onCloseAddEditModal = (val) => {
        this.setState({
            openAddEditModal: false,
            editMode: false,
        })
        if (val) this.resetApiVal()

    }

    setcurrentTabActive = (event) => {
        this.props.history.push(`?category=${event.target.value}`)
        this.setState({
            currentTabActive: event.target.value
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
            this.viewBasicApi()
        })
    }
    sortingTable = (val) => {
        try {
            if (val === this.state.sortColName) {
                this.setState((prevState => ({
                    sortType: !prevState.sortType,
                    currentPage: 1,
                }

                )), () => {
                    this.viewBasicApi()
                })
            }
            else {
                this.setState({
                    sortColName: val,
                    sortType: true,
                    currentPage: 1,
                }, () => {
                    this.viewBasicApi()
                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "categoryUser/sortingTable",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    openEditUserModalFunc = async (data) => {
        try {

            let item;
            if (this.state.currentTabActive === "hcp") {
                item = this.state.userDataArray.find(x => x.job_title_id === data);

                this.setState({
                    currentUserId: data.job_title_id,
                    editMode: true,
                    currentData: item
                }, () => {
                    this.setState({
                        openAddEditModal: true,
                    })

                })

            }
            else if (this.state.currentTabActive === "aop") {
                item = this.state.userDataArray.find(x => x.specialty_id === data);

                this.setState({
                    currentUserId: data.specialty_id,
                    editMode: true,
                    currentData: item
                }, () => {
                    this.setState({
                        openAddEditModal: true,
                    })

                })

            }


        } catch (error) {
            let errorObject = {
                methodName: "categoryUser/openEditUserModalFunc",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }

    }

    changePageSize = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value,
            currentPage: 1,
        }, () => {
            this.viewBasicApi()
        })
    }
    goToPage = (ev, val) => {
        try {
            if (ev) {
                this.setState({
                    currentPage: ev.target.value
                }, () => {
                    this.viewBasicApi()
                })
            }
            else {
                if (val === 'next') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage + 1
                    }

                    )), () => {
                        this.viewBasicApi()
                    })
                }
                else if (val === 'prev') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage - 1
                    }

                    )), () => {
                        this.viewBasicApi()
                    })
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "categoryUser/goToPage",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    deactiveDetail = async (id) => {
        try {
            globalLoader(true)

            let userResult;
            let localTotalUserId;

            if (this.state.currentTabActive === "hcp") {
                localTotalUserId = this.state.userDataArray.find(y => y.job_title_id == id);

                let obj = {
                    method:API_METHODS.POST,
                    history:this.props.history,
                    api:'/archive-restore-job-title',
                    body:{
                    ids: localTotalUserId.job_title_id.toString(),
                    status: this.props.isArchive ? "1" : "0",
                }}
                userResult = await CallApiAsync(obj);
            }
            else if (this.state.currentTabActive === "aop") {
                localTotalUserId = this.state.userDataArray.find(y => y.specialty_id == id);

                let obj = {
                    method:API_METHODS.POST,
                    history:this.props.history,
                    api:'/archive-restore-specialty',
                    body:{ids: localTotalUserId.specialty_id.toString(),
                        status: this.props.isArchive ? "1" : "0",}
                    
                }
                userResult = await CallApiAsync(obj);
            }

            if (userResult.data.status === 200) {
                if (localTotalUserId.length == this.state.userDataArray.length) {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage - 1
                    })
                    ));
                }

                // globalAlert("success", getResourceValue(this.state.categoryResources, userResult.data.status.toString()))

                this.setState({
                    checkedUserInfo: false,
                }, () => {
                    this.viewBasicApi()
                })
            }

            else {
                globalAlert("error", getResourceValue(this.state.categoryResources, userResult.data.status.toString()))
                globalLoader(false)

            }
        } catch (error) {
            let errorObject = {
                methodName: "categoryUser/deactiveDetail",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }
    searchFilter = (ev) => {
        ev.preventDefault();

        this.viewBasicApi()

    }
    changeValue = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value
        })
    }

    logOut = () => {
        logOut(this.props.history, '/');
    }

    onOpenModal = (data) => {
        if (this.state.currentTabActive === "hcp") {
            this.setState({ statusModal: true, selectedCatId: data.job_title_id })
        } else {
            this.setState({ statusModal: true, selectedCatId: data.specialty_id })
        }

    };

    onSaveModal = () => {
        this.setState({ statusModal: false })
        this.deactiveDetail(this.state.selectedCatId);
    };

    renderCustomRow = (data) => {
        return (
            <a
                className={this.props.isArchive ? "activateLink cursor " : "dactivateLink cursor "}
                onClick={() => this.onOpenModal(data)}
            >
                {
                    this.props.isArchive ? getResourceValue(this.state.categoryResources, 'RESTORE') : getResourceValue(this.state.categoryResources, 'ADD_TO_ARCHIVE')
                }
            </a>
        )
    }

    render() {


        return (
            <>
                <div>
                    <div className="content-container  mb-10">


                        <CustomTableComponent
                            buttons={
                                this.props.isArchive ? [] :
                                    [
                                        {
                                            text: `+ ${getResourceValue(this.state.categoryResources, 'ADD_NEW')}`,
                                            onClick: () => this.openAddEditModalFunc(),
                                            type: BUTTON_TYPES.PRIMARY
                                        },

                                    ]}
                            showCheckbox={true}
                            showSearchBar={true}
                            showTitle={true}
                            showFilter={true}
                            showAllCheck={true}
                            resources={this.state.categoryResources}
                            customColumn={getResourceValue(this.state.categoryResources, 'ACTION')}
                            customRow={this.renderCustomRow}
                            sortingTable={this.sortingTable}
                            roleType={this.state.columnArray}
                            totalUserId={this.state.totalUserId}
                            dataArray={this.state.userDataArray}
                            openEditUserModalFunc={!this.props.isArchive && this.openEditUserModalFunc}
                            sortObj={{
                                sortVal: this.state.sortColName,
                                sortType: this.state.sortType,
                            }}
                            tabArray={this.state.tabArray}
                            currentTabActive={this.state.currentTabActive}
                            setcurrentTabActive={this.setcurrentTabActive}
                            columnArray={this.state.columnArray}
                            tableTitle={getResourceValue(this.state.categoryResources, 'UserCategories')}
                            primaryKey={this.state.primaryKey}
                            pageSize={this.state.pageSize}
                            goToPage={this.goToPage}
                            totalCount={this.state.totalDocument}
                            currentPage={this.state.currentPage}
                            inputLabel={getResourceValue(this.state.categoryResources, 'SHOW_PER_PAGE')}
                            pageCount={getResourceValue(this.state.categoryResources, 'PAGE_COUNT')}
                            changePageSize={this.changePageSize}
                            searchVal={this.state.searchVal}
                            changeValue={this.changeValue}
                            searchFilter={this.searchFilter}
                            viewBasicApi={this.viewBasicApi}
                            editColumn={getResourceValue(this.state.categoryResources, 'EDIT')}
                            yes={getResourceValue(this.state.categoryResources, 'YES')}
                            no={getResourceValue(this.state.categoryResources, 'NO')}
                        />
                    </div>
                </div>
                {this.state.openAddEditModal ?
                    <CategoryModal open={this.state.openAddEditModal} currentData={this.state.currentData} onCloseModal={this.onCloseAddEditModal} editMode={this.state.editMode}
                        currentType={this.state.currentTabActive} tabArray={this.state.tabArray}
                        resources={this.state.categoryResources}
                        currentTabTitle={this.state.currentTabActive === "hcp" ? getResourceValue(this.state.categoryResources, 'JOB_TITLE') : getResourceValue(this.state.categoryResources, 'SPECIALITY')}
                    />
                    : null}

                <Modal showCloseIcon={false} classNames={{ modal: "modal-md modal-own" }} open={this.state.statusModal} onClose={() => this.setState({ statusModal: false })} center closeOnOverlayClick={true}>
                    <div className="video-player-wrapper">
                        <h3 className="font-20 primary-color py-3">
                            {this.props.isArchive ? getResourceValue(this.state.categoryResources, 'RESTORE_CONFIRMATION') : getResourceValue(this.state.categoryResources, 'ARCHIVE_CONFIRMATION')}
                        </h3>
                        {/* <div className="border-bottom-own pt-2 mb-3"></div> */}
                        <div className=" btn-wrapper">

                            <button type="button" onClick={() => this.setState({ statusModal: false })} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 text-uppercase mw-100"> {getResourceValue(this.state.categoryResources, 'NO')}</button>
                            <button type="submit" onClick={() => { this.onSaveModal() }} className="btn full-width-xs btn-own btn-own-primary min-height-btn min-width-btn-md text-uppercase mw-100">{getResourceValue(this.state.categoryResources, 'YES')}</button>
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

export default connect(mapStateToProps)(withRouter(UserCategories));