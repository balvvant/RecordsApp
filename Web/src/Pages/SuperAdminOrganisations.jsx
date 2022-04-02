import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, resourceGroups,CONSTANTS, ROLES } from "../Constants/types";
import AddOrganisationModal from '../Modals/addOrganisationModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class SuperAdminOrganisations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openAddUserModal: false,
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            dataArray: [],
            totalUserId: [],
            totalDocument: null,
            currentActiveData: null,
            editMode: false,
            adminResources: [],
            languageId: props.languageId,
            columnArray: [],
            isArchive: props.isArchive ? props.isArchive : false,
            statusModal: false,
            selectedOrgId: null,
        }
    }

    componentDidMount = () => {
        globalLoader(true)
        this.viewUserApi()
        this.getAdminResources();
    }

    componentDidUpdate = () => {
        const { languageId, isArchive } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources() });
        }

        if (isArchive !== this.state.isArchive) {
            this.setState({ isArchive: isArchive }, () => { this.viewUserApi() });
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
                    group_id: [resourceGroups.COMMON, resourceGroups.MANAGE_ORGANIZATION, resourceGroups.FEATURE_MENU, resourceGroups.MEDIA_CATEGORY],
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
            let columnArrayTemp = [
                {
                    databaseColumn: 'name',
                    columnName: getResourceValue(this.state.adminResources, 'NAME'),
                    isSort: true,
                    width: '30%'
                },

                {
                    databaseColumn: 'city',
                    columnName: getResourceValue(this.state.adminResources, 'CITY'),
                    isSort: true,
                    width: '30%'
                },
                {
                    databaseColumn: 'country',
                    columnName: getResourceValue(this.state.adminResources, 'COUNTRY'),
                    isSort: true,
                    width: '15%'
                },
                {
                    databaseColumn: 'zip_code',
                    columnName: getResourceValue(this.state.adminResources, 'POSTCODE'),
                    isSort: true,
                    width: '15%'
                },
            ];


            this.setState({ columnArray: columnArrayTemp });

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "manageOrganisations/getAdminResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }
    changeLanguage = (languageId) => {
        localStorage.setItem('language_id', languageId);
        this.setState({ languageId }, () => {
            this.getAdminResources();
        });
    }

    viewUserApi = async () => {
        try {
            globalLoader(true)
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-organizations',
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
                let count = userResult.data.data.totalCount;

                // if (count > 0) {
                //     globalAlert("success", getResourceValue(this.state.adminResources, userResult.data.status.toString()).replace("{total}", count));
                // }
                // else {
                //     globalAlert("error", getResourceValue(this.state.adminResources, 'NO_RECORDS'));
                // }

                this.setState({
                    dataArray: userResult.data.data.organizations,
                    totalDocument: count
                }, () => {
                    globalLoader(false)

                })


            }
            else {
                 globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, userResult.data.status.toString()))
                this.setState({
                    dataArray: [],
                    totalDocument: null,

                }, () => {
                    globalLoader(false)

                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageOrganisations/viewUserApi",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    deactivateData = async (id) => {
        try {
            globalLoader(true)
            let localTotalUserId = this.state.dataArray.find(y => y.organization_id == id);

            let obj = {
            method:API_METHODS.POST,
            history:this.props.history,
            api:'/archive-restore-organization',
            body:{
                id: localTotalUserId.organization_id.toString(),
                status: this.props.isArchive ? "1" : "0",
            }}

            let userResult = await CallApiAsync(obj);

            if (userResult.data.status === 200) {

                if (localTotalUserId.length == this.state.dataArray.length) {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage - 1
                    })
                    ));
                }

                this.viewUserApi();
            }

            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, userResult.data.status.toString()))
                globalLoader(false)

            }

        } catch (error) {
            let errorObject = {
                methodName: "manageOrganisations/deactivateData",
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
                this.viewUserApi()
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
    openAddUserModal = () => {
        this.setState({
            openAddUserModal: true
        })
    }

    openEditUserModalFunc = (id) => {
        try {
            let localCurrentActiveData = this.state.dataArray.find(x => x.organization_id === id);
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
                methodName: "manageOrganisations/openEditUserModalFunc",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
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
            }

            )), () => {
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

    goToPage = (ev, val) => {
        try {
            if (ev) {
                this.setState({
                    currentPage: ev.target.value
                }, () => {
                    this.viewUserApi()
                })
            }
            else {
                if (val === 'next') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage + 1
                    }

                    )), () => {
                        this.viewUserApi()
                    })
                }
                else if (val === 'prev') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage - 1
                    }

                    )), () => {
                        this.viewUserApi()
                    })
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageOrganisations/goToPage",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    onOpenModal = (data) => {
        this.setState({ statusModal: true, selectedOrgId: data.organization_id })
    };

    onSaveModal = () => {
        this.setState({ statusModal: false })
        this.deactivateData(this.state.selectedOrgId);
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
                <div>
                    <div className="mb-10">
                        <CustomTableComponent
                            buttons={
                                this.props.isArchive ? [] :
                                    [
                                        {
                                            text: `+ ${getResourceValue(this.state.adminResources, 'ADD')}`,
                                            onClick: () => this.openAddUserModal(),
                                            type: BUTTON_TYPES.PRIMARY
                                        },

                                    ]}
                            showFilter={true}
                            showCheckbox={true}
                            showTitle={true}
                            showSearchBar={true}
                            checkBoxValidate={false}
                            showAllCheck={true}
                            showArchive={true}
                            resources={this.state.adminResources}
                            sortingTable={this.sortingTable}
                            tableTitle={getResourceValue(this.state.adminResources, 'ArchiveOrganisations')}
                            customColumn={getResourceValue(this.state.adminResources, 'ACTION')}
                            customRow={this.renderCustomRow}
                            totalUserId={this.state.totalUserId}
                            dataArray={this.state.dataArray}
                            openEditUserModalFunc={!this.props.isArchive && this.openEditUserModalFunc}
                            sortObj={{
                                sortVal: this.state.sortColName,
                                sortType: this.state.sortType,
                            }}
                            primaryKey={'organization_id'}
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
                            openViewFiles={this.openViewFiles}
                            columnArray={this.state.columnArray}
                            editColumn={getResourceValue(this.state.adminResources, 'EDIT')}
                            yes={getResourceValue(this.state.adminResources, 'YES')}
                            no={getResourceValue(this.state.adminResources, 'NO')}
                        />
                    </div>
                    {this.state.openAddUserModal ?
                        <AddOrganisationModal editMode={this.state.editMode} currentData={this.state.currentActiveData} closeCallBackOption={this.viewUserApi} open={true} onCloseModal={this.closeAddUserModal} roleType={ROLES.SUPER_ADMIN}
                            resources={this.state.adminResources}
                        /> : null}

                    <Modal showCloseIcon={false} classNames={{ modal: "modal-md modal-own" }} open={this.state.statusModal} onClose={() => this.setState({ statusModal: false })} center closeOnOverlayClick={true}>
                        <div className="video-player-wrapper">
                            <h3 className="font-20 primary-color py-3">
                                {this.props.isArchive ? getResourceValue(this.state.adminResources, 'RESTORE_CONFIRMATION') : getResourceValue(this.state.adminResources, 'ARCHIVE_CONFIRMATION')}
                            </h3>
                            <div className="btn-wrapper">
                                <button type="button" onClick={() => this.setState({ statusModal: false })} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 text-uppercase mw-100"> {getResourceValue(this.state.adminResources, 'NO')}</button>
                                <button type="submit" onClick={() => { this.onSaveModal() }} className="btn full-width-xs btn-own btn-own-primary min-height-btn min-width-btn-md text-uppercase mw-100">{getResourceValue(this.state.adminResources, 'YES')}</button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </>

        )
    }


}

const mapStateToProps = state => ({
    userData: state.user.userData,
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(SuperAdminOrganisations));