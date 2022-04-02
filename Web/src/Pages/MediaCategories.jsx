import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS,resourceGroups } from "../Constants/types";
import CustomTableComponent from "../Components/CustomTableComponent";
import MediaCategoryModal from '../Modals/mediaCategoryModal';
import { CallApiAsync, getResourceValue, logOut } from '../Functions/CommonFunctions';

class MediaCategories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openAddEditModal: false,
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            userDataArray: [],
            currentUserId: null,
            checkedUserInfo: false,
            totalDocument: null,
            editMode: false,
            currentTabActive: "",
            tabArray: [],
            adminResources: [],
            languageId: props.languageId,

            hcpThead: [{ type: 'checkbox', name: 'hcpcheckbox' }, { type: 'text', name: 'Name', sorting: true }, { type: 'text', name: 'Edit', imgFixWidth: true }, { type: 'blank' }],

            pdfUrl: null,
            columnArray: [],
            isArchive: props.isArchive ? props.isArchive : false,
            statusModal: false,
            selectedUserId: null,
        }
    }

    componentDidMount = async () => {
        this.getAdminResources();
    }

    componentDidUpdate = () => {
        const { languageId, isArchive } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources(); });
        }

        if (isArchive !== this.state.isArchive) {
            this.setState({ isArchive: isArchive }, () => { this.viewBasicApi() });
        }
    }

    getAdminResources = async () => {
        try {
            globalLoader(true);
            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.MEDIA_CATEGORY, resourceGroups.COMMON, resourceGroups.USER_CATEGORY, resourceGroups.MANAGE_MEDIA, resourceGroups.FEATURE_MENU],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources }, () => this.viewParentCategoryFunc());

            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }
            let columnArray = [
                {
                    databaseColumn: 'category_name',
                    columnName: getResourceValue(this.state.adminResources, 'NAME'),
                    isSort: true
                },
            ];
            this.setState({ columnArray: columnArray });

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "categoryMedia/getAdminResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    viewParentCategoryFunc = async () => {
        try {
            let obj = {
                method: API_METHODS.GET,
                history: this.props.history,
                api: '/get-parent-categories',
                body: {}
            }
            let viewParentCategoryList = await CallApiAsync(obj);

            if (viewParentCategoryList.data.status === 200) {
                if (viewParentCategoryList?.data?.data?.parentCategories) {
                    let tabDetails = [];
                    let parentCategories = viewParentCategoryList.data.data.parentCategories.sort((a, b) => a.parent_category_id - b.parent_category_id);
                    parentCategories.forEach(element => {
                        let label;

                        if (element.parent_category_id == 1) {
                            label = getResourceValue(this.state.adminResources, 'CONDITION');
                        } else if (element.parent_category_id == 2) {
                            label = getResourceValue(this.state.adminResources, 'TREATMENT');
                        } else if (element.parent_category_id == 3) {
                            label = getResourceValue(this.state.adminResources, 'PARTNERS');
                        }

                        tabDetails.push({
                            parent_category_id: element.parent_category_id,
                            name: label,
                            val: element.parent_category_name
                        });
                    });
                    this.setState({ currentTabActive: tabDetails[0].val, tabArray: tabDetails }, () => {
                        this.viewBasicApi()
                    });
                }

            }else{
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, viewParentCategoryList.data.status.toString()));

            }
        } catch (error) {
            let errorObject = {
                methodName: "categoryMedia/viewParentCategoryFunc",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    viewBasicApi = async () => {
        try {
            let parent_category = this.state.tabArray.find(x => x.val === this.state.currentTabActive)
            globalLoader(true)

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-categories',
                body: {
                    parent_category_id: parent_category ? parent_category.parent_category_id : null,
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
                let resData = userResult.data.data;
                let categories = resData.categories.filter(e => e.all == 0);
                this.setState({
                    userDataArray: categories,
                    totalDocument: categories.length
                });
                globalLoader(false)
            }else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, userResult.data.status.toString()))
                this.setState({
                    userDataArray: [],
                    totalDocument: null,

                }, () => {
                    globalLoader(false)

                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "categoryMedia/viewBasicApi",
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
                methodName: "categoryMedia/sortingTable",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    changeValue = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value
        })
    }

    openEditUserModalFunc = async (category_id) => {

        let item = this.state.userDataArray.find(x => x.category_id === category_id);

        this.setState({
            currentUserId: category_id,
            editMode: true,
            currentData: item
        }, () => {
            this.setState({
                openAddEditModal: true,
            })

        })

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
                methodName: "categoryMedia/goToPage",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    deactiveDetail = async (id) => {
        try {
            globalLoader(true)
            let localTotalUserId = this.state.userDataArray.find(y => y.category_id == id);

            let obj = {
                method:API_METHODS.POST,
                history:this.props.history,
                api:'/archive-restore-category',
                body:{
                ids: localTotalUserId.category_id.toString(),
                status: this.props.isArchive ? "1" : "0",
            }}

            let userResult = await CallApiAsync(obj);
            if (userResult.data.status === 200) {

                if (localTotalUserId.length == this.state.userDataArray.length) {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage - 1
                    })
                    ));
                }

                this.setState({
                    checkedUserInfo: false,
                }, () => {
                    this.viewBasicApi()
                })
            }

            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, userResult.data.status.toString()))
                globalLoader(false)

            }
        } catch (error) {
            let errorObject = {
                methodName: "categoryMedia/deactiveDetail",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    logOut = () => {
        logOut(this.props.history, '/');
    }

    onOpenModal = (data) => {
        this.setState({ statusModal: true, selectedCatId: data.category_id })
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
                    this.props.isArchive ? getResourceValue(this.state.adminResources, 'RESTORE') : getResourceValue(this.state.adminResources, 'ADD_TO_ARCHIVE')
                }
            </a>
        )
    }

    render() {

        return (
            <>
                <div className="mb-10">
                    <CustomTableComponent
                        buttons={
                            this.props.isArchive ? [] :
                                [
                                    {
                                        text: `+ ${getResourceValue(this.state.adminResources, 'ADD_NEW')}`,
                                        onClick: () => this.openAddEditModalFunc(),
                                        type: BUTTON_TYPES.PRIMARY
                                    },
                                ]}

                        showCheckbox={true}
                        showSearchBar={true}
                        showTitle={true}
                        showFilter={true}
                        showAllCheck={true}

                        resources={this.state.adminResources}

                        customColumn={getResourceValue(this.state.adminResources, 'ACTION')}
                        customRow={this.renderCustomRow}

                        sortingTable={this.sortingTable}
                        totalUserId={this.state.totalDocument}
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
                        tableTitle={getResourceValue(this.state.adminResources, 'MediaCategories')}
                        primaryKey={'category_id'}
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
                    />
                </div>

                {this.state.openAddEditModal ?

                    <MediaCategoryModal currentData={this.state.currentData} currentTabActive={this.state.currentTabActive} editMode={this.state.editMode} tabArray={this.state.tabArray} open={this.state.openAddEditModal} onCloseModal={this.onCloseAddEditModal}

                        resources={this.state.adminResources}
                        addCondition={getResourceValue(this.state.adminResources, 'ADD_CONDITION')}
                        addTreatment={getResourceValue(this.state.adminResources, 'ADD_TREATMENT')}
                        addPartners={getResourceValue(this.state.adminResources, 'ADD_PARTNERS')}
                        condition={getResourceValue(this.state.adminResources, 'CONDITION')}
                        treatment={getResourceValue(this.state.adminResources, 'TREATMENT')}
                        partners={getResourceValue(this.state.adminResources, 'PARTNERS')}
                        addList={getResourceValue(this.state.adminResources, 'ADD_TO_LIST')}
                        cancelButton={getResourceValue(this.state.adminResources, 'CANCEL')}
                        saveButton={getResourceValue(this.state.adminResources, 'SAVE')}
                        removeButton={getResourceValue(this.state.adminResources, 'REMOVE')} />
                    : null}

                <Modal showCloseIcon={false} classNames={{ modal: "modal-md modal-own" }} open={this.state.statusModal} onClose={() => this.setState({ statusModal: false })} center closeOnOverlayClick={true}>
                    <div className="video-player-wrapper ">
                        <h3 className="font-20 primary-color py-3">
                            {this.props.isArchive ? getResourceValue(this.state.adminResources, 'RESTORE_CONFIRMATION') : getResourceValue(this.state.adminResources, 'ARCHIVE_CONFIRMATION')}
                        </h3>
                        {/* <div className="border-bottom-own pt-2 mb-3"></div> */}
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

export default connect(mapStateToProps)(withRouter(MediaCategories));