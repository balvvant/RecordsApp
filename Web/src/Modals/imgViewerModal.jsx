import axios from 'axios';
import fileDownload from 'js-file-download';
import React from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { errorLogger, globalLoader } from '../actions/commonActions';

const saveImage = (props) => {
  try {
    globalLoader(true);
    axios.get(`${props.url}`, {
      responseType: 'blob',
    })
      .then((res) => {
        let fileName;
        fileName = props.url.split('/');
        fileName = fileName[fileName.length - 1];
        fileDownload(res.data, `${fileName}`);
        globalLoader(false);
      })
  } catch (error) {
    let errorObject = {
      methodName: "imgViewerModal/saveImage",
      errorStake: error.toString(),
      history: props.history
    };

    errorLogger(errorObject);
  }

}

const ImgViewerModal = React.memo((props) => {
  return (
    <>
      <Modal classNames={{ modal: "modal-lg modal-lg-full modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={true}>
        <div className="d-flex flex-wrap pb-3">
          <h3 className="font-20 primary-color pb-3 flex-1">{''}</h3>
          {props?.download && <span onClick={() => saveImage(props)} className="mx-3 video-download-wrapper pr-2"><i className="fa fa-arrow-circle-o-down cursor" aria-hidden="true"></i></span>}
        </div>
        <img style={{ width: "calc(100% - 30px)" }} src={props?.url} />
      </Modal>

    </>
  )
}
)
export default ImgViewerModal

