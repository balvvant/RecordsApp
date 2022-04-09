import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader, updateLanguageList } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES,STATUS_CODES,CONSTANTS, resourceGroups } from "../Constants/types";
import AddEditLanguageModal from '../Modals/AddEditLanguageModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';


class Languages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addEditLanguage: false,
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            dataArray: [],
            currentUserId: null,
            checkedUserInfo: false,
            totalDocument: null,
            currentActiveData: null,
            editMode: false,
            adminResources: [],
            columns: [],
            selectdData: {},
            statusData: '',
            activateDeactivateLanguageModal: false,
            languageId: props.languageId,
        }
    }

    componentDidMount = () => {
        globalLoader(true)
        this.viewUserApi()
        this.getAdminResources()
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
                    group_id: [resourceGroups.COMMON, resourceGroups.FEATURE_MENU, resourceGroups.LANGUAGE_RESOURCES],

                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === STATUS_CODES.OK) {
                let resources = resourcesResult.data.data.resources;

                let columns = [
                    {
                        databaseColumn: 'language_id',
                        columnName: getResourceValue(resources, 'LANGUAGE_ID'),
                        isSort: true
                    },
                    {
                        databaseColumn: 'language_name',
                        columnName: getResourceValue(resources, 'LANGUAGE_NAME'),
                        isSort: true
                    },
                    {
                        databaseColumn: 'language_code',
                        columnName: getResourceValue(resources, 'LANGUAGE_CODE'),
                        isSort: true
                    }
                ];

                this.setState({ adminResources: resources, columns: columns });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "languages/getAdminResources",
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
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-languages',
                body: {
                    view_records: this.state.pageSize,
                    view_page: this.state.currentPage,
                    search_string: this.state.searchVal && this.state.searchVal,
                    sort_col_name: this.state.sortColName && this.state.sortColName,
                    sort_col_type: this.state.sortType ? "ASC" : "DESC",
                }
            }
            let languageResult = await CallApiAsync(obj);

            if (languageResult.data.status === STATUS_CODES.OK) {
                let count = languageResult.data.data.totalCount;

                // if (count > 0) {
                //     globalAlert("success", getResourceValue(this.state.adminResources, languageResult.data.status.toString()).replace("{total}", count));
                // }
                // else {
                //     globalAlert("error", getResourceValue(this.state.adminResources, 'NO_RECORDS'));
                // }

                this.setState({
                    dataArray: languageResult.data.data.languages,
                    totalDocument: count,
                    allChecked: false,
                    checkedUserInfo: false,
                }, () => {
                    globalLoader(false)

                })


            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, languageResult.data.status.toString()))
                this.setState({
                    dataArray: [],
                    totalDocument: null,

                }, () => {
                    globalLoader(false)

                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "languages/viewUserApi",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    activateDeactivateLanguage = async (languageId, isActive) => {
        try {
            globalLoader(true);

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/activate-deactivate-language',
                body: {
                    language_id: languageId,
                    is_active: isActive,
                }
            }

            let languageResult = await CallApiAsync(obj);

            if (languageResult.data.status === STATUS_CODES.OK) {
                // globalAlert("success", languageResult.data.status.toString());

                let index = this.state.dataArray.findIndex(e => e.language_id == languageId);
                this.state.dataArray[index].is_active = isActive;
                this.setState({ dataArray: this.state.dataArray });


                let langArry = []
                this.state.dataArray.forEach((value, i) => {
                    if (value.is_active == 1) {
                        let obj = value;
                        langArry.push(obj)
                    }

                })

                if (langArry) {
                    updateLanguageList(langArry);
                    localStorage.setItem('languageList', JSON.stringify(langArry))
                }


                if (this.state.dataArray[index].is_active == 0 && this.state.dataArray[index].is_default == 1) {
                    let defaultLangValue = this.state.dataArray.find(e => e.language_id == 1);

                    let obj = {
                        method:API_METHODS.POST,
                        history:this.props.history,
                        api:'/edit-language',
                        body:{
                        language_name: defaultLangValue.language_name,
                        language_code: defaultLangValue.language_code,
                        is_default: '1',
                        language_id: defaultLangValue.language_id
                    }}
                    let defaultLanguageResult = await CallApiAsync(obj);
                    if (defaultLanguageResult.data.status === STATUS_CODES.OK) {
                        this.viewUserApi()
                    }
                    else {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, languageResult.data.status.toString()));
                    }
                    globalLoader(false)
                }
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, languageResult.data.status.toString()));
            }

            globalLoader(false)
        } catch (error) {
            let errorObject = {
                methodName: "languages/deactivateData",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    closeAddEditLanguageModal = (val) => {
        if (val) {
            this.setState({
                addEditLanguage: false,
                currentActiveData: null,
                editMode: false,
            }, () => {
                this.viewUserApi()
            })
        }
        else {
            this.setState({
                addEditLanguage: false,
                currentActiveData: null,
                editMode: false,
            })
        }
    }
    openAddEditLanguageModal = () => {
        this.setState({
            addEditLanguage: true
        })
    }

    openEditLanguageModalFunc = (languageId) => {
        try {
            let localCurrentActiveData = this.state.dataArray.find(x => x.language_id === languageId);

            this.setState({
                currentActiveData: localCurrentActiveData,
                editMode: true,
            }, () => {
                this.setState({
                    addEditLanguage: true,
                })

            })
        } catch (error) {
            let errorObject = {
                methodName: "languages/openEditLanguageModalFunc",
                errorStake: error.toString(),
                history: this.props.history
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
                methodName: "languages/goToPage",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    onCloseModal = () => {
        this.setState({ activateDeactivateLanguageModal: false })
    };

    onOpenModal = (data) => {
        global.isModalOpen = true;
        this.setState({ activateDeactivateLanguageModal: true, statusData: data.is_active == 0 ? 'STATUS_ACTIVATE' : 'STATUS_DEACTIVATE', selectdData: data })
    };

    onSaveModal = () => {
        this.setState({ activateDeactivateLanguageModal: false })
        this.activateDeactivateLanguage(this.state.selectdData.language_id, this.state.selectdData.is_active ? 0 : 1)
    };

    renderCustomRow = (data) => {
        return (
            <a
                className={data.is_active ? "activateLink cursor " : "dactivateLink cursor "}
                onClick={() => this.onOpenModal(data)}
            >
                {
                    data.is_active ? getResourceValue(this.state.adminResources, 'ACTIVE') : getResourceValue(this.state.adminResources, 'DEACTIVE')
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
                            buttons={[
                                {
                                    text: `+ ${getResourceValue(this.state.adminResources, 'ADD')}`,
                                    onClick: () => this.openAddEditLanguageModal(),
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
                            dataArray={this.state.dataArray}
                            openEditUserModalFunc={this.openEditLanguageModalFunc}
                            sortObj={{
                                sortVal: this.state.sortColName,
                                sortType: this.state.sortType,
                            }}

                            customColumn={getResourceValue(this.state.adminResources, 'LANGUAGE_STATUS')}
                            customRow={this.renderCustomRow}
                            columnArray={this.state.columns}
                            tableTitle={getResourceValue(this.state.adminResources, 'Languages')}
                            primaryKey={'language_id'}
                            pageSize={this.state.pageSize}
                            goToPage={this.goToPage}
                            totalCount={this.state.totalDocument}
                            currentPage={this.state.currentPage}
                            changePageSize={this.changePageSize}
                            searchVal={this.state.searchVal}
                            changeValue={this.changeValue}
                            searchFilter={this.searchFilter}
                            viewBasicApi={this.viewUserApi}
                            yes={getResourceValue(this.state.adminResources, 'YES')}
                            no={getResourceValue(this.state.adminResources, 'NO')}
                        />
                    </div>
                    {this.state.addEditLanguage ?
                        <AddEditLanguageModal
                            editMode={this.state.editMode}
                            currentData={this.state.currentActiveData}
                            closeCallBackOption={this.viewUserApi}
                            open={true}
                            onCloseModal={this.closeAddEditLanguageModal}
                            resources={this.state.adminResources}
                        /> : null}
                    <Modal showCloseIcon={false} classNames={{ modal: "modal-md modal-own" }} open={this.state.activateDeactivateLanguageModal} onClose={() => this.onCloseModal()} center closeOnOverlayClick={true}>
                        <div className="video-player-wrapper px-2">
                            <h3 className="font-20 primary-color py-3">
                                {getResourceValue(this.state.adminResources, 'CONFIRM_QUESTION').replace('{status}', getResourceValue(this.state.adminResources, this.state.statusData))}
                            </h3>
                            <div className="btn-wrapper ">

                                <button type="button" onClick={() => this.onCloseModal()} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 text-uppercase mw-100"> {getResourceValue(this.state.adminResources, 'NO')}</button>
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
    languageId: state.common.languageId
})

export default connect(mapStateToProps)(withRouter(Languages));