import React, { useState } from 'react';
import { connect } from "react-redux";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { getLanguageName, getResourceValue } from "../Functions/CommonFunctions";
import VideoModal from "./videoModal";
const VideoViewModal = React.memo((props) => {
    const [openVideoModal, setOpenVideoModal] = useState(false);
    const [videoName, setVideoName] = useState("");
    const [videoPath, setVideoPath] = useState("");
    const openFile = (video_name, video_path) => {
        // props?.openVideoFiles(video_name, video_path);
        setVideoName(video_name);
        setVideoPath(video_path);
        setOpenVideoModal(true);
    }

    const closeModal = () => {
        setOpenVideoModal(false)
    }

    return (
        <Modal classNames={{ modal: "modal-lg modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={true} showCloseIcon={false} closeIcon={''}>
            <div className="deck-view-wrapper px-4 py-4">
                <div className="col-12 px-0 attchment-viewer pt-3">
                    <div className="table-responsive own-table own-table-styled">
                        <table className="table mb-0">
                            <thead>
                                <tr>
                                    <th>{getResourceValue(props.resources, "FILENAME")}</th>
                                    <th style={{ width: '150px' }}>{getResourceValue(props.resources, "Languages")}</th>
                                    <th style={{ width: '100px' }}>{getResourceValue(props.resources, "OPEN")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    props.data.content_files && props.data.content_files.length > 0 && props.data.content_files.map((file) => {
                                        return <tr key={file.language_id}>
                                            <td>
                                                {file.name}
                                            </td>
                                            <td style={{ width: '100px' }}>
                                                {getLanguageName(file.language_id, props.languageList)}
                                            </td>
                                            <td className="cursor" onClick={() => openFile(file.name, file.file_path)}><img className="edit-icon" src="/assets/img/icons/preview.png" alt="edit-icon" /></td>

                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    {openVideoModal &&
                        <VideoModal
                            open={openVideoModal}
                            onCloseModal={closeModal}
                            url={videoPath}
                            onVideoEnd={() => { }}
                            title={videoName}
                        />
                    }
                </div>
            </div>
        </Modal>

    )
})



const mapStateToProps = (state) => ({
    languageList: state.common.languageList
});

export default connect(mapStateToProps)(VideoViewModal);

// export default DeckViewModal