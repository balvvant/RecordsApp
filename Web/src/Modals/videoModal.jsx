// var fileDownload = require('js-file-download');
import axios from 'axios';
import fileDownload from 'js-file-download';
import React, { Component } from "react";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { ControlBar, CurrentTimeDisplay, ForwardControl, PlaybackRateMenuButton, Player, ReplayControl, TimeDivider } from "video-react";
import "video-react/dist/video-react.css";
import { errorLogger, globalLoader } from '../actions/commonActions';
import { GLOBAL_API } from "../Constants/types";


class VideoModal extends Component {


  constructor(props, context) {
    super(props, context);

    this.state = {
      player: null
    };
  }

  saveVideo = () => {
    try {
      globalLoader(true);
      axios.get(`${GLOBAL_API}/${this.props.url}`, {
        responseType: 'blob',
      })
        .then((res) => {
          let fileExtension;
          fileExtension = this.props.url.split('.');
          fileExtension = fileExtension[fileExtension.length - 1];
          fileDownload(res.data, `${this.props.title}.${fileExtension}`);
          globalLoader(false);
        })
    } catch (error) {
      let errorObject = {
        methodName: "videoModal/saveVideo",
        errorStake: error.toString(),
        history:this.props.history
      };

      errorLogger(errorObject);
    }
  }
  render() {
    return (
      <Modal
        classNames={{ modal: "modal-lg modal-own" }}
        open={this.props.open}
        onClose={() => this.props.onCloseModal()}
        center
        closeOnOverlayClick={true}
        showCloseIcon={true}
      >
        <div className="video-player-wrapper px-3">
          {this.props.title && (
            <>
              <div className="d-flex flex-wrap ">
                <h3 className="font-20 primary-color pb-3 flex-1">{this.props.title}</h3>

                {this.props?.download && <span onClick={this.saveVideo} className="mx-3 video-download-wrapper"><i className="fa fa-arrow-circle-o-down cursor" aria-hidden="true"></i></span>}
              </div>
            </>
          )}
          {/* <ReactPlayer url={`${GLOBAL_API}/${this.props.url}`} controls={true} width={'100%'} height={'auto'} /> */}

          <Player
            ref={player => {
              this.player = player;
            }}
            playsInline
            // preload={true}
            onEnded={() => this.props?.onVideoEnd()}
            src={`${GLOBAL_API}/${this.props.url}`}
          >
            <source src={`${GLOBAL_API}/${this.props.url}`} />
            <ControlBar>
              <ReplayControl seconds={10} order={1.1} />
              <ForwardControl seconds={10} order={1.2} />
              <CurrentTimeDisplay order={4.1} />
              <TimeDivider order={4.2} />
              <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
            </ControlBar>
          </Player>
        </div>
      </Modal>
    );
  }
}

export default VideoModal;
