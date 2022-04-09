import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS,STATUS_CODES,resourceGroups } from "../Constants/types";
import AddEditStaticPageModal from '../Modals/AddEditStaticPageModal';
import AddEditWebsiteMenuModal from '../Modals/AddEditWebsiteMenuModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class WebsiteMenus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            addEditWebsiteMenu: false,
            currentActiveData: null,
            editMode: false,
            adminResources: [],
            languageId: props.languageId,
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            dataArray: [],
            editModePage: false,

            pages: [],
            totalPages: null,
            addEditStaticPage: false,
            SPpageSize: 25,
            SPcurrentPage: 1,
            SPsearchVal: '',
            columnArrayWebsite: [],
            totalCountWeb: null,
            totalCountSP: null
        }
    }

    componentDidMount = () => {
        this.viewWebsiteMenu();
        this.viewStaticPage();
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
            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.UPLOAD_MEDIA, resourceGroups.FEATURE_MENU, resourceGroups.MENU_GROUPS, resourceGroups.MENUS, resourceGroups.FOOTER_MENU_HEADER_GROUPS, resourceGroups.WEBSITE_MENU, resourceGroups.LANGUAGE_RESOURCES],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === STATUS_CODES.OK) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }
            let columnArrayWebsite = [

                {
                    databaseColumn: 'place_holder_value',
                    columnName: getResourceValue(this.state.adminResources, 'MENU'),
                    isSort: false,
                    width: '50%'
                },
                {
                    databaseColumn: 'parent_menu',
                    columnName: getResourceValue(this.state.adminResources, 'PARENT_MENU'),
                    isSort: false,
                    width: '30%'
                },
                {
                    databaseColumn: 'sequence_no',
                    columnName: getResourceValue(this.state.adminResources, 'SEQUENCE_NO'),
                    isSort: false,
                    width: '10%'
                },
                {
                    databaseColumn: 'menu_type_value',
                    columnName: getResourceValue(this.state.adminResources, 'MENU_TYPE'),
                    isSort: false
                },
            ];

            this.setState({ columnArrayWebsite: columnArrayWebsite });

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "adminconfiguration/getAdminResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    viewWebsiteMenu = async () => {
        try {
            globalLoader(true)
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-website-menus',
                body: {
                    view_records: this.state.pageSize,
                    view_page: this.state.currentPage,
                    search_string: this.state.searchVal && this.state.searchVal,
                    sort_col_name: this.state.sortColName && this.state.sortColName,
                    sort_col_type: this.state.sortType ? "ASC" : "DESC",
                }
            }
            let menuResult = await CallApiAsync(obj);

            if (menuResult.data.status === STATUS_CODES.OK) {
                let count = menuResult.data.data.totalCount;
                this.setState({
                    dataArray: menuResult.data.data.webMenus,
                    totalCountWeb: count,
                }, () => {
                    globalLoader(false)
                })
            }

            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, menuResult.data.status.toString()))
                this.setState({
                    dataArray: [],
                    totalCountWeb: null,
                }, () => {
                    globalLoader(false)
                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "websiteMenu/viewWebsiteMenu",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    viewStaticPage = async () => {
        try {
            globalLoader(true)

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-static-pages',
                body: {
                    view_records: this.state.SPpageSize,
                    view_page: this.state.SPcurrentPage,
                    search_string: this.state.SPsearchVal && this.state.SPsearchVal,
                }
            }
            let menuResult = await CallApiAsync(obj);
            if (menuResult.data.status === STATUS_CODES.OK) {
                let count = menuResult.data.data.totalCount;

                this.setState({
                    pages: menuResult.data.data.pages,
                    totalCountSP: count,
                }, () => {
                    globalLoader(false)
                })
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, menuResult.data.status.toString()))
                this.setState({
                    pages: [],
                    totalCountSP: null,
                }, () => {
                    globalLoader(false)
                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "websiteMenu/viewStaticPageApi",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    closeAddEditWebsiteMenuModal = (val) => {
        if (val) {
            this.setState({
                addEditWebsiteMenu: false,
                currentActiveData: null,
                editMode: false,
            }, () => {
                this.viewStaticPage();
                this.viewWebsiteMenu();
            })
        }
        else {
            this.setState({
                addEditWebsiteMenu: false,
                currentActiveData: null,
                editMode: false,
            })
        }
    }

    closeAddEditStaticPageModal = (val) => {
        if (val) {
            this.setState({
                addEditStaticPage: false,
                currentActiveData: null,
                editModePage: false,
            }, () => {
                this.viewStaticPage();
                this.viewWebsiteMenu();
            })
        }
        else {
            this.setState({
                addEditStaticPage: false,
                currentActiveData: null,
                editModePage: false,
            })
        }
    }

    openAddEditWebsiteMenuModal = () => {
        this.setState({
            addEditWebsiteMenu: true
        })
    }

    openAddEditStaticPageModal = () => {
        this.setState({
            addEditStaticPage: true
        })
    }

    openEditWebsiteMenuFunc = (websiteMenuId) => {
        try {
            let localCurrentActiveData = this.state.dataArray.find(x => x.website_menu_id === websiteMenuId);

            this.setState({
                currentActiveData: localCurrentActiveData,
                editMode: true,
            }, () => {
                this.setState({
                    addEditWebsiteMenu: true,
                })

            })
        } catch (error) {
            let errorObject = {
                methodName: "websitemenu/openEditWebsiteMenuFunc",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    openEditPagesFunc = (resource_key_id) => {
        try {
            let localCurrentActiveData = this.state.pages.find(x => x.resource_key_id === resource_key_id);

            this.setState({
                currentActiveData: localCurrentActiveData,
                editModePage: true,
            }, () => {
                this.setState({
                    addEditStaticPage: true,
                })

            })
        } catch (error) {
            let errorObject = {
                methodName: "websitemenu/openEditPagesFunc",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    searchWebsiteFilter = (ev) => {
        ev.preventDefault();
        this.viewWebsiteMenu()
    }

    searchFilter = (ev) => {
        ev.preventDefault();
        this.viewStaticPage();
    }

    sortingTable = (val) => {
        if (val === this.state.sortColName) {
            this.setState((prevState => ({
                sortType: !prevState.sortType,
                currentPage: 1,
            }

            )), () => {
                this.viewWebsiteMenu()
            })
        }
        else {
            this.setState({
                sortColName: val,
                sortType: true,
                currentPage: 1,
            }, () => {
                this.viewWebsiteMenu()
            })
        }
    }

    changePageSize = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value,
            currentPage: 1,
        }, () => {
            this.viewWebsiteMenu()
        })
    }

    changeValue = (ev) => {

        this.setState({
            [ev.target.name]: ev.target.value
        })
    }

    goToPage = (ev, val) => {
        try {
            if (ev) {
                this.setState({
                    currentPage: ev.target.value
                }, () => {
                    this.viewWebsiteMenu()
                })
            }
            else {
                if (val === 'next') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage + 1
                    }

                    )), () => {
                        this.viewWebsiteMenu()
                    })
                }
                else if (val === 'prev') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage - 1
                    }

                    )), () => {
                        this.viewWebsiteMenu()
                    })
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "websiteMenu/goToPage",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    goToPageForPagesTable = (ev, val) => {
        try {
            if (ev) {
                this.setState({
                    SPcurrentPage: ev.target.value
                }, () => {
                    this.viewStaticPage()
                })
            }
            else {
                if (val === 'next') {
                    this.setState((prevState => ({
                        SPcurrentPage: prevState.SPcurrentPage + 1
                    }

                    )), () => {
                        this.viewStaticPage()
                    })
                }
                else if (val === 'prev') {
                    this.setState((prevState => ({
                        SPcurrentPage: prevState.SPcurrentPage - 1
                    }

                    )), () => {
                        this.viewStaticPage()
                    })
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "websiteMenu/goToPageForPagesTable",
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
                    <div className="content-container mb-10 p-0 ">
                        <CustomTableComponent
                            buttons={[
                                {
                                    text: `+ ${getResourceValue(this.state.adminResources, 'ADD_NEW')}`,
                                    onClick: () => this.openAddEditWebsiteMenuModal(),
                                    type: BUTTON_TYPES.PRIMARY
                                },
                            ]}

                            showCheckbox={true}
                            showSearchBar={true}
                            showTitle={true}
                            showFilter={true}

                            resources={this.state.adminResources}
                            sortingTable={this.sortingTable}
                            allChecked={this.state.allChecked}
                            totalUserId={this.state.totalUserId}
                            dataArray={this.state.dataArray}

                            openEditUserModalFunc={this.openEditWebsiteMenuFunc}
                            sortObj={{
                                sortVal: this.state.sortColName,
                                sortType: this.state.sortType,
                            }}

                            currentTabActive={this.state.currentTabActive}
                            setcurrentTabActive={this.setcurrentTabActive}

                            columnArray={this.state.columnArrayWebsite}
                            tableTitle={getResourceValue(this.state.adminResources, 'WebsiteMenus')}

                            primaryKey={'website_menu_id'}
                            pageSize={this.state.pageSize}
                            goToPage={this.goToPage}
                            totalCount={this.state.totalCountWeb}
                            currentPage={this.state.currentPage}
                            inputLabel={getResourceValue(this.state.adminResources, 'SHOW_PER_PAGE')}
                            pageCount={getResourceValue(this.state.adminResources, 'PAGE_COUNT')}
                            changePageSize={this.changePageSize}
                            searchVal={this.state.searchVal}
                            changeValue={(ev) => this.setState({ searchVal: ev.target.value })}
                            searchFilter={this.searchWebsiteFilter}
                            viewBasicApi={this.viewWebsiteMenu}
                        />
                    </div>

                    <div className="content-container cmt-10 cmb-10 p-0">
                        <CustomTableComponent
                            buttons={[
                                {
                                    text: `+ ${getResourceValue(this.state.adminResources, 'ADD_NEW')}`,
                                    onClick: () => this.openAddEditStaticPageModal(),
                                    type: BUTTON_TYPES.PRIMARY
                                },
                            ]}

                            showCheckbox={true}
                            showSearchBar={true}
                            showTitle={true}
                            showFilter={true}

                            resources={this.state.adminResources}
                            sortingTable={this.sortingTable}
                            allChecked={this.state.allChecked}
                            totalUserId={this.state.totalUserId}
                            dataArray={this.state.pages}

                            openEditUserModalFunc={this.openEditPagesFunc}
                            sortObj={{
                                sortVal: this.state.sortColName,
                                sortType: this.state.sortType,
                            }}

                            columnArray={this.state.columnArrayWebsite}
                            tableTitle={getResourceValue(this.state.adminResources, 'STATIC_PAGES')}

                            primaryKey={'resource_key_id'}
                            pageSize={this.state.SPpageSize}
                            goToPage={this.goToPage}
                            totalCount={this.state.totalCountSP}
                            currentPage={this.state.SPcurrentPage}
                            inputLabel={getResourceValue(this.state.adminResources, 'SHOW_PER_PAGE')}
                            pageCount={getResourceValue(this.state.adminResources, 'PAGE_COUNT')}
                            changePageSize={this.changePageSize}
                            searchVal={this.state.SPsearchVal}
                            changeValue={(ev) => this.setState({ SPsearchVal: ev.target.value })}
                            searchFilter={this.searchFilter}
                            viewBasicApi={this.viewStaticPage}

                        />
                    </div>
                </div>
                {this.state.addEditWebsiteMenu ?
                    <AddEditWebsiteMenuModal
                        editMode={this.state.editMode}
                        menus={this.state.dataArray}
                        currentData={this.state.currentActiveData}
                        closeCallBackOption={this.viewWebsiteMenuApi}
                        open={true}
                        onCloseModal={this.closeAddEditWebsiteMenuModal}
                        resources={this.state.adminResources}
                    /> : null}

                {this.state.addEditStaticPage ?
                    <AddEditStaticPageModal
                        editMode={this.state.editModePage}
                        currentData={this.state.currentActiveData}
                        closeCallBackOption={this.viewWebsiteMenuApi}
                        open={true}
                        onCloseModal={this.closeAddEditStaticPageModal}
                        resources={this.state.adminResources}
                    /> : null}
            </>
        )
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId
})
export default connect(mapStateToProps)(withRouter(WebsiteMenus));