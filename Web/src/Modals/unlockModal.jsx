import { TextField } from '@material-ui/core';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import {CONSTANTS, API_METHODS } from "../Constants/types";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';


const UnlockModal = React.memo((props) => {
    const [code, setCode] = useState('');
    const [emptyCode, setEmptyCode] = useState(false);

    const unlockCode = async (ev) => {
        ev.preventDefault();
        try {
            let value = true;
            if (code) {
                globalLoader(true)
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/unlock-content',
                    body: {
                        'unlockCode': code
                    }
                }

                value = await CallApiAsync(obj);
                if (value.data.status === STATUS_CODES.OK) {
                    globalAlert('success', getResourceValue(props.resources, value.data.status.toString()))
                    globalLoader(false)
                    props.onCloseModal(false)

                    props.fetchDecks();
                }
                else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, value.data.status.toString()))
                    globalLoader(false)
                }
            }
            else {
                setEmptyCode(true)
            }
        } catch (error) {
            let errorObject = {
                methodName: "teachNowModal/unlockCode",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    return (
        <Modal classNames={{ modal: "modal-md modal-own custom-modal-own" }} open={props.open} onClose={() => props.onCloseModal(false)} center showCloseIcon={false} closeOnOverlayClick={true}>
            <div className="font-16 custom-header text-center pb-3">
                {getResourceValue(props.resources, "HEADER")}

            </div>

            <div className="content-view-deck">
                <h3>{getResourceValue(props.resources, "QUESTION")}</h3>
                <p>{getResourceValue(props.resources, "ANSWER")}</p>
            </div>



            <form className="form-own unlock-form-wrapper" noValidate autoComplete="off" onSubmit={(ev) => unlockCode(ev)}>
                <p className="content-label">{getResourceValue(props.resources, "LABEL")}</p>

                <div className="form-group-icon form-group">
                    <TextField
                        type="text"
                        id="outlined-password-input"
                        label={getResourceValue(props.resources, "CODE")}
                        placeholder={getResourceValue(props.resources, "CODE")}
                        className='mt-0 mb-0 d-flex'
                        margin="normal"
                        variant="outlined"
                        name="code"
                        onChange={(ev) => setCode(ev.target.value)}
                        value={code}
                    />

                    <div className="error-wrapper">
                        {emptyCode && !code ? <span >{getResourceValue(props.resources, "FIELD_REQUIRED")}</span> : null}
                    </div>

                </div>
                <div className="pb-3 btn-wrapper upload-media-btn row px-2">
                    <div className="px-2 col-6">
                        <button type="button" onClick={() => props.onCloseModal(false)} className="btn btn-block btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100">{getResourceValue(props.resources, "CANCEL")}</button>
                    </div>
                    <div className="px-2 col-6">
                        <button type="submit" className="btn btn-block btn-own btn-own-primary min-height-btn min-width-btn-md mw-100">{getResourceValue(props.resources, "BUTTON")}</button>
                    </div>
                </div>
            </form>

        </Modal>

    )
})

const mapStateToProps = state => ({

    orgId: state.user.orgId,
})

export default connect(mapStateToProps)(withRouter(UnlockModal))