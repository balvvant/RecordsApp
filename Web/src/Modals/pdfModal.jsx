import React, { useState } from "react";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

const PdfModal = React.memo((props) => {
    const [fullScreen, setFullScreen]=useState(false);
    const closeIcon = (
        <button className="react-responsive-modal-closeButton" data-testid="close-button" style={{ width: 25, height: 15, position: 'relative', top: 0, right: -16 }}>
            <svg width="28" height="28" viewBox="0 0 36 36" data-testid="close-icon"><path d="M28.5 9.62L26.38 7.5 18 15.88 9.62 7.5 7.5 9.62 15.88 18 7.5 26.38l2.12 2.12L18 20.12l8.38 8.38 2.12-2.12L20.12 18z"></path></svg>
        </button>

    );

    const checkFullScreen =(val)=>{
        if(val){
            setFullScreen(true)
        }
        else{
            setFullScreen(false)
        }
    }

    return (
        <>
            <Modal classNames={{ modal: "modal-lg-full modal-own " }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={true} showCloseIcon={true} closeIcon={closeIcon}>

                <iframe src={props?.url} style={{
                    width: "calc(100% - 0px)", height: "700px"
                }}
                />
              {
                  !fullScreen&&
                  <button className="react-responsive-modal-closeButton" style={{ width: 15, height: 15, position: 'absolute', top: 50, right: 3 }} onClick={() => { props.onCheckFullScreen(true); checkFullScreen(true)}}>
                  <img src="/assets/img/maxi.png" alt="icon" />
                </button>
              }
              {
                  fullScreen&&
                  <button className="react-responsive-modal-closeButton" style={{ width: 15, height: 15, position: 'absolute', top: 50, right: 3 }} onClick={() => { props.onCheckFullScreen(false); checkFullScreen(false)}}>
                  <img src="/assets/img/minimize.png" alt="icon" />
                </button>
              }
                 
                 

            </Modal>

        </>
    )
}
)
export default PdfModal

