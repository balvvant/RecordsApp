import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { getResourceValue } from '../Functions/CommonFunctions';

const singlePatientModal = React.memo((props) => {
    const [patientUsers, setPatientUsers] = useState([]);

    useEffect(() => {
        let patients = [];
        for (let patient of props.patientUsers) {
            if (patient.email) {
                patients.push(patient);
            }
        }
        setPatientUsers(patients);
    }, [props.patientUsers]);

    return (
        <Modal classNames={{ modal: "modal-lg modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={true}>
            <div className="video-player-wrapper">
                <form className="form-own" onSubmit={(ev) => props.singleformSubmit(ev)}>
                    <div className="row d-flex justify-content-between   m-0  cpb-10" >
                        <div className="d-flex align-self-center" >
                            <p className="login-txt mb-0 primary-color">{getResourceValue(props.resources, "SINGLE_PATIENT")}:</p>
                        </div>
                        <div className="d-flex btn-wrapper">
                            <div className="cpr-10 ">
                                <button type="button" onClick={() => props.onCloseModal()} className="btn btn-own btn-block btn-grey min-height-btn mw-100">{getResourceValue(props.resources, "CANCEL")}</button>
                            </div>
                            <div className=" ">
                                <button type="submit" className="btn btn-own-primary  min-height-btn mw-100"> {getResourceValue(props.resources, "SELECT")}</button>
                            </div>
                        </div>
                    </div>
                    <div className="row d-flex justify-content-between   m-0 cpb-10  content-container" >
                        <div className=" col-md-12 align-self-center p-0" >
                            <div className="btn-wrapper col-md-5 cpl-10 cpr-10 cpt-10">
                                <Autocomplete
                                    id="combo-box-demo"
                                    freeSolo
                                    disableClearable
                                    options={patientUsers}
                                    getOptionLabel={(option) => props.getSearchLabel(option)}
                                    onChange={(event, option) => {
                                        props.setEmailId(option.email.trim());
                                        props.getNhsFunc(option.email.trim());
                                    }}
                                    inputValue={props.emailId}
                                    filterOptions={props.filterOptions}
                                    renderInput={(params) => <TextField
                                        {...params}
                                        label={getResourceValue(props.resources, "SEARCH_BY_EMAIL_NAME_NHS")}
                                        placeholder={getResourceValue(props.resources, "SEARCH_BY_EMAIL_NAME_NHS")}
                                        margin="normal"
                                        variant="outlined"
                                        name="emailId"
                                        onChange={(ev) => {
                                            props.fetchEmailChange(ev);
                                        }}
                                        fullWidth
                                        value={props.emailId}
                                        disabled={props.isSSOUserActive ? true : false}
                                        className={props.isSSOUserActive ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                    />}
                                />
                                <div className="error-wrapper">
                                    <span>{props.emailErrorMessage}</span>
                                </div>
                            </div>
                        </div>
                        {props.nhsActive &&
                            <>
                                <h4 className="font-16 font-600 col-12 cpl-10 cpr-10 cpt-10"> {getResourceValue(props.resources, "NHS_DETAILS")}</h4>

                                <div className={"col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10"}>
                                    <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                        <TextField
                                            type="text"
                                            label={getResourceValue(props.resources, "FIRSTNAME")}
                                            placeholder={getResourceValue(props.resources, "FIRSTNAME")}
                                            onChange={(ev) => props.setFirstName(ev.target.value)}
                                            margin="normal"
                                            variant="outlined"
                                            name="firstName"
                                            value={props.firstName}
                                            disabled={(props.isSSOUserActive || props.userFound) ? true : false}
                                            className={(props.isSSOUserActive || props.userFound) ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                        />
                                    </div>
                                    <div className="error-wrapper">
                                        <span>{props.firstNameError}</span>
                                    </div>
                                </div>

                                <div className={"col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10"}>
                                    <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                        <TextField
                                            type="text"
                                            label={getResourceValue(props.resources, "LASTNAME")}
                                            placeholder={getResourceValue(props.resources, "LASTNAME")}
                                            onChange={(ev) => props.setLastName(ev.target.value)}
                                            margin="normal"
                                            variant="outlined"
                                            name="lastName"
                                            value={props.lastName}
                                            disabled={(props.isSSOUserActive || props.userFound) ? true : false}
                                            className={(props.isSSOUserActive || props.userFound) ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                        />
                                    </div>
                                    <div className="error-wrapper">
                                        <span>{props.lastNameError}</span>
                                    </div>
                                </div>

                                <div className={"col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10"}>
                                    <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                        <TextField
                                            label={getResourceValue(props.resources, "NHS_NUMBER")}
                                            placeholder={getResourceValue(props.resources, "NHS_NUMBER")}
                                            margin="normal"
                                            variant="outlined"
                                            onChange={(ev) => props.nhsNumberFunc(ev.target.value)}
                                            value={props.nhsNumber}
                                            disabled={(props.isSSOUserActive || props.userFound) ? true : false}
                                            className={(props.isSSOUserActive || props.userFound) ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                        />
                                        <div className="error-wrapper">
                                            <span>{props.nhsErrorMessage}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 position-relative media-datepicker cpl-10 cpt-10 cpb-10 cpr-10">
                                    <div className="form-group-icon datepicker-form-group form-group" style={{ display: 'unset' }}>
                                        <div className={`own-custom-label ${props.valueInDate ? 'active' : ''}`} style={{ width: 140 }}>
                                            {getResourceValue(props.resources, "DATE_OF_BIRTH")}
                                        </div>
                                        <div onClick={() => props.setValueInDate(true)}>
                                            <DatePicker
                                                selected={props.dob && props.dob != "null" ? props.dob : null}
                                                onChange={(date) => props.setDob(date)}
                                                onClickOutside={props.datePickerValue}
                                                maxDate={new Date()}
                                                dateFormat='dd-MM-yyyy'
                                                scrollableYearDropdown={true}
                                                yearDropdownItemNumber={100}
                                                autoComplete='off'
                                                showYearDropdown
                                                popperPlacement="bottom"
                                                popperModifiers={{
                                                    flip: {
                                                        behavior: ["bottom"] // don't allow it to flip to be above
                                                    },
                                                    preventOverflow: {
                                                        enabled: false // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                                                    },
                                                    hide: {
                                                        enabled: false // turn off since needs preventOverflow to be enabled
                                                    }
                                                }}
                                                showMonthDropdown
                                                disabled={(props.isSSOUserActive || props.userFound) ? true : false}
                                                className={(props.isSSOUserActive || props.userFound) ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                                onChangeRaw={(ev) => ev.preventDefault()}
                                            />
                                        </div>
                                        <div className="error-wrapper">
                                            {props.emptyDob && !props.dob ? <span >{getResourceValue(props.resources, "FIELD_REQUIRED")}</span> : null}
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </form>
            </div>

        </Modal>

    )
})

const useStyles = makeStyles((theme) => ({
    selectRoot: {
        '&:focus': {
            backgroundColor: '#ffffff'
        }
    }
}));

export default singlePatientModal;
