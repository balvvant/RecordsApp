import React, { useState } from 'react';
import { connect } from "react-redux";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { GLOBAL_API } from '../Constants/types';
import { getLanguageName, getResourceValue } from "../Functions/CommonFunctions";
import PdfModal from "./pdfModal";
const AttachmentViewModal = React.memo((props) => {
    const [pdfView, setPdfView] = useState(false);
    const [pdfurl, setPdfUrl] = useState('');
    const [fullScreen, setFullScreen]=useState(false);
    const openFile = (path) => {
        setPdfUrl(`${GLOBAL_API}/${path}`);
        setPdfView(true)
    }
    const onFullScreen =(val) =>{
        var all = document.getElementsByClassName('react-responsive-modal-overlay');
       
        if(val){
            setFullScreen(true);
            for (var i = 0; i < all.length; i++) {
                all[i].style.padding = '0px';
            }
        }
        else{
            setFullScreen(false);
            for (var i = 0; i < all.length; i++) {
                all[i].style.padding = '1.2rem';
            }
        }
    }
    return (
        <Modal classNames={{ modal: "modal-lg modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={true} closeOnOverlayClick={true} closeIcon={''}>
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
                                            <td className="cursor" onClick={() => openFile(file.file_path)}><img className="edit-icon" src="/assets/img/icons/preview.png" alt="edit-icon" /></td>

                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    {pdfView && <PdfModal open={pdfView} url={pdfurl} onCloseModal={() => setPdfView(false)} onCheckFullScreen={onFullScreen}/>}
                </div>
            </div>
        </Modal>

    )
})



const mapStateToProps = (state) => ({
    languageList: state.common.languageList
});

export default connect(mapStateToProps)(AttachmentViewModal);