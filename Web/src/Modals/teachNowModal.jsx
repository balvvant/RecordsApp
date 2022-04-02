import Tooltip from '@material-ui/core/Tooltip';
import CloseIcon from '@material-ui/icons/Close';
import CanvasFreeDraw from "canvas-free-drawing";
import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { connect } from "react-redux";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { withRouter } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { Decoder, Reader, tools } from 'ts-ebml';
import { errorLogger, globalAlert, globalLoader, teachEndTime } from "../actions/commonActions";
import { GLOBAL_API,CONSTANTS, ImageFileTypes } from "../Constants/types";
import { getResourceValue } from "../Functions/CommonFunctions";
import ConfirmationModal from "../Modals/confirmModal";

var settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

let canvas;
let ctx;
let recordElement;
let canvas2d;
let context;
let status;
let recorder;
let audioTrack;
let audioPermission;

let isRecordingStarted = false;
let isStoppedRecording = false;
let colors = ["red", "blue", "yellow", "orange", "black", "white", "green"];
let txtXY;

const TeachNowModal = React.memo((props) => {
  const [localSlide, setLocalSlide] = useState([]);
  const [fetchInProgress, setFetchInProgress] = useState(true);
  const [cfd, setCFD] = useState(null);
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [openText, setOpenText] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [selectedColor, setSelectedColor] = useState("black");
  const [pausesRecording, setPausesRecording] = useState(false);
  const [muteAudio, setMuteAudio] = useState(true);
  const [setupRecording, setSetupRecording] = useState(true);
  const [colorPicker, setColorPicker] = useState(false);
  const [blankImg, setBlankImg] = useState(false);
  const [drwaingMode, setDrwaingMode] = useState(false);
  const [recordingOn, setRecordingOn] = useState(true);
  const [confirmaModalOpen, setConfirmaModalOpen] = useState(false);
  const [showMessage, sethowMessage] = useState(false);
  const [visitAllDeck, setVisitAllDeck] = useState(false);
  const [validMsg, setvalidMsg] = useState(false);
  const [penCheck, setPenCheck] = useState(false);
  const [mouseCounter, setMouseCounter] = useState(0);
  const [undoCounter, setUndoCounter] = useState(0);
  const [lastSlide, setLastSlide] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [deleteButtonText, setDeleteButtonText] = useState(false);
  const [handleSnackBar, setHandleSnackBar] = useState(false);

  const colorMenuRef = useRef(null);
  //closeColorMenu(colorMenuRef);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target)) {
        setColorPicker(false)
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorMenuRef]);
  useState(() => {
    setLocalSlide(props?.slides);
  }, [props?.slides]);

  useEffect(() => {
    const loadImage = (image, index) => {
      try {
        globalLoader(true);

        return new Promise((resolve, reject) => {
          const canvas = document.createElement("canvas");
          const imgLoad = new Image();
          const context = canvas.getContext("2d");
          let tempArray = [...localSlide];
          canvas.width = 800;
          canvas.height = 500;
          imgLoad.crossOrigin = "*";
          imgLoad.src = `${GLOBAL_API}/${image.file_path}`;
          imgLoad.onload = () => {
            context.drawImage(imgLoad, 0, 0, canvas.width, canvas.height);
            tempArray[index].localImageUrl = canvas.toDataURL();
            setLocalSlide(tempArray);
            resolve(image.file_path);
          };
          imgLoad.onerror = (err) => reject(err);

        });
      } catch (error) {
        let errorObject = {
          methodName: "teachNowModal/loadImage",
          errorStake: error.toString(),
          history: props.history
        };
        errorLogger(errorObject);
      }
    };

    try {
      Promise.all(localSlide.map((image, index) => loadImage(image, index)))
        .then(() => {
          if (setupRecording) {
            // globalAlert("success", getResourceValue(props.resources, "SLIDES_LOADED"));
          }
          globalLoader(false);
          // start();
        })
        .catch((err) => {
          // console.log("Error ", err);
          globalLoader(false);
        });
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/Promise",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {


      setCFD(
        new CanvasFreeDraw({
          elementId: "canvas",
          width: 700,
          height: 500,
          showWarnings: true,
          lineWidth: 2,
          disabled: true,
          // maxSnapshots: 0,
        })
      );

      makeImg(0);
      ddd();
    }, 0);
  }, []);

  useEffect(() => {
    if (blankImg) {
      setBlankImg(false);
      makeImg(index);
    }
  }, [localSlide.length]);

  useEffect(() => {
    if (isDrawing) {
      setTimeout(() => {
        penTool();
        const context = document.getElementById("canvas").getContext("2d");
        context.beginPath();
        context.moveTo(1, 1);
        context.lineTo(2, 2);
        context.lineWidth = 0.5;
        context.stroke();
        setMouseCounter(0);
        setUndoCounter(0);
      }, 5);
    }
  }, [index]);

  const handleClose = () => {
    setTimeout(() => {
      setHandleSnackBar(false);
    }, 5000)
  };

  const closeTooltip = () => {
    setHandleSnackBar(false);
  }

  const makeImg = (val) => {
    try {
      var a = [...localSlide];
      const img = new Image();
      if (localSlide[val].localImageUrl) {
        img.src = `${localSlide[val].localImageUrl}`;
      } else {
        img.src = `${GLOBAL_API}/${localSlide[val].file_path}`;
      }
      // img.src = '/assets/img/upload-img.png'
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        scaleToFill(img);
      };
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/makeImg",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const openBlankImg = () => {
    try {
      saveText();
      setBlankImg(true);
      var canvas = document.getElementById("canvas");
      let localArray = [...localSlide];
      let a = canvas.toDataURL();

      if (!blankImg) {
        localArray[index].localUrl = true;
        localArray[index].localImageUrl = a;
        makeImg(index + 1);
      }
      setLastSlide(false);
      setCFD(
        new CanvasFreeDraw({
          elementId: "canvas",
          width: 800,
          height: 500,
          showWarnings: true,
          lineWidth: 2,
          disabled: true,
          // maxSnapshots: 0,
        })
      );
      const img = new Image();
      img.src = `/assets/img/BlankSlide.jpg`;
      // img.src = '/assets/img/upload-img.png'
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        scaleToFill(img);
      };
      newSlideFill();
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/openBlankImg",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const newSlideFill = () => {
    try {
      const canvas = document.getElementById("canvas");
      let localArray = [...localSlide];
      const a = canvas.toDataURL();
      const obj = {
        localUrl: true,
        localImageUrl: a,
      };
      localArray.splice(index + 1, 0, obj);
      setLocalSlide(localArray);
      setIndex(index + 1);
      setSelectedColor("black");
      setInputVal("");
      setOpenText(false);
      cfd.disableDrawingMode();
      setDrwaingMode(false);
      setPenCheck(false);
      setMouseCounter(0);
      setIsDrawing(false);
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/newSlideFill",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const createImg = () => {
    try {
      if (index === localSlide.length - 2) {
        setHandleSnackBar(true);
        handleClose();
      }
      if (index === localSlide.length - 2 && !visitAllDeck) {
        setVisitAllDeck(true);
      }
      if (index + 1 <= localSlide.length - 1) {
        saveText()
        var canvas = document.getElementById("canvas");

        let localArray = [...localSlide];

        let a = canvas.toDataURL();

        let markColor = [0, 0, 0]
        if (selectedColor === "black") {
          markColor = [0, 0, 0];
        } else if (selectedColor === "red") {
          markColor = [255, 0, 0];
        } else if (selectedColor === "green") {
          markColor = [0, 255, 0];
        } else if (selectedColor === "blue") {
          markColor = [0, 0, 255];
        }

        setCFD(
          new CanvasFreeDraw({
            elementId: "canvas",
            width: 800,
            height: 500,
            showWarnings: true,
            lineWidth: 2,
            disabled: true,
            strokeColor: markColor
            // maxSnapshots: 0,
          })
        );

        if (blankImg) {
          let obj = {
            localUrl: true,
            localImageUrl: a,
          };
          localArray.splice(index + 1, 0, obj);
        } else {
          localArray[index].localUrl = true;
          localArray[index].localImageUrl = a;
          makeImg(index + 1);
        }

        //  setBlankImg(false)
        setLocalSlide(localArray);

        setIndex(index + 1);
        //setSelectedColor("black");
        setInputVal("");
        setOpenText(false);

        canvas.toBlob(function (blob) {
          var newImg = document.createElement("img"),
            url = URL.createObjectURL(blob);

          newImg.onload = function () {
            URL.revokeObjectURL(url);
          };

          newImg.src = url;
          // document.body.appendChild(newImg);
        });
      }
      cfd.disableDrawingMode();
      setDrwaingMode(false);
      setPenCheck(false);
      setMouseCounter(0);
      setUndoCounter(0);
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/createImg",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const prevImg = () => {
    try {
      if (index - 1 >= 0) {
        saveText()
        var canvas = document.getElementById("canvas");
        let localArray = [...localSlide];
        let a = canvas.toDataURL();

        let markColor = [0, 0, 0]
        if (selectedColor === "black") {
          markColor = [0, 0, 0];
        } else if (selectedColor === "red") {
          markColor = [255, 0, 0];
        } else if (selectedColor === "green") {
          markColor = [0, 255, 0];
        } else if (selectedColor === "blue") {
          markColor = [0, 0, 255];
        }

        setCFD(
          new CanvasFreeDraw({
            elementId: "canvas",
            width: 800,
            height: 500,
            showWarnings: true,
            lineWidth: 2,
            disabled: true,
            strokeColor: markColor
            // maxSnapshots: 0,
          })
        );

        if (blankImg) {
          let obj = {
            localUrl: true,
            localImageUrl: a,
          };
          localArray.splice(index + 1, 0, obj);
        } else {
          localArray[index].localUrl = true;
          localArray[index].localImageUrl = a;
          makeImg(index - 1);
        }

        setBlankImg(false);
        setLocalSlide(localArray);

        setIndex(index - 1);
        //setSelectedColor("black");
        setInputVal("");
        setOpenText(false);

        canvas.toBlob(function (blob) {
          var newImg = document.createElement("img"),
            url = URL.createObjectURL(blob);

          newImg.onload = function () {
            URL.revokeObjectURL(url);
          };

          newImg.src = url;
          // document.body.appendChild(newImg);
        });
      }
      cfd.disableDrawingMode();
      setDrwaingMode(false);
      setPenCheck(false);
      setMouseCounter(0);
      setUndoCounter(0);
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/prevImg",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const addImg = (e) => {
    try {
      if (e.target.files[0]) {
        let proceed = false;
        let fileType = e.target.files[0].type.split("/");
        if (ImageFileTypes.includes(fileType[1].toLowerCase())) {
          proceed = true;
        }
        else {
          globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "IMAGE_FILES_VALIDATION"));
        }

        if (proceed) {
          let canvas = document.getElementById("canvas");
          let localArray = [...localSlide];
          let a = canvas.toDataURL();
          if (!blankImg) {
            localArray[index].localUrl = true;
            localArray[index].localImageUrl = a;
            makeImg(index + 1);
          }
          setLastSlide(false);
          setCFD(
            new CanvasFreeDraw({
              elementId: "canvas",
              width: 800,
              height: 500,
              showWarnings: true,
              lineWidth: 2,
              disabled: true,
            })
          );

          let reader = new FileReader();
          let context = canvas.getContext("2d");
          reader.onload = (evt) => {
            let img = new Image();
            img.onload = () => {
              scaleToFill(img);
            };
            img.src = evt.target.result;
            img.crossOrigin = "Anonymous";
          };
          reader.readAsDataURL(e.target.files[0]);

          newSlideFill();
        }

      }
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/addImg",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const scaleToFill = (img) => {
    try {
      const canvas = document.getElementById("canvas");
      const context = document.getElementById("canvas").getContext("2d");
      img.crossOrigin = "Anonymous";
      var hRatio = canvas.width / img.width;
      var vRatio = canvas.height / img.height;
      var ratio = Math.min(hRatio, vRatio);
      var centerShift_x = (canvas.width - img.width * ratio) / 2;
      var centerShift_y = (canvas.height - img.height * ratio) / 2;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/scaleToFill",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const nextImg = () => {
    localSlide[index].file_path = cfd.save();
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    setIndex(index + 1);
  };

  const selectedColorFunc = (color) => {
    if (color === "black") {
      cfd.setDrawingColor([0, 0, 0]);
    } else if (color === "red") {
      cfd.setDrawingColor([255, 0, 0]);
    } else if (color === "green") {
      cfd.setDrawingColor([0, 255, 0]);
    } else if (color === "blue") {
      cfd.setDrawingColor([0, 0, 255]);
    }

    setColorPicker(false);
    setSelectedColor(color);
  };

  const newSlide = () => {
    if (index === 0) {
      localSlide.unshift(localSlide[0]);
      cfd.clear();
    } else if (index === localSlide.length - 1) {
      localSlide.splice(index, 0, localSlide[0]);
      cfd.clear();
    } else {
      localSlide.splice(index, 0, localSlide[0]);
      cfd.clear();
    }
  };

  const deleteSlide = () => {
    try {
      let tempArray = [...localSlide];
      if (tempArray.length === 1) {
        // openBlankImg();
        setLastSlide(true);
      } else {
        if (index === 0) {
          makeImg(index + 1);
          tempArray.shift();
          setLocalSlide(tempArray);
        } else if (index > 0 && index < tempArray.length - 1) {
          makeImg(index + 1);
          tempArray.splice(index, 1);
          setLocalSlide(tempArray);
        } else {
          makeImg(index - 1);
          setIndex(index - 1);
          tempArray.pop();
          setLocalSlide(tempArray);
        }
      }
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/deleteSlide",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };



  const pauseVideo = () => {
    setPausesRecording(true);
    setRecordingOn(false);
    recorder.pauseRecording();
  };
  const resumeVideo = () => {
    setPausesRecording(false);
    setRecordingOn(true);
    recorder.resumeRecording();
  };

  const ddd = () => {
    setTimeout(async () => {
      try {
        canvas = document?.querySelector("canvas");
        ctx = canvas?.getContext("2d");
        recordElement = document?.getElementById("recordElement");

        canvas2d = document.getElementById("background-canvas");
        context = canvas2d.getContext("2d");
        status = false;
        canvas2d.width = recordElement.clientWidth;
        canvas2d.height = recordElement.clientHeight;

        isRecordingStarted = false;
        isStoppedRecording = false;

        function draw() {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        setTimeout(() => {
          // draw();
        }, 1000);

        (function looper() {
          if (!isRecordingStarted) {
            return setTimeout(looper, 50);
          }
          window.html2canvas(recordElement).then(function (canvas) {
            context.clearRect(0, 0, canvas2d.width, canvas2d.height);
            context.drawImage(canvas, 0, 0, canvas2d.width, canvas2d.height);
            if (isStoppedRecording) {
              return;
            }
            requestAnimationFrame(looper);
          });
        })();

        let localRecorder = await navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((audioStream) => {

            // permission
            audioPermission = true;
            setupRecorder(audioPermission, audioStream);

          }).catch((error) => {
            setSetupRecording(false);
            if (`${error}`.includes('NotAllowedError')) {
              // globalAlert("danger", 'Please check your permissions or try in another browser.');
              // permission
              audioPermission = false;
              setupRecorder(audioPermission, null);
            } else if (`${error}`.includes('NotFoundError')) {
              globalAlert("danger", getResourceValue(props.resources, "AUDIO_MESSAGE"));

              audioPermission = false;
              setupRecorder(audioPermission, null);
            } else {
              globalAlert("danger", `${error}`);
              props.onCloseModal(true);
            }
            globalLoader(false);
          });
      } catch (error) {
        let errorObject = {
          methodName: "teachNowModal/ddd",
          errorStake: error.toString(),
          history: props.history
        };

        errorLogger(errorObject);
      }
    }, 300);
  };

  const setupRecorder = (audio, audioStream) => {
    let track;
    let finalTrack = new MediaStream();
    let canvasStream = canvas2d.captureStream();
    // audioStream.active = false;

    if (audio) {
      track = audioStream.getAudioTracks();
      if (track.length) {
        audioTrack = track[0];
      }

      window.RecordRTC.getTracks(audioStream, "audio").forEach((track) => {
        finalTrack.addTrack(track);
      });
    }


    window.RecordRTC.getTracks(canvasStream, "video").forEach((track) => {
      finalTrack.addTrack(track);
    });

    let response = recorder = window.RecordRTC(finalTrack, {
      type: "video",
      mimeType: "video/mp4",
    });
    if (localSlide && localSlide.length) {
      start();
    }
  }


  const start = () => {
    // this.disabled = true;
    isStoppedRecording = false;
    isRecordingStarted = true;

    let response = recorder.startRecording();
    setStarted(true);
  };

  const readAsArrayBuffer = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onloadend = () => { resolve(reader.result); };
      reader.onerror = (ev) => { reject(ev.error); };
    });
  }

  const injectMetadata = blob => {
    const decoder = new Decoder();
    const reader = new Reader();
    reader.logging = false;
    reader.drop_default_duration = false;

    return readAsArrayBuffer(blob)
      .then(buffer => {
        const elms = decoder.decode(buffer);
        elms.forEach((elm) => { reader.read(elm); });
        reader.stop();

        const refinedMetadataBuf =
          tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues);
        const body = buffer.slice(reader.metadataSize);

        return new Blob([refinedMetadataBuf, body], { type: blob.type });
      });
  }


  const stop = () => {
    try {
      // this.disabled = true;
      recorder.stopRecording(function () {
        isRecordingStarted = false;
        isStoppedRecording = true;
        setStarted(false);
        const blob = recorder.getBlob();

        // document.getElementById("preview-video").src = URL.createObjectURL(blob);

        var canvas = document.getElementById("canvas");
        let localArray = [...localSlide];
        let a = canvas.toDataURL();

        localArray[index].localUrl = true;
        localArray[index].localImageUrl = a;
        injectMetadata(blob)
          .then(seekableBlob => {
            props.setData(localArray, seekableBlob);
          })



        openConfirmModalFunc(false);
        props.setSendTeachOpen(true);
        props.onCloseModal(true);
        teachEndTime(new Date())
      });
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/stop",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const handleStart = (e, data) => {
    // console.log('Event: ', e);
    // console.log('Data: ', data);
  };
  const handleDrag = (e, data) => {
    // console.log('Event: ', e);
    // console.log('Data: ', data);
  };
  const handleStop = (e, data) => {
    txtXY = data;
  };

  const handleVoice = () => {

    if (audioPermission) {
      if (muteAudio) {
        audioTrack.enabled = false;
        setMuteAudio(false);
      } else {
        audioTrack.enabled = true;
        setMuteAudio(true);
      }
    } else {
      globalAlert("danger", getResourceValue(props.resources, "MICROPHONE_PERMISSION"))
    }
  }

  const saveText = () => {
    try {
      let canvas = document.getElementById("canvas");
      let ctx = canvas.getContext("2d");

      ctx.font = "18px Arial";
      ctx.fillStyle = "#000";
      if (txtXY) {
        ctx.fillText(inputVal, txtXY.x, txtXY.y + 15);
      } else {
        ctx.fillText(inputVal, 10, 50);
      }
      setOpenText(false);
      setDeleteButtonText(false)
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/saveText",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const saveTextData = () => {
    if (inputVal) {
      setDeleteButtonText(true);
    }
    setOpenText(false);
  }

  const penTool = () => {
    try {
      if (!drwaingMode) {
        cfd.enableDrawingMode();
        setDrwaingMode(true);
        setIsDrawing(true);
      } else {
        cfd.disableDrawingMode();
        setIsDrawing(false);
        setDrwaingMode(false);
      }
      if (!penCheck) {
        const node = document.getElementById("canvas");
        const clickEvents = document.createEvent("MouseEvents");
        clickEvents.initEvent("mousedown", true, true);
        node.dispatchEvent(clickEvents);
        clickEvents.initEvent("mouseup", true, true);
        node.dispatchEvent(clickEvents);
        setPenCheck(true);
      }
    } catch (error) {
      let errorObject = {
        methodName: "teachNowModal/penTool",
        errorStake: error.toString(),
        history: props.history
      };

      errorLogger(errorObject);
    }
  };

  const confirmModalFunc = (val) => {
    if (val && !validMsg) {
      props.onCloseModal();
    } else if (val && validMsg) {
      saveText()
      stop();
    } else {
      recorder.pauseRecording();
    }
    setvalidMsg(false);
    setConfirmaModalOpen(false);
  };

  const openConfirmModalFunc = (val = null) => {
    if (val) {
      if (recorder) {
        recorder.pauseRecording();
      }

      setConfirmaModalOpen(true);
    } else {
      if (localSlide.length > 1) {
        if (!visitAllDeck) {
          if (recorder) {
            recorder.pauseRecording();
          }
          setvalidMsg(true);
          setConfirmaModalOpen(true);
        } else {
          saveText()
          stop();
        }
      }
      else {
        saveText()
        stop();
      }
    }
  };

  const btnRedo = () => {
    if (mouseCounter !== undoCounter) {
      setUndoCounter(undoCounter + 1);
      cfd.redo();
    }
  };

  const btnUndo = () => {
    if (undoCounter > 0) {
      setUndoCounter(undoCounter - 1);
      cfd.undo();
    }
  };

  const handleCanvasMouseEvent = (e) => {
    if (e.type === "mouseup" && drwaingMode === true) {
      setMouseCounter(undoCounter + 1);
      setUndoCounter(undoCounter + 1);
    }
  };
  return (
    <>
      <Modal
        showCloseIcon={false}
        classNames={{ modal: "modal-full modal-own custom-modal-own   modalll" }}
        open={props.open}
        onClose={() => openConfirmModalFunc(true)}
        center
        closeOnOverlayClick={true}
      >
        <div className="content-container teachNowContainer" >
          <div className="deck-slider-wrapper">
            <div className="row p-0 m-0 teachNowContainerRow">
              <div style={{ borderRight: '1px solid #dadada' }} className="col-md-3 col-12 p-0 attchLeftScrl">
                <div className="row d-flex justify-content-between m-0 cpr-10 cpl-10" >
                  <div className="d-flex align-self-center" >
                    <p className="login-txt mb-0 primary-color">  {props.deck_name}</p>
                  </div>
                  <div className={`circle red ${recordingOn ? "animation" : ""}`}></div>
                </div>
              </div>
              <div className="col-md-9 col-12 p-0 m-0 attchRightScrl">
                <div id="recordElement">
                  <div className="control-wrapper">
                    <ul className="list-unstyled d-flex justify-content-around m-0">
                      <li onClick={() => openConfirmModalFunc(true)}>
                        {" "}
                        <i className="fa fa-times" aria-hidden="true" />
                      </li>
                      <li onClick={openBlankImg}>
                        <i className="fa fa-plus-square-o" aria-hidden="true" />
                      </li>

                      <li>
                        <input
                          id="inputFile"
                          type="file"
                          onChange={addImg}
                          style={{ display: "none" }}
                          accept=".png, .jpg, .jpeg"
                          title=""
                        />

                        <i
                          className="fa fa-picture-o"
                          aria-hidden="true"
                          onClick={() => document.querySelector("#inputFile").click()}
                        />
                      </li>


                      <li
                        onClick={() => {
                          undoCounter > 0 ? btnUndo() : console.log("Nothing to undo");
                        }}
                        className={`${undoCounter > 0 ? "drawing-mode" : "drawing-mode-disabled"
                          }`}
                      >
                        {" "}
                        <i className="fa fa-reply" aria-hidden="true" />
                      </li>

                      <li
                        onClick={() => {
                          mouseCounter === undoCounter
                            ? console.log("")
                            : btnRedo();
                        }}
                        className={`${mouseCounter === undoCounter
                          ? "drawing-mode-disabled"
                          : "drawing-mode"
                          }`}
                      >
                        {" "}
                        <i className="fa fa-share" aria-hidden="true" />
                      </li>
                      <li>
                        {muteAudio && audioPermission ? (
                          <i
                            onClick={handleVoice}
                            className="fa fa-microphone"
                            aria-hidden="true"
                          />
                        ) : (
                          <i
                            onClick={handleVoice}
                            className="fa fa-microphone-slash"
                            aria-hidden="true"
                          />
                        )}
                      </li>

                      <li>
                        {pausesRecording ? (
                          <i
                            onClick={resumeVideo}
                            className="fa fa-play"
                            aria-hidden="true"
                          />
                        ) : (
                          <i
                            onClick={pauseVideo}
                            className="fa fa-pause-circle-o"
                            aria-hidden="true"
                          />
                        )}
                      </li>

                      <li onClick={() => {
                        setOpenText(true);
                        setDeleteButtonText(false)
                      }}>
                        <i className="fa fa-text-width" aria-hidden="true" />
                      </li>
                      <li
                        className={`${drwaingMode ? "drawing-mode" : "drawing-mode-disabled"
                          }`}
                        onClick={() => penTool()}
                      >
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                      </li>
                      <li className="color-picker align-items-center">
                        <span
                          onClick={() => setColorPicker(true)}
                          className={`color ${selectedColor}`}
                        ></span>
                        {colorPicker && (
                          <ul className="list-color-wrapper list-unstyled" ref={colorMenuRef}>
                            <li onClick={() => selectedColorFunc("red")}>
                              <span className="color red"></span>
                            </li>
                            <li onClick={() => selectedColorFunc("green")}>
                              <span className="color green"></span>
                            </li>
                            <li onClick={() => selectedColorFunc("blue")}>
                              <span className="color blue"></span>
                            </li>
                            <li onClick={() => selectedColorFunc("black")}>
                              <span className="color black"></span>
                            </li>
                          </ul>
                        )}
                      </li>
                      <li
                        className={`${lastSlide ||
                          (localSlide.length > 1
                            ? localSlide[index].is_locked === 1
                            : "drawing-mode-disabled")
                          ? "drawing-mode-disabled"
                          : "drawing-mode"
                          }`}
                      >
                        <i
                          className="fa fa-trash"
                          aria-hidden="true"
                          onClick={() => {
                            lastSlide ||
                              (localSlide.length > 0
                                ? localSlide[index].is_locked === 1
                                : null)
                              ? console.log("All slides deleted")
                              : deleteSlide();
                          }}
                        ></i>
                      </li>
                      <li>
                        <Tooltip
                          placement="left"
                          arrow
                          interactive
                          PopperProps={{
                            disablePortal: true,
                          }}
                          onClose={handleClose}
                          open={handleSnackBar}
                          disableFocusListener
                          disableTouchListener
                          title={
                            <React.Fragment>
                              <CloseIcon style={{ cursor: "pointer" }} onClick={closeTooltip} fontSize="small" />
                              <span>{getResourceValue(props.resources, "LAST_SLIDE_REACHED")}</span>
                            </React.Fragment>
                          }
                        >
                          <i onClick={() => { openConfirmModalFunc(false) }} className="fa fa-floppy-o" aria-hidden="true" />
                        </Tooltip>
                      </li>
                    </ul>
                  </div>
                  {localSlide && localSlide.length && (
                    <div id="recordElement" className="flex-1 teachNowCon">
                      <div className="d-flex flex-wrap justify-content-center">
                        <div className="d-flex">
                          <ul className="list-unstyled align-self-center">
                            <li
                              id="btnPrevious"
                              onClick={prevImg}
                              className={`prev-slider-wrapper ${index <= 0 ? "disabled" : ""
                                }`}
                              style={{ cursor: 'pointer', fontSize: 30 }}
                            >
                              <i class="fa fa-chevron-left font-20 cml-10 cmr-10" aria-hidden="true"></i>
                            </li>
                          </ul>
                        </div>
                        <div className=" position-relative d-inline-block m-0">
                          {openText && (
                            <Draggable
                              bounds={"parent"}
                              onStart={handleStart}
                              onDrag={handleDrag}
                              onStop={handleStop}
                            >
                              <div className="drag-input-wrapper d-inline-block">
                                <input
                                  val={inputVal}
                                  onChange={(ev) => setInputVal(ev.target.value)}
                                  placeholder={getResourceValue(props.resources, "ENTER_TEXT")}
                                />
                                <div className="btn-wrapper pt-1 text-center">
                                  <button
                                    className="mx-1 btn mw-100"
                                    onClick={() => {
                                      setInputVal("");
                                      setOpenText(false);
                                    }}
                                  >
                                    {getResourceValue(props.resources, "CANCEL")}
                                  </button>

                                  <button
                                    className="btn btn-own-primary mx-1 mw-100"
                                    disabled={!inputVal}
                                    onClick={() => saveTextData()}
                                  >
                                    {getResourceValue(props.resources, "SAVE")}
                                  </button>
                                </div>

                              </div>
                            </Draggable>
                          )}

                          {deleteButtonText && <div className="input-txt-wrapper" style={{ top: txtXY?.y + 10, left: txtXY.x + 15 }}>{inputVal}  <span className="cross-wrapper"><i className="fa fa-times" aria-hidden="true" onClick={() => {
                            setInputVal("");
                            setDeleteButtonText(false)
                          }} /></span></div>}


                          <canvas
                            style={{ height: '80vh', width: '100%' }}
                            id="canvas"
                            onMouseUp={handleCanvasMouseEvent}
                          />
                        </div>
                        <div className="d-flex">
                          <ul className="list-unstyled align-self-center">
                            <li
                              id="btnNext"
                              className={`prev-slider-wrapper ${index >= localSlide.length - 1 ? "disabled" : ""
                                }`}
                              onClick={createImg}
                              style={{ cursor: 'pointer', fontSize: 30 }}
                            >
                              <i class="fa fa-chevron-right font-20 cml-10 cmr-10" aria-hidden="true"></i>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <canvas
                  id="background-canvas"
                  style={{
                    position: "absolute",
                    top: "-99px",
                    left: "-99px",
                    visibility: "hidden",
                    zIndex: "-33",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {confirmaModalOpen && (
        <ConfirmationModal
          resources={props.resources}
          open={confirmaModalOpen}
          description={
            validMsg
              ? getResourceValue(props.resources, "SAVE_TEACH_NOW_MESSAGE")
              : getResourceValue(props.resources, "CANCEL_MESSAGE")
          }
          onCloseModal={confirmModalFunc}
        />

      )}

    </>
  );
});

const mapStateToProps = (state) => ({
  orgId: state.user.orgId,
  userData: state.user.userData,
});

export default connect(mapStateToProps)(withRouter(TeachNowModal));
