import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import {
    ControlBar, CurrentTimeDisplay, ForwardControl, PlaybackRateMenuButton, Player, ReplayControl, TimeDivider
} from "video-react";
import "video-react/dist/video-react.css";
import { errorLogger, globalAlert, globalLoader, teachStartTime } from '../actions/commonActions';
import { API_METHODS, CONTENT_FILTER_TYPES, CONTENT_TYPE, DashboardStatus, DeckStatus, FromPage, GLOBAL_API, CONSTANTS, TEACH_NOW_TYPES } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';
import ConfirmationModal from '../Modals/confirmModal';
import DeleteModal from "../Modals/deleteModal";
import SendTeachModal from '../Modals/sendTeachModal';
import TeachNowModal from '../Modals/teachNowModal';
import { URLIcon } from '../Constants/svgIcons';
import { format } from 'date-fns';
import LinkDeck from '../Components/ContentPreviewComponent';



const DeckModal = React.memo((props) => {
    const [sendNowModal, setSendNowModal] = useState(false);
    const [teachNowOpen, setTeachNowOpen] = useState(false);
    const [sendTeachOpen, setSendTeachOpen] = useState(false);
    const [slides, setSlides] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [video, setVideo] = useState(null);
    const [deckType, setDeckType] = useState(DeckStatus.Deck);
    const [teachDeckMail, setTeachDeckMail] = useState(false);
    const [newName, setNewName] = useState('');
    const [confirmaModalOpen, setConfirmaModalOpen] = useState(false);
    const [selectedLan, setSelectedLan] = useState('');
    const [currentSlide, setCurrentSlide] = useState(1);
    const [contentFiles, setContentFiles] = useState([]);
    const [contentPath, setContentPath] = useState('');
    const [deleteModal, setDeleteModal] = useState(false);
    const [links, setLinks] = useState([[0], [1]]);
    const [contentFileId, setContentFileId] = useState(0)

    let uploadInterval = 0;
    let uploadStatus = "uploading";
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    };
    useEffect(() => {
        if (!props.data.modified) {
            setupContentFiles();

        }
    }, [props.data]);

    const setupContentFiles = async () => {

        try {
            globalLoader(true);
            let obj = {
                method: API_METHODS.POST,
                history: props.history,
                api: '/get-content-files',
                body: {}
            }
            if (props.data.clinician_content_id) {
                obj.body.clinician_content_id = props.data.clinician_content_id;
            } else {
                obj.body.content_id = props.data.content_id;
            }

            let res = await CallApiAsync(obj);

            if (res.data?.status === 200) {
                if (res.data?.data?.content_files.length > 0) {
                    let files = res.data?.data?.content_files;
                    if (files.length > 0) {
                        let contentFiles = [];
                        let linkFiles = [];
                        let link = [];
                        if (res.data?.data?.links.length > 0) {
                            linkFiles = res.data?.data?.links;
                        }
                        if (props.data.clinician_content_id) {
                            link[props?.data?.default_language_id] = linkFiles;
                            if (props.data.content_type_key == CONTENT_TYPE.DECK) {
                                contentFiles[props?.data?.default_language_id] = files;
                            } else {
                                contentFiles[props?.data?.default_language_id] = files[0];
                            }
                        } else {
                            for (let langId of props.data.languages) {
                                if (files.length > 0) {
                                    if (props.data.content_type_key == CONTENT_TYPE.DECK) {
                                        let deckDetail = files.filter(e => e.language_id == langId);
                                        if (deckDetail) {
                                            contentFiles[langId] = deckDetail;
                                        }
                                        let deckLinks = linkFiles.filter(e => e.language_id == langId);
                                        if (deckLinks) {
                                            link[langId] = deckLinks;
                                        }
                                    } else {
                                        let deckDetail = files.find(e => e.language_id == langId);
                                        if (deckDetail) {
                                            contentFiles[langId] = deckDetail;
                                        }
                                        let deckLinks = linkFiles.filter(e => e.language_id == langId);
                                        if (deckLinks) {
                                            link[langId] = deckLinks;
                                        }
                                    }
                                }
                            }
                        }
                        if (contentFiles.length > 0) {
                            let defaultLanguageId = localStorage.getItem('default_language_id');
                            if (props.data.languages.includes(props.languageId)) {
                                setContentPath(contentFiles[props.languageId].file_path);
                                setSelectedLan(props.languageId)
                                // setContentFileId(contentFiles[props.languageId].content_file_id);
                            } else if (props.data.languages.includes(parseInt(defaultLanguageId))) {
                                setContentPath(contentFiles[defaultLanguageId].file_path);
                                setSelectedLan(parseInt(defaultLanguageId))
                                // setContentFileId(contentFiles[defaultLanguageId].content_file_id);

                            } else {
                                setContentPath(contentFiles[props?.data?.default_language_id].file_path);
                                setSelectedLan(props?.data?.default_language_id)
                                // setContentFileId(contentFiles[props?.data?.default_language_id].content_file_id);

                            }
                        }
                        if (props.data.content_type_key == CONTENT_TYPE.DECK) {

                            setContentFileId(contentFiles[props.languageId][0].content_file_id);
                        }

                        setContentFiles(contentFiles);
                        setLinks(link);
                    }
                }
                // globalAlert("success", getResourceValue(this.state.resources, res.data.status.toString()));
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, res.data?.status.toString()));
                globalLoader(false);
            }


            globalLoader(false);
        } catch (error) {
            let errorObject = {
                methodName: "deckModal/setupContentFiles",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }


    const onChangeLanguage = (val) => {
        if (val) {
            setSelectedLan(val)
        }
    }
    const setData = async (slides, video) => {

        try {
            let arr = [];
            let fileData = [];
            let count = 0;
            for (let x of slides) {
                count++;
                if (x.localImageUrl) {
                    let fileOwn = await dataUrlToFile(x.localImageUrl, "Slide_" + count + ".png");
                    fileData.push({ view_order: count, is_locked: x.is_locked ? 1 : 0, content_file_id: x.content_file_id ? x.content_file_id : 0, file_name: "Slide_" + count + ".png" })
                    arr.push(fileOwn)
                }
                else {
                    let blob = await fetch(`${GLOBAL_API}/${x.file_path}`).then(r => r.blob());
                    fileData.push({ view_order: count, is_locked: x.is_locked ? 1 : 0, content_file_id: x.content_file_id ? x.content_file_id : 0, file_name: "Slide_" + count + ".png" })
                    let newFile = new File([blob], "Slide_" + count + ".png", { type: 'image/png' });
                    arr.push(newFile)
                }
            }

            let videoFile = new File([video], 'fileName.mp4', { type: 'video/mp4' });
            setSlides(arr);
            setFileInfo(fileData);
            setVideo(videoFile);

        } catch (error) {
            let errorObject = {
                methodName: "deckModal/setData",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    const uploadTimer = () => {
        try {
            uploadInterval = setInterval(() => {
                if (uploadStatus == 'success') {
                    clearInterval(uploadInterval);
                } else if (uploadStatus == CONSTANTS.ERROR) {
                    if (!navigator.onLine) {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "NET_CONNECTION_LOST"));
                    }
                }

            }, 5000);
        } catch (error) {
            let errorObject = {
                methodName: "deckModal/uploadTimer",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    };

    const sendFile = async (val, name) => {
        try {
            setNewName(name);
            if (val == TEACH_NOW_TYPES.EMAIL_TO_PATIENT) {
                let content = {
                    modified: true,
                    content_title: name,
                    content_id: props.data.content_id,
                    category_id: props.data.category_id,
                    content_type_key: CONTENT_TYPE.VIDEO,
                    clinician_content_id: props.data.clinician_content_id ? props.data.clinician_content_id : 0,
                    files_info: fileInfo,
                    modified_images: slides,
                    modified_video: new File([video], name + '.mp4'),
                    language_id: selectedLan,
                    languages: [selectedLan]
                }
                props.changeBasket(content);
                closeThisModal();
            }
            else {
                globalLoader(true);

                if (!uploadInterval) {
                    uploadTimer();
                }

                const formData = new FormData();
                formData.append('content_id', props?.data.content_id);
                formData.append('action_type', val);
                if (name) {
                    formData.append('content_title', name);
                }

                formData.append('files_info', JSON.stringify(fileInfo));
                slides.forEach(x => {
                    formData.append('modified_images', x)
                });
                let videoFile = new File([video], name + '.mp4');
                formData.append('modified_video', videoFile);
                formData.append('language_id', selectedLan);

                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/save-teached-content',
                    body: formData
                }

                let res = await CallApiAsync(obj);
                if (typeof res.data !== 'undefined') {
                    uploadStatus = "success";
                    let statusMessage = "";
                    if (val == TEACH_NOW_TYPES.SAVE_AS_DECK) {
                        statusMessage = "SAVE_DECK_MESSAGE";
                    } else if (val == TEACH_NOW_TYPES.SAVE_AS_VIDEO) {
                        statusMessage = "SAVE_VIDEO_MESSAGE";
                    } else if (val == TEACH_NOW_TYPES.SAVE_AS_BOTH) {
                        statusMessage = "SAVE_DECK_VIDEO_MESSAGE";
                    }
                    globalAlert('success', getResourceValue(props.resources, statusMessage));
                    props.onCloseModal();
                    await props.fetchContent();
                    globalLoader(false)
                    setSendTeachOpen(false);
                }
                else {
                    uploadStatus = CONSTANTS.ERROR;
                    if (!navigator.onLine) {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, 'NET_CONNECTION_LOST'));
                    }
                    globalLoader(false);
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "deckModal/sendFile",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    const closeDeleteRecordsModal = async (val) => {
        try {
            if (val) {
                globalLoader(true)
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/delete-saved-content',
                    body: {
                        clinician_content_id: props.data.clinician_content_id
                    }
                }

                let res = await CallApiAsync(obj);
                if (res?.data?.status === 200) {
                    setDeleteModal(false);
                    closeThisModal();
                    globalAlert('success', getResourceValue(props.resources, res?.data?.status.toString()));
                    await props.fetchContent();
                    globalLoader(false);
                }
                else {
                    globalLoader(false)

                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, res?.data?.status.toString()))
                }

            }
            else {
                setDeleteModal(false);
            }
        } catch (error) {
            let errorObject = {
                methodName: "_loggedInLayout/closeDeleteRecordsModal",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }


    const dataUrlToFile = async (dataUrl, fileName) => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], fileName, { type: 'image/png' });
    }

    const confirmModalFunc = (val) => {
        if (val) {
            // teach start
            teachStartTime(new Date());
            setTeachNowOpen(true)
        }
        setConfirmaModalOpen(false);
    }

    const setTeachNowOpenFunc = (val) => {
        if (val) {
            setTeachNowOpen(false)
        }
        else {
            setTeachNowOpen(false)
            props.onCloseModal()
        }
    }

    const closeThisModal = () => {
        props.onCloseModal()
    }

    const getSlides = () => {
        if (!props?.data?.languages) {
            return contentFiles?.length > 0 && contentFiles.map((deck, index) => (
                <div className="d-flex justify-content-center" key={index}>
                    <div className="inner-img-wrapper">
                        <img src={`${GLOBAL_API}/${deck?.file_path}`} />
                    </div>
                </div>
            ))
        } else {
            if (contentFiles[props.languageId]) {
                return contentFiles[props.languageId]?.length > 0 && contentFiles[props.languageId].map((deck, index) => (

                    <div className="d-flex justify-content-center" key={index}>
                        <div className="inner-img-wrapper">
                            <img src={`${GLOBAL_API}/${deck?.file_path}`} />
                        </div>
                    </div>

                ))

            } else {
                return contentFiles[props?.data?.default_language_id]?.length > 0 && contentFiles[props?.data?.default_language_id].map((deck, index) => (
                    <div key={index} className="d-flex justify-content-center" >
                        <div className="inner-img-wrapper">
                            <img src={`${GLOBAL_API}/${deck?.file_path}`} />
                        </div>
                    </div>
                ))
            }
        }
    }

    const getDeckName = () => {
        if (props?.data?.modified) {
            return props?.data?.content_title;
        } else {
            if (selectedLan) {
                return props?.data?.content_data[selectedLan].content_title;
            } else {
                if (props?.data?.content_data[props.languageId]) {
                    return props?.data?.content_data[props.languageId].content_title;
                } else {
                    return props?.data?.content_data[props?.data?.default_language_id].content_title;
                }
            }
        }
    }
    const renderLinksRow = (linkData, index) => {

        if (linkData.content_file_id == contentFileId) {
            return (
                <li key={index} className="d-flex cursor leftAttachColHd cpt-10 cpb-10 cpr-10 align-items-center" onClick={() => window.open(linkData.display_url, '_BLANK')} style={{ alignSelf: 'center' }}  >
                    <div>
                        <URLIcon width={"30px"} height={"30px"} />
                    </div>
                    <div>
                        <p className="RLink cpl-10 my-0">{linkData.display_text}</p>
                        {
                            linkData.last_opened &&
                            <p className="attchLastOpn cpl-10 mb-0">{getResourceValue(this.props.resources, 'LAST_OPENED')} {format(new Date(linkData.last_opened), "dd-MM-yyyy")}</p>
                        }
                    </div>
                </li>
            )
        }
    }
    const onSliderChange = (currentSlide) => {
        let contentFileId = 0;
        if (contentFiles[props.languageId][currentSlide]) {
            contentFileId = contentFiles[props.languageId][currentSlide].content_file_id;
        }
        setContentFileId(contentFileId);
    }


    let isAddedd = props.isAddedInBasket(props.data) >= 0 ? true : false;
    return (
        <>
            <Modal classNames={{ modal: `modal-full modal-own custom-modal-own modalll` }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={true} data-backdrop="false" styles={{ height: '100vh' }}>
                <div className="row d-flex justify-content-between pb-3 m-0" >
                    <div className="d-flex align-self-center" >
                        <p className="login-txt mb-0 primary-color">{getDeckName()}</p>
                    </div>
                    <div className="btn-wrapper">
                        <div className="btn-wrapper d-flex">
                            <button className="btn btn-own btn-own-grey mw-100" onClick={() => closeThisModal()}>
                                {getResourceValue(props.resources, 'CANCEL')}
                            </button>
                            {(props.contentFilterType == CONTENT_FILTER_TYPES.FOR_PATIENTS) &&
                                <>
                                    {props?.data?.content_type_key !== CONTENT_TYPE.VIDEO && props?.data?.content_type_key !== CONTENT_TYPE.FILE && props.menu == DashboardStatus.CLINICIANDASHBOARD && !props.showBasketView &&
                                        <div className=" ">
                                            <button className="btn btn-own btn-own-primary mw-100 ml-3" onClick={() => setConfirmaModalOpen(true)}>
                                                <i className="fa fa-pencil-square-o mr-2" aria-hidden="true"></i>
                                                {getResourceValue(props.resources, "TEACH_NOW")}
                                            </button>
                                        </div>}
                                    <div>
                                        <button className={`btn btn-own mw-100 ${isAddedd ? 'btn-own-grey' : 'btn-own-primary'} ml-3`} onClick={() => isAddedd ? props.removeBasketContent(props.data) : props.changeBasket(props.data)}>
                                            {!isAddedd && <i className="fa fa-plus mr-2" aria-hidden="true"></i>}
                                            {isAddedd ? getResourceValue(props.resources, 'REMOVE_FROM_BASKET') : getResourceValue(props.resources, 'ADD_TO_BASKET')}
                                        </button>

                                    </div>
                                    {props.data.clinician_content_id > 0 && !props.showBasketView && <div>
                                        <button className="btn btn-own btn-own-primary ml-3 mw-100" onClick={() => setDeleteModal(true)}>
                                            <i className="fa fa-trash-o mr-2" aria-hidden="true"></i>
                                            {getResourceValue(props.resources, 'DELETE')}
                                        </button>
                                    </div>}
                                </>}
                        </div>
                    </div>
                </div>
                <LinkDeck
                    contentFileId={contentFileId}
                    links={links}
                    contentFiles={contentFiles}
                    contentPath={contentPath}
                    selectedLan={selectedLan}
                    {...props} />
            </Modal>

            {confirmaModalOpen && <ConfirmationModal from={FromPage.TEACHNOW} resources={props.resources} open={confirmaModalOpen} description={getResourceValue(props.resources, "TEACH_NOW_DESCRIPTION")} onCloseModal={confirmModalFunc} languageList={props.languageList} languages={props.data?.languages} selectedLan={selectedLan} onChangeLanguage={onChangeLanguage} />}
            {teachNowOpen && <TeachNowModal deck_name={getDeckName()} resources={props.resources} setData={setData} data={props?.data} slides={contentFiles[selectedLan]} open={teachNowOpen} setSendTeachOpen={setSendTeachOpen} onCloseModal={setTeachNowOpenFunc} />}
            {sendTeachOpen && <SendTeachModal selectedLan={selectedLan} deck_name={getDeckName()} resources={props.resources} history={props.history} closeThisModal={closeThisModal} sendFile={sendFile} orgId={props.orgId} data={props?.data} video={video} name={newName} open={sendTeachOpen} onCloseModal={() => setSendTeachOpen(false)} />}
            {deleteModal && <DeleteModal resources={props.resources} open={deleteModal} title={getResourceValue(props.resources, "DELETE_MEDIA")} onCloseModal={closeDeleteRecordsModal} />}
        </>
    )
})

const mapStateToProps = state => ({
    orgId: state.user.orgId,
    userData: state.user.userData,
    startTime: state.common.startTime,
    endTime: state.common.endTime,
    languageList: state.common.languageList,
    showBasketView: state.common.showBasketView,
    languageId: state.common.languageId,
    contentViewType: state.common.contentViewType,
    contentFilterType: state.common.contentFilterType,
})
export default connect(mapStateToProps)(withRouter(DeckModal))