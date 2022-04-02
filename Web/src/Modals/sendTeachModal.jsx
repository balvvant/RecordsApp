import format from 'date-fns/format';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { errorLogger, globalAlert } from '../actions/commonActions';
import { API_METHODS, CONSTANTS,TEACH_NOW_TYPES } from "../Constants/types";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';
import ConfirmationActionModal from '../Modals/ConfirmationActionModal';
import ConfirmationModal from '../Modals/confirmModal';

const SendTeachModal = React.memo((props) => {

    const [addToBasket, setAddToBasket] = useState(true);
    const [saveDeck, setSaveDeck] = useState(false);
    const [saveVideo, setsaveVideo] = useState(false);
    const [saveFunk, setSaveFunk] = useState(false)
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmationActionOpen, setConfirmActionOpen] = useState(false);
    const [isVideoAvailable, setIsVideoAvailable] = useState(false);

    // check-decks
    useEffect(() => {
        let formatOwn = format(new Date(), "yyyy-MM-dd");
        setName(`${props.deck_name}-${formatOwn}`)
    }, []);

    useEffect(() => {
        if (props?.video) {
            if (props?.video.size > 25000) {
                setIsVideoAvailable(true);
                setAddToBasket(true);
                setSaveDeck(false);
            } else {
                setSaveDeck(true);
                setAddToBasket(false);
                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "VIDEO_SHORT_MESSAGE"));
            }
        }

    }, [props?.video]);

    const addToBasketFunc = (ev) => {
        if (ev.target.checked) {
            setSaveFunk(false);
            setSaveDeck(false);
            setsaveVideo(false);
            setAddToBasket(true)
        }
        else {
            setAddToBasket(false)
        }

    }
    const saveFunc = (ev) => {
        if (ev.target.checked) {
            setSaveDeck(true)
            setsaveVideo(true)
            setSaveFunk(true)
            setAddToBasket(false)
        }
        else {
            setSaveFunk(false)
            setSaveDeck(false)
            setsaveVideo(false)
        }
    }

    const saveDeckFunc = (ev) => {
        if (ev.target.checked) {
            setSaveDeck(true)
            setSaveFunk(true)
            setAddToBasket(false)
        }
        else {
            setSaveDeck(false)
        }

    }
    const saveVideoFunc = (ev) => {
        if (ev.target.checked) {
            setsaveVideo(true)
            setSaveFunk(true)
            setAddToBasket(false)
        }
        else {
            setsaveVideo(false)
        }

    }

    const onSave = async () => {
        try {
            if (name) {
                let actionType = '';
                if (addToBasket) {
                    actionType = TEACH_NOW_TYPES.EMAIL_TO_PATIENT;
                }
                else if (saveDeck && saveVideo) {
                    actionType = TEACH_NOW_TYPES.SAVE_AS_BOTH;
                }
                else if (saveDeck) {
                    actionType = TEACH_NOW_TYPES.SAVE_AS_DECK;
                }
                else {
                    actionType = TEACH_NOW_TYPES.SAVE_AS_VIDEO;
                }

                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/check-content-title',
                    body: {
                        action_type: actionType,
                        content_title: name
                    }
                }

                const deckResult = await CallApiAsync(obj);

                if (deckResult?.data?.status == 200) {
                    if (addToBasket || saveDeck || saveVideo) {
                        if (navigator.onLine) {
                            if (addToBasket) {
                                // props.sendFile(TEACH_NOW_TYPES.EMAIL_TO_PATIENT, name)
                                setConfirmActionOpen(true)
                            }
                            else if (saveDeck && saveVideo) {
                                props.sendFile(TEACH_NOW_TYPES.SAVE_AS_BOTH, name)
                            }
                            else if (saveDeck) {
                                props.sendFile(TEACH_NOW_TYPES.SAVE_AS_DECK, name)
                            }
                            else {
                                props.sendFile(TEACH_NOW_TYPES.SAVE_AS_VIDEO, name)
                            }
                        }
                        else {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "NET_CONNECTION_LOST"));
                        }
                    }
                    else {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "NO_SELECT"));
                    }

                    setNameError('')
                } else if (deckResult?.data?.status == 204) {
                    setNameError(getResourceValue(props.resources, deckResult.data?.data?.errors?.deck_name))
                }
                else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, deckResult.message))
                }
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "FIELD_REQUIRED"));
            }
        } catch (error) {
            let errorObject = {
                methodName: "sendTeachModal/onSave",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }

    }

    const onConfirmCloseModalFunc = (val) => {
        if (val) {
            setConfirmModalOpen(false);
            props.onCloseModal();
            props.closeThisModal();

        }
        else {
            setConfirmModalOpen(false)
        }
    }

    const onCloseModalFunc = (val) => {
        setConfirmModalOpen(true)
    }
    const onConfirmationActionClose = (val) => {
        if (val) {
            setConfirmActionOpen(false)
            props.onCloseModal();
            props.closeThisModal()
        }
        else {
            setConfirmActionOpen(false)
        }
    }


    return (
        <>
            <Modal classNames={{ modal: "modal-md modal-own custom-modal-own" }} showCloseIcon={false} open={props.open} onClose={() => onCloseModalFunc()} center closeOnOverlayClick={true}>
                {props.data?.name &&
                    <div className="font-16 custom-header text-center pb-3">
                        {props.data?.name}
                    </div>
                }


                <div className="negative-width">
                    <div className=" ">
                        <div className="" style={!isVideoAvailable ? { opacity: 0.5 } : {}}>

                            {/* <div className="custom-checkbox-wrapper position-relative">
                                <input className="styled-checkbox" id="styled-checkbox-1" checked={addToBasket} type="checkbox" onChange={(ev) => isVideoAvailable ? addToBasketFunc(ev) : ev.preventDefault()} />
                                <label htmlFor="styled-checkbox-1">
                                    <h5>{getResourceValue(props.resources, "EMAIL_TO_PATIENT")}</h5>
                                    <span>{getResourceValue(props.resources, "SAVE_DESCRIPTION")}</span>
                                </label>

                            </div> */}
                            <div className="teach-deck-input cpb-10 cpl-10 cpr-10">
                                <label htmlFor="styled-checkbox-1">
                                    <h5> Content Title :</h5>
                                </label>
                                <input type="text" className="form-control" placeholder={getResourceValue(props.resources, "DECK_NAME")} value={name} onChange={(ev) => setName(ev.target.value)} />
                                <div className="error-wrapper">
                                    {nameError}
                                </div>
                            </div>
                        </div>
                        <div className="cpl-10" style={!isVideoAvailable ? { opacity: 0.5 } : {}}>

                            <div className="custom-checkbox-wrapper position-relative">
                                <input className="styled-checkbox" id="styled-checkbox-1" checked={addToBasket} type="checkbox" onChange={(ev) => isVideoAvailable ? addToBasketFunc(ev) : ev.preventDefault()} />
                                <label htmlFor="styled-checkbox-1">
                                    <h5> Add to basket</h5>
                                </label>
                            </div>
                        </div>

                        <div className="info-txt-wrapper font-600">
                            {getResourceValue(props.resources, "SAVE_MESSAGE")}
                        </div>
                        <div className="cpl-10">
                            <div className="custom-checkbox-wrapper position-relative">
                                <input className="styled-checkbox" checked={(!saveDeck && !saveVideo) ? false : saveFunk} id="styled-checkbox-2" type="checkbox" onChange={(ev) => saveFunc(ev)} />
                                <label htmlFor="styled-checkbox-2">
                                    <h5> Save</h5>
                                </label>
                            </div>

                            <ul className="list-unstyled save-list m-0 p-0">
                                <li>
                                    <div className="custom-checkbox-wrapper position-relative pt-0 checkboxx-wrapper">
                                        <input className="styled-checkboxx" checked={saveDeck} id="styled-checkbox-3" type="checkbox" onChange={(ev) => saveDeckFunc(ev)} />
                                        <label htmlFor="styled-checkbox-3">

                                            <h5>Save as deck</h5>

                                            <span>{getResourceValue(props.resources, "SAVE_DECK_DESCRIPTION")}</span>
                                        </label>
                                    </div>
                                </li>
                                <li>
                                    <div className="custom-checkbox-wrapper position-relative pt-0 checkboxx-wrapper" style={!isVideoAvailable ? { opacity: 0.5 } : {}}>
                                        <input className="styled-checkboxx" id="styled-checkbox-4" type="checkbox" checked={saveVideo} onChange={(ev) => isVideoAvailable ? saveVideoFunc(ev) : ev.preventDefault()} />
                                        <label htmlFor="styled-checkbox-4">
                                            <h5>Save as video</h5>
                                            <span>{getResourceValue(props.resources, "SAVE_VIDEO_DESCRIPTION")}</span>
                                        </label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="btn-wrapper col-12 row p-0 m-0 ">

                        <div className="col-12 col-md-6 ">
                            <button type="button" onClick={() => onCloseModalFunc()} className="btn btn-own btn-block btn-grey min-height-btn mw-100">{getResourceValue(props.resources, "CANCEL")}</button>
                        </div>

                        <div className="col-12 col-md-6 ">
                            <button className="btn btn-own btn-own-primary btn btn-own btn-block btn-own-primary min-height-btn mw-100" onClick={onSave} >
                                {getResourceValue(props.resources, "SUBMIT")}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {confirmModalOpen && <ConfirmationModal resources={props.resources} open={confirmModalOpen} description={getResourceValue(props.resources, "TEACH_NOW_CANCEL")} onCloseModal={onConfirmCloseModalFunc} />}

            {confirmationActionOpen && <ConfirmationActionModal resources={props.resources} open={confirmationActionOpen} onCloseModal={onConfirmationActionClose} name={name} sendFile={props.sendFile} />}

        </>

    )
})



export default SendTeachModal