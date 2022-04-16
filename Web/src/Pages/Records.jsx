import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from "react-responsive-modal";
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS, STATUS_CODES, GLOBAL_API, resourceGroups , RESOURCE_KEYS } from "../Constants/types";
import AddEditRecord from '../Modals/AddEditRecordModal';
import BulkUploadRecords from '../Modals/BulkUploadRecordsModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class Records extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchVal: '',
            records: [],
            resources: [],
            totalRecords: 0,
            columns: [],
            recordId: null,
            searchCategories: [],
            searchCategory: '',
            openAddEditRecordModal: false,
            isArchive: props.isArchive,
            archiveModal: false,
            bulkUploadModal: false,
            pageSize: SINGLE_VALUES.PAGE_SIZE,
            currentPage: 1,
        }
    }

    componentDidMount = () => {
        this.ViewRecordsAsync();
    }

    /**
     * in case you want to show archive record
     * @param {*} prevProps 
     */
    // componentDidUpdate(prevProps) {
    //     const { isArchive } = this.props;
    //     if (isArchive !== this.state.isArchive) {
    //         this.setState({ isArchive: isArchive }, () => { this.ViewRecordsAsync() });
    //     }
    // }

    ViewRecordsAsync = async () => {
        try {
            globalLoader(true)
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-records',
                body: {
                    groupIds: this.state.resources.length == 0 ? `${resourceGroups.COMMON_GROUP},${resourceGroups.USER_RECORDS_GROUP}` : ``,
                    searchString: this.state.searchVal ? this.state.searchVal : "",
                    deleted: this.props.isArchive ? 1 : 0,
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
                            databaseColumn: 'RecordBin',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.BIN),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordType',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_TYPE),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordSubType',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.SUB_TYPE),
                            isSort: true,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordExpiry',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_EXPIRY),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordOwnerName',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_OWNER),
                            isSort: true,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordCountry',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.COUNTRY),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordState',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.STATE),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordCity',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.CITY),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordZip',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_ZIP),
                            isSort: true,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordFullName',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_FULLNAME),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordPhoneNo',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_PhoneNo),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordBase',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_BASE),
                            isSort: false,
                            width: "15%",
                        },
                        {
                            databaseColumn: 'RecordPrice',
                            columnName: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_PRICE),
                            isSort: true,
                            width: "15%",
                        },
                    ];
                    let searchCategories = [
                        {
                            val: '',
                            name: ''
                        },
                        {
                            val: 'RecordType',
                            name: getResourceValue(resources, RESOURCE_KEYS.RECORD.RECORD_TYPE),
                        },
                        {
                            val: 'RecordSubType',
                            name: getResourceValue(resources, RESOURCE_KEYS.RECORD.SUB_TYPE)
                        }
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

    ArchiveRecordAsync = async (id) => {
        try {
            globalLoader(true);
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/archive-record',
                body: {
                    recordId: id,
                    status: this.props.isArchive ? 1 : 0
                }
            }
            let recordsResult = await CallApiAsync(obj);
            if (recordsResult.data.status === STATUS_CODES.OK) {
                this.ViewRecordsAsync();
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, recordsResult.data.status.toString()));
                globalLoader(false);
            }
        } catch (error) {
            let errorObject = {
                methodName: "uploadRecords/ArchiveRecordAsync",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    };

    SearchFilter = (ev) => {
        ev.preventDefault();
        this.ViewRecordsAsync();
    }

    CloseAddUserModal = (val = null) => {
        if (val) {
            this.ViewRecordsAsync();
        }
        this.setState({ openAddEditRecordModal: false });
    }

    renderCustomRow = (data) => {
        return (
            <a className={this.props.isArchive ? "activateLink cursor " : "dactivateLink cursor "} onClick={() => this.setState({ archiveModal: true, recordId: data.RecordID })} >
                {
                    this.props.isArchive ? getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.RESTORE) : getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ADD_TO_ARCHIVE)
                }
            </a>
        )
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
                            buttons={
                                this.props.isArchive ? [] : [
                                    {
                                        text: getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.BULK_UPLOAD),
                                        onClick: () => this.setState({ bulkUploadModal: true }),
                                        type: BUTTON_TYPES.PRIMARY
                                    },
                                    {
                                        text: getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.DOWNLOAD_TEMPLATE),
                                        onClick: () => window.open(`${GLOBAL_API}/uploads/records-template.xlsx`),
                                        type: BUTTON_TYPES.PRIMARY
                                    },
                                    {
                                        text: `+ ${getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ADD)}`,
                                        onClick: () => this.setState({ recordId: null, openAddEditRecordModal: true }),
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
                            primaryKey={'RecordID'}
                            totalCount={this.state.totalRecords}
                            searchVal={this.state.searchVal}
                            changeValue={(ev) => this.setState({ searchVal: ev.target.value })}
                            searchFilter={this.SearchFilter}
                            viewBasicApi={this.ViewRecordsAsync}
                            openEditUserModalFunc={(id) => this.setState({ recordId: id }, () => { this.setState({ openAddEditRecordModal: true }) })}
                            customColumn={getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ACTION)}
                            customRow={this.renderCustomRow}
                            tabArray={this.state.searchCategories}
                            currentTabActive={this.state.searchCategory}
                            setcurrentTabActive={(ev) => this.setState({ searchCategory: ev.target.value }, () => this.ViewRecordsAsync())}
                            goToPage={this.GoToPage}
                            changePageSize={(ev) => this.setState({ pageSize: ev.target.value, currentPage: 1 }, () => this.ViewRecordsAsync())}
                        />
                    </div>
                    {this.state.openAddEditRecordModal ?
                        <AddEditRecord
                            recordId={this.state.recordId}
                            closeCallBackOption={this.ViewRecordsAsync}
                            onCloseModal={this.CloseAddUserModal}
                            history={this.props.history}
                            resources={this.state.resources}
                        /> : null}
                    {this.state.bulkUploadModal ? <BulkUploadRecords
                        resources={this.state.resources}
                        onCloseModal={() => this.setState({ bulkUploadModal: false })}
                    /> : null}
                    <Modal classNames={{ modal: "modal-md modal-own" }} open={this.state.archiveModal} onClose={() => this.setState({ archiveModal: false })} center closeOnOverlayClick={true}>
                        <div className="video-player-wrapper">
                            <h3 className="font-20 primary-color cpb-10">
                                {this.props.isArchive ? getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.RESTORE_CONFIRMATION) : getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.ARCHIVE_CONFIRMATION)}
                            </h3>
                            <div className="btn-wrapper">
                                <button type="button" onClick={() => this.setState({ archiveModal: false })} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 text-uppercase mw-100"> {getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.NO)}</button>
                                <button type="submit" onClick={() => { this.setState({ archiveModal: false }, () => this.ArchiveRecordAsync(this.state.recordId)) }} className="btn full-width-xs btn-own btn-own-primary min-height-btn min-width-btn-md text-uppercase mw-100">{getResourceValue(this.state.resources, RESOURCE_KEYS.COMMON.YES)}</button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
    isArchive: state.common.isArchive,
})

export default connect(mapStateToProps)(withRouter(Records));