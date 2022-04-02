import React from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { getResourceValue } from "../Functions/CommonFunctions";


const DeleteModal = React.memo((props) => {


    return (
        <Modal classNames={{ modal: "modal-md modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={true}>
            <div className="video-player-wrapper">
                {props.title && <h3 className="font-20 primary-color pb-3">
                    {props.title}
                </h3>}

                <p className="py-3">{getResourceValue(props.resources, 'DELETE_CONFIRM')}</p>
                {/* <div className="border-bottom-own pt-2 mb-3"></div> */}
                <div className="btn-wrapper">
                    <button type="button" onClick={() => props.onCloseModal(null)} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100">{getResourceValue(props.resources, 'CANCEL')}</button>
                    <button type="submit" onClick={() => props.onCloseModal(true)} className="btn full-width-xs btn-own btn-own-primary min-height-btn min-width-btn-md mw-100">{getResourceValue(props.resources, 'DELETE')}</button>
                </div>
            </div>
        </Modal>

    )
})



export default DeleteModal