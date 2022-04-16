import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, resourceFields, STATUS_CODES, RESOURCE_KEYS } from '../Constants/types';
import { CallApiAsync, getResourceValue, ValidateField } from '../Functions/CommonFunctions';

const AddEditSupportTicketModal = React.memo((props) => {
    let [MessageHeader, setMessageHeader] = useState('');
    let [MessageHeaderErrorMessage, setMessageHeaderErrorMessage] = useState('');
    let [MessageBody, setMessageBody] = useState('');
    let [MessageBodyErrorMessage, setMessageBodyErrorMessage] = useState('');
    let [MessageResponse, setMessageResponse] = useState('');
    let [MessageResponseErrorMessage, setMessageResponseErrorMessage] = useState('');

    useEffect(() => {
        if (props.ticketID) {
            FetchTicketAsync(props.ticketID);
        }
    }, []);

    const FetchTicketAsync = async (id) => {
        try {
            globalLoader(true);
            let obj = {
                method: API_METHODS.POST,
                history: props.history,
                api: '/get-my-support-ticket',
                body: { ticketID: id }
            }
            let ticketResult = await CallApiAsync(obj);
            if (ticketResult) {
                if (ticketResult.data.status === STATUS_CODES.OK) {
                    setMessageHeader(ticketResult.data.data.UserTicket.MessageHeader);
                    setMessageBody(ticketResult.data.data.UserTicket.MessageBody);
                    setMessageResponse(ticketResult.data.data.UserTicket.MessageResponse);
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, ticketResult.data.status.toString()));
                }
            }
            globalLoader(false);
        } catch (error) {
            let errorObject = {
                methodName: "AddEditSupportTicket/FetchTicketAsync",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const SaveData = async (ev) => {
        ev.preventDefault();
        try {
            let formValidate = await FormValidateAsync();
            if (formValidate) {
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: props.ticketID ? '/create-support-ticket' : '/update-support-ticket',
                    body: {
                        records: JSON.stringify([{
                            ticketID: props.ticketID ? props.ticketID : 0,
                            MESSAGE_HEADER: MessageHeader,
                            MESSAGE_BODY: MessageBody,
                            MESSAGE_RESPONSE: MessageResponse,
                        }])
                    }
                }
                let ticketResult = await CallApiAsync(obj);
                if (ticketResult.data.status === STATUS_CODES.OK) {
                    props.onCloseModal(CONSTANTS.SUCCESS)
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, ticketResult.data.status.toString()))
                }
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "AddEditSupportTicket/saveData",
                errorStake: error.toString(),
                history: props.history
            };
            errorLogger(errorObject);
        }
    }

    const FormValidateAsync = async () => {
        let formValid = true;
        if(props.ticketID){
            let messageHeader = ValidateField(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_HEADER, MessageHeader);
            if (messageHeader.error) {
                formValid = false;
                setMessageHeaderErrorMessage(messageHeader.message)
            } else {
                setMessageHeaderErrorMessage('');
            }
            let messageBody = ValidateField(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_BODY, MessageBody);
            if (messageBody.error) {
                formValid = false;
                setMessageBodyErrorMessage(messageBody.message);
            } else {
                setMessageBodyErrorMessage('');
            }
        } else {
            let messageResponse = ValidateField(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_RESPONSE, MessageResponse);
            if (messageResponse.error) {
                formValid = false;
                setMessageResponseErrorMessage(messageResponse.message);
            } else {
                setMessageResponseErrorMessage('');
            }
        }
        return formValid
    }

    return (
        <Modal classNames={{ modal: "modal-lg modal-own" }} open={true} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
            <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => ev.preventDefault()}>
                <p className="login-txt  primary-color mb-0 cpb-10">{props.data?.ticketID ? getResourceValue(props.resources, RESOURCE_KEYS.COMMON.EDIT) : getResourceValue(props.resources, RESOURCE_KEYS.COMMON.ADD)} {getResourceValue(props.resources, RESOURCE_KEYS.SUPPORTTICKET.HEADER_ADD_TICKET)}</p>
                <div className="form-own add-list-form flex-wrap row m-0 p-0" >
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_HEADER)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_HEADER, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setMessageHeader(ev.target.value)}
                                value={MessageHeader}
                                disabled ={!props.ticketID}
                            />
                            <div className="error-wrapper">
                                <span>{MessageHeaderErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_BODY)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_BODY, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setMessageBody(ev.target.value)}
                                value={MessageBody}
                                disabled ={!props.ticketID}
                            />
                            <div className="error-wrapper">
                                <span>{MessageBodyErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 cpt-10 cpb-10 pl-0" >
                        <div>
                            <TextField
                                id="outlined-textarea"
                                label={getResourceValue(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_RESPONSE)}
                                placeholder={getResourceValue(props.resources, RESOURCE_KEYS.SUPPORTTICKET.MESSAGE_RESPONSE, resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                onChange={(ev) => setMessageResponse(ev.target.value)}
                                value={MessageResponse}
                                disabled= {!ticketResult.data.data.EnableResponse}
                            />
                            <div className="error-wrapper">
                                <span>{MessageResponseErrorMessage}</span>
                            </div>
                        </div>
                    </div>
                    <div className="btn-wrapper cpt-10">
                        <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.CANCEL)}</button>
                        <button type="button" onClick={SaveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, RESOURCE_KEYS.COMMON.SAVE)}</button>
                    </div>
                </div>
            </form>
        </Modal>
    )
})

export default AddEditSupportTicketModal;