import { format } from "date-fns";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import {
    withRouter
} from "react-router-dom";
import { errorLogger, globalAlert, globalLoader, verifyRoute } from "../actions/commonActions";
import { API_METHODS, CONSTANTS, BUTTON_TYPES, CONTENT_TYPE, resourceGroups } from "../Constants/types";
import AddEditContentComponent from "../Components/AddEditContentComponent";
import AttachmentViewModal from "../Modals/AttachmentViewModal";
import CustomTableComponent from "../Components/CustomTableComponent";
import DeckViewModal from "../Modals/deckViewModal";
import VideoModal from "../Modals/videoModal";
import VideoViewModal from "../Modals/VideoViewModal";
import { CallApiAsync, getResourceValue, logOut } from "../Functions/CommonFunctions";

class Contents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openEditModal: false,
            openAddUserModal: false,
            openVideoModal: false,
            openDeckModal: false,
            openVideoViewModal: false,
            deckView: null,
            videoView: [],
            editData: null,
            videoUrl: null,
            pageSize: 25,
            currentPage: 1,
            searchVal: "",
            sortColName: "",
            sortType: true,
            mediaDataArray: [],
            contents: [],
            masterContents: [],
            totalUserId: [],
            allChecked: false,
            currentUserId: null,
            checkedUserInfo: false,
            totalDocument: 0,
            abcd: false,
            numPages: null,
            pageNumber: 1,
            adminResources: [],
            openAttachmentModal: false,
            attachmentView: [],
            languageId: props.languageId,
            languageList: [],
            contentsColumn: [],
            isArchive: props.isArchive ? props.isArchive : false,
            statusModal: false,
            selectedContentId: null,
        };
    }

    componentDidMount = () => {
        try {
            this.getAdminResources();
            globalLoader(true);
            const { languageList } = this.props;
            if (languageList && languageList.length > 0) {
                this.setState({ languageList: languageList })
            }
            this.viewBasicApi();
        } catch (error) {
            let errorObject = {
                methodName: "mediaLibrary/componentDidMount",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    };

    componentDidUpdate(prevProps) {
        const { languageId, isArchive } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources() });
        }

        if (isArchive !== this.state.isArchive) {
            this.setState({ isArchive: isArchive }, () => { this.viewBasicApi() });
        }
    }


    getAdminResources = async () => {
        try {
            globalLoader(true);
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.MANAGE_MEDIA, resourceGroups.COMMON, resourceGroups.UPLOAD_MEDIA, resourceGroups.FEATURE_MENU, resourceGroups.CONTENT_TYPE],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources });
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }
            let contentsColumn = [
                {
                    databaseColumn: 'content_title',
                    columnName: getResourceValue(this.state.adminResources, 'TITLE'),
                    isSort: true
                },
                {
                    databaseColumn: 'parent_category_name',
                    columnName: getResourceValue(this.state.adminResources, 'PARENT_CATEGORY_NAME'),
                    isSort: true,
                    width: '20%'
                },
                {
                    databaseColumn: 'category_name',
                    columnName: getResourceValue(this.state.adminResources, 'CATEGORY'),
                    isSort: true
                },

            ];
            this.setState({ contentsColumn: contentsColumn });
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "mediaLibrary/getAdminResources",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    getTitleName = (data) => {
        let defaultLanguageId = localStorage.getItem('default_language_id');
        if (data[this.state.languageId]) {
            return data[this.state.languageId].content_title;
        } else if (data[defaultLanguageId]) {
            return data[defaultLanguageId].content_title;
        }
    }

    viewBasicApi = async () => {
        try {
            globalLoader(true);
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-media-content',
                body: {
                    view_records: this.state.pageSize,
                    view_page: this.state.currentPage,
                    search_string: this.state.searchVal && this.state.searchVal,
                    sort_col_name: this.state.sortColName && this.state.sortColName,
                    sort_col_type: this.state.sortType ? "ASC" : "DESC",
                }
            };
            if (this.props.isArchive) {
                obj.body.deleted = '1';
            }

            let apiRes = await CallApiAsync(obj);
            if (apiRes && apiRes.data.status === 200) {
                let contents = [];
                if (apiRes.data.data.contents && apiRes.data.data.contents.length > 0) {
                    for (let content of apiRes.data.data.contents) {
                        let newContent = Object.create(content);
                        newContent.content_title = content.content_title;
                        if (content.content_created_on) {
                            newContent.content_created_on = format(new Date(content.content_created_on), "dd-MM-yyyy");
                        }
                        newContent.content_type_key = getResourceValue(this.state.adminResources, content.content_type_key);

                        contents.push(newContent);
                    }
                }

                this.setState({
                    mediaDataArray: contents,
                    masterContents: apiRes.data.data.contents,
                    totalDocument: apiRes.data.data.totalCount ? apiRes.data.data.totalCount : 0,
                    allChecked: false,
                    checkedUserInfo: false,
                }, () => { globalLoader(false); });
            } else {
                this.setState({ mediaDataArray: [], totalDocument: 0 }, () => {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, apiRes.data.status.toString()));
                    globalLoader(false);
                }
                );
            }
        } catch (error) {
            let errorObject = {
                methodName: "mediaLibrary/viewBasicApi",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    };


    deactivateData = async (id) => {
        try {
            globalLoader(true);
            let localTotalUserId = this.state.mediaDataArray.find((y) => y.content_id == id);
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/archive-restore-media-content',
                body: {
                    ids: localTotalUserId.content_id.toString(),
                    status: this.props.isArchive ? "1" : "0",
                }
            };
            let apiRes = await CallApiAsync(obj);
            if (apiRes && apiRes.data.status === 200) {
                if (localTotalUserId.length == this.state.mediaDataArray.length) {
                    this.setState((prevState => ({ currentPage: prevState.currentPage - 1 })));
                }
                this.setState({ checkedUserInfo: false }, () => { this.viewBasicApi(); });
            } else {
                globalAlert("error", getResourceValue(this.state.adminResources, apiRes.data.status.toString()));
                globalLoader(false);
            }
        } catch (error) {
            let errorObject = {
                methodName: "mediaLibrary/deactivateData",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    closeAddUserModal = () => {
        this.setState({
            openAddUserModal: false,
        });
    };
    openAddUserModal = () => {
        this.setState({
            openAddUserModal: true,
        });
    };

    openVideoModal = (name, path) => {
        this.setState({
            videoUrl: path,
            openVideoModal: true,
            videoTitle: name,
        });
    }

    closeViewModal = () => {
        this.setState({
            openVideoViewModal: false,
            videoView: [],
        });
    }

    closeAttachmentViewModal = () => {
        this.setState({
            openAttachmentModal: false,
            attachmentView: [],
        });
    }

    openViewFiles = async (id) => {
        globalLoader(true);
        let obj = {
            method: API_METHODS.POST,
            history: this.props.history,
            api: '/get-single-content',
            body: {
                content_id: id
            }
        };
        if (this.props.isArchive) {
            obj.body.deleted = '1';
        }
        let apiRes = await CallApiAsync(obj);
        if (apiRes) {
            if (apiRes.data.status === 200) {
                let data = apiRes.data.data.content;
                if (data) {
                    if (data.content_type_key === CONTENT_TYPE.VIDEO) {
                        this.setState({
                            openVideoViewModal: true,
                            videoView: data,
                        });
                    } else if (data.content_type_key === CONTENT_TYPE.DECK) {
                        this.setState({
                            openDeckModal: true,
                            deckView: data,
                        });
                    } else {
                        this.setState({
                            openAttachmentModal: true,
                            attachmentView: data,
                        });
                    }
                }
            } else {
                globalAlert("error", getResourceValue(this.state.adminResources, apiRes.data.status.toString()));
            }
        }
        globalLoader(false);
    };

    videoModalClose = () => {
        this.setState({
            openVideoModal: false,
            videoUrl: "",
            videoTitle: "",
        });
    };
    deckModalClose = () => {
        this.setState({
            deckView: null,
            openDeckModal: false,
        });
    };

    openEditUserModalFunc = async (id) => {
        globalLoader(true);
        let obj = {
            method: API_METHODS.POST,
            history: this.props.history,
            api: '/get-single-content',
            body: {
                content_id: id
            }
        };
        if (this.props.isArchive) {
            obj.body.deleted = '1';
        }
        let apiRes = await CallApiAsync(obj);
        if (apiRes) {
            if (apiRes.data.status === 200) {
                let data = apiRes.data.data.content;
                this.setState({ editData: data }, () => { this.setState({ openEditModal: true }) });
            } else {
                globalAlert("error", getResourceValue(this.state.adminResources, apiRes.data.status.toString()));
            }
        }
        globalLoader(false);
    };

    closeEditModal = (val) => {
        this.setState(
            {
                editData: null,
            },
            () => {
                this.setState({
                    openEditModal: false,
                });
            }
        );

        if (val) this.viewBasicApi();
    };

    searchFilter = (ev) => {
        ev.preventDefault();
        this.viewBasicApi();
    };

    checkedUsers = (ev, id, type) => {
        try {
            let localTotalUserId = [...this.state.mediaDataArray];

            if (type === "All") {
                localTotalUserId.forEach((element) => {
                    element.checked = ev.target.checked;
                });

                this.setState({
                    mediaDataArray: localTotalUserId,
                    allChecked: ev.target.checked,
                    checkedUserInfo: ev.target.checked,
                });
            } else {
                let index = localTotalUserId.findIndex((x) => x.content_id === id);

                localTotalUserId[index].checked = ev.target.checked;
                let check = localTotalUserId.some((x) => x.checked);

                let obj = {
                    mediaDataArray: localTotalUserId,
                    checkedUserInfo: check,
                };

                if (!ev.target.checked) {
                    obj.allChecked = ev.target.checked;
                }

                this.setState(obj);
            }
        } catch (error) {
            let errorObject = {
                methodName: "mediaLibrary/checkedUsers",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    };

    sortingTable = (val) => {

        if (val === this.state.sortColName) {
            this.setState(
                (prevState) => ({
                    sortType: !prevState.sortType,
                    currentPage: 1,
                }),
                () => {
                    this.viewBasicApi();
                }
            );
        } else {
            this.setState(
                {
                    sortColName: val,
                    sortType: true,
                    currentPage: 1,
                },
                () => {
                    this.viewBasicApi();
                }
            );
        }
    };

    onCloseChangeModal = (val) => {
        this.setState(
            {
                openEditUserModal: false,
            },
            () => {
                if (val) {
                    this.viewBasicApi();
                }
            }
        );
    };

    changePageSize = (ev) => {
        this.setState(
            {
                [ev.target.name]: ev.target.value,
                currentPage: 1,
            },
            () => {
                this.viewBasicApi();
            }
        );
    };

    changeValue = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value,
        });
    };

    logOut = () => {
        logOut(this.props.history, "/");
    };

    resetApiVal = () => {
        this.setState(
            {
                pageSize: 25,
                currentPage: 1,
                searchVal: "",
                sortColName: "",
                sortType: true,
            },
            () => {
                this.viewBasicApi();
            }
        );
    };

    goToPage = (ev, val) => {
        try {
            if (ev) {
                this.setState(
                    {
                        currentPage: ev.target.value,
                    },
                    () => {
                        this.viewBasicApi();
                    }
                );
            } else {
                if (val === "next") {
                    this.setState(
                        (prevState) => ({
                            currentPage: prevState.currentPage + 1,
                        }),
                        () => {
                            this.viewBasicApi();
                        }
                    );
                } else if (val === "prev") {
                    this.setState(
                        (prevState) => ({
                            currentPage: prevState.currentPage - 1,
                        }),
                        () => {
                            this.viewBasicApi();
                        }
                    );
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "mediaLibrary/goToPage",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    };

    onOpenModal = (data) => {
        this.setState({ statusModal: true, selectedContentId: data.content_id })
    };

    onSaveModal = () => {
        this.setState({ statusModal: false })
        this.deactivateData(this.state.selectedContentId);
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
                <div className="mediaLibraryContainer mb-10" >
                    <CustomTableComponent
                        buttons={
                            this.props.isArchive ? [] :
                                [
                                    {
                                        text: `+ ${getResourceValue(this.state.adminResources, 'ADD')}`,
                                        onClick: () => verifyRoute(this.props.history, '/upload-media'),
                                        type: BUTTON_TYPES.PRIMARY
                                    },

                                ]}
                        showSearchBar={true}
                        showTitle={true}
                        showFilter={true}
                        resources={this.state.adminResources}
                        sortingTable={this.sortingTable}
                        allChecked={this.state.allChecked}
                        totalUserId={this.state.totalUserId}
                        dataArray={this.state.mediaDataArray}
                        openEditUserModalFunc={!this.props.isArchive && this.openEditUserModalFunc}
                        sortObj={{
                            sortVal: this.state.sortColName,
                            sortType: this.state.sortType,
                        }}
                        customColumn={getResourceValue(this.state.adminResources, 'ACTION')}
                        customRow={this.renderCustomRow}

                        columnArray={this.state.contentsColumn}
                        tableTitle={getResourceValue(this.state.adminResources, 'CONTENTS')}
                        primaryKey={'content_id'}
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
                        checkedUsers={this.checkedUsers}

                        actionButton={this.openViewFiles}
                        customButtonColumn={getResourceValue(this.state.adminResources, 'PREVIEW')}
                        customButton={getResourceValue(this.state.adminResources, 'PREVIEW')}

                        yes={getResourceValue(this.state.adminResources, 'YES')}
                        no={getResourceValue(this.state.adminResources, 'NO')}
                    />
                </div>

                <Modal showCloseIcon={false} classNames={{ modal: "modal-md modal-own" }} open={this.state.statusModal} onClose={() => this.setState({ statusModal: false })} center closeOnOverlayClick={true} >
                    <div className="video-player-wrapper">
                        <h3 className="font-20 primary-color cpb-10">
                            {this.props.isArchive ? getResourceValue(this.state.adminResources, 'RESTORE_CONFIRMATION') : getResourceValue(this.state.adminResources, 'ARCHIVE_CONFIRMATION')}
                        </h3>
                        {/* <div className="border-bottom-own pt-2 mb-3"></div> */}
                        <div className="btn-wrapper">

                            <button type="button" onClick={() => this.setState({ statusModal: false })} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 text-uppercase mw-100"> {getResourceValue(this.state.adminResources, 'NO')}</button>
                            <button type="submit" onClick={() => { this.onSaveModal() }} className="btn full-width-xs btn-own btn-own-primary min-height-btn min-width-btn-md text-uppercase mw-100">{getResourceValue(this.state.adminResources, 'YES')}</button>
                        </div>
                    </div>
                </Modal>

                {this.state.openVideoViewModal && (
                    <VideoViewModal
                        resources={this.state.adminResources}
                        languageList={this.state.languageList}
                        open={this.state.openVideoViewModal}
                        onCloseModal={this.closeViewModal}
                        data={this.state.videoView}
                        openVideoFiles={(name, path) => this.openVideoModal(name, path)}
                    />)}

                {this.state.openAttachmentModal && (
                    <AttachmentViewModal
                        resources={this.state.adminResources}
                        open={this.state.openAttachmentModal}
                        onCloseModal={this.closeAttachmentViewModal}
                        data={this.state.attachmentView}
                    />)}

                <VideoModal
                    open={this.state.openVideoModal}
                    onCloseModal={this.videoModalClose}
                    url={this.state.videoUrl}
                    onVideoEnd={() => { }}
                    title={this.state.videoTitle}
                />
                {this.state.openDeckModal && (
                    <DeckViewModal
                        resources={this.state.adminResources}
                        open={this.state.openDeckModal}
                        onCloseModal={this.deckModalClose}
                        data={this.state.deckView}
                    />
                )}

                {this.state.openEditModal && (
                    <Modal
                        center
                        showCloseIcon={false}
                        open={this.state.openEditModal}
                        closeOnOverlayClick={false}
                        onClose={this.closeEditModal}
                        classNames={{ modal: "modal-lg modal-own" }}
                    >
                        <AddEditContentComponent
                            dataVal={this.state.editData}
                            onCloseModal={this.closeEditModal}
                            editMode={true}
                            editDeck={getResourceValue(this.state.adminResources, 'EDIT_MEDIA')}
                        />
                    </Modal>
                )}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    userData: state.user.userData,
    languageId: state.common.languageId,
    languageList: state.common.languageList
});

export default connect(mapStateToProps)(withRouter(Contents));
