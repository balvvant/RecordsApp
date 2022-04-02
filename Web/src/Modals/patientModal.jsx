import { TextField } from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import {
    globalAlert
} from "../actions/commonActions";
import { CONSTANTS,BUTTON_TYPES } from "../Constants/types";
import EditPatient from '../Components/EditPatientComponent';
import { getResourceValue } from '../Functions/CommonFunctions';
import CustomTableComponent from "../Components/CustomTableComponent";

const PatientModal = React.memo((props) => {
    const [search, setSearch] = useState('');
    const [patientUsers, setPatientUsers] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [columnArray, setColumnArray] = useState([])
    const [currentUserId, setCurrentUserId] = useState(null);
    const [openEditUserModal, setOpenEditUserModal] = useState("");
    const [singlePatient, setSinglePatient] = useState({});
    const [selectedRecipients, setSelectedRecipients] = useState(false);
    const [tempPatient, setTempPatient] = useState([]);

    useEffect(() => {
        setPatientUsers(props.patientUsers);
        setAllChecked(props.allChecked);
    }, [props.patientUsers, props.allChecked]);

    useEffect(() => {
        let columnArraySuper = [
            {
                databaseColumn: 'first_name',
                columnName: getResourceValue(props.resources, 'PATIENT_NAME'),
                isSort: false,

            },
            {
                databaseColumn: 'email',
                columnName: getResourceValue(props.resources, 'EMAIL_ID'),
                isSort: false
            },
            {
                databaseColumn: 'nhs_number',
                columnName: getResourceValue(props.resources, 'NHS_NUMBER'),
                isSort: false,
                width:'15%'
            },
            {
                databaseColumn: 'date_of_birth',
                columnName: getResourceValue(props.resources, 'DATE_OF_BIRTH'),
                isSort: false,
                width:'15%'
            }
        ]
        setColumnArray(columnArraySuper)
    }, []);


    const handleSearching = (ev) => {
        setSearch(ev.target.value)
    }

    const searchFilter = (ev) => {
        ev.preventDefault();
        props.searchPatients(search);

    }

    const submitPatients = () => {

        let selectedPatients = patientUsers.filter(element => {
            return element.checked == true || element.changed == true;
        });

        if (selectedPatients.length > 0) {
            props.onCloseModal(null);
            onSelectPatientModal();
            props.selectedRecipent(true);
        } else {
            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "SELECT_PATIENT_ERROR"));
        }
        
    }
    const onSelectPatientModal = (val) => {

        let tempPatientUsers = [];
        patientUsers.length > 0 && patientUsers.map((item, index) => {
            if (item.checked) {
                tempPatientUsers.push(item)
            }
        })
        if (tempPatientUsers.length > 0) {
            setTempPatient(tempPatientUsers);
        }
    }

    const openEditUserModalFunc = (id) => {
        let data = props.patientUsers.find((val) => val.user_id == id);
        setSinglePatient(data)
        setCurrentUserId(id);
        setOpenEditUserModal(true)
    }

    const onCloseChangeModal = (val) => {
        setOpenEditUserModal(false)
        if (val) {
            setPatientUsers(props.patientUsers)
        }
    }
    const onUserSave = (val) => {
        setOpenEditUserModal(false);
        if (val) {
            setPatientUsers(val)
        }
    }
    return (
        <>
            <Modal showCloseIcon={false} classNames={{ modal: "modal-lg modal-own custom-modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={true}>
                <div className="video-player-wrapper">
                    <div className="content-container">
                        <CustomTableComponent
                            buttons={
                                !selectedRecipients ?
                                    [{
                                        text: `${getResourceValue(props.resources, "CANCEL")}`,
                                        onClick: () => props.onCloseModal(null),
                                        type: BUTTON_TYPES.SECONDARY
                                    },
                                    {
                                        text: `${"Select"}`,
                                        onClick: () => submitPatients(),
                                        type: BUTTON_TYPES.PRIMARY
                                    }] : [
                                        {
                                            text: `${getResourceValue(props.resources, "CANCEL")}`,
                                            onClick: () => props.onCloseModal(null),
                                            type: BUTTON_TYPES.SECONDARY
                                        },
                                        {
                                            text: `${getResourceValue(props.resources, "EDIT")}`,
                                            onClick: () => setSelectedRecipients(false),
                                            type: BUTTON_TYPES.PRIMARY
                                        },
                                        {
                                            text: `${getResourceValue(props.resources, "SELECT")}`,
                                            onClick: () => submitPatients(),
                                            type: BUTTON_TYPES.PRIMARY
                                        }
                                    ]}
                            allChecked={allChecked}
                            isCheckRequired={selectedRecipients ? false : true}
                            openEditUserModalFunc={openEditUserModalFunc}
                            columnArray={columnArray}
                            tableTitle={getResourceValue(props.resources, "PATIENTS")}
                            primaryKey={'user_id'}
                            showCheckbox={true}
                            showSearchBar={selectedRecipients ? false : true}
                            showTitle={true}
                            showFilter={false}
                            resources={props.resources}
                            dataArray={selectedRecipients ? tempPatient : patientUsers}
                            totalCount={patientUsers.length}
                            searchVal={search}
                            changeValue={handleSearching}
                            searchFilter={searchFilter}
                            checkedUsers={props.checkedUsers}
                        />
                    </div>

                    {selectedRecipients &&
                        <>
                            <div className=" col-md-12 col-12 p-0 cmt-10">
                                <p className=" font-14">
                                    {getResourceValue(props.resources, "DEFAULT_EMAIL_MESSAGE")}
                                </p>
                                <div className="own-textarea form-group">
                                    <TextField
                                        type="text"
                                        multiline
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="emailMsg"
                                        onChange={(ev) => props.setEmailMsg(ev.target.value)}
                                        value={props.emailMsg}
                                        rows={1}
                                    />
                                    <div className="error-wrapper">
                                        {props.emailMessageError}
                                    </div>
                                </div>
                            </div>

                        </>

                    }

                </div>
            </Modal>

            {openEditUserModal ?
                <Modal classNames={{ modal: "modal-lg modal-own" }} open={openEditUserModal} showCloseIcon={false}
                    onClose={onCloseChangeModal} center closeOnOverlayClick={false} closeIcon={''}>
                    <EditPatient
                        singlePatient={singlePatient}
                        resources={props.resources}
                        currentUserId={currentUserId}
                        closeModal={onCloseChangeModal}
                        currentAction="manageCliniciansPatient"
                        setpatientUsers={patientUsers}
                        saveUser={onUserSave}
                        infoDes={getResourceValue(props.resources, 'INFO_DESCRIPTION')} />
                </Modal> : null}
        </>

    )
})

export default withRouter(PatientModal);