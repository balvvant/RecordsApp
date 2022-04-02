import { Checkbox, FormControl, FormControlLabel, FormGroup, InputAdornment, OutlinedInput, TextField } from '@material-ui/core';
import { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { changeBasketView, changeContentBasket, errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONTENT_FILTER_TYPES, CONTENT_TYPE, CONTENT_VIEW_TYPES, ImageFileTypes, resourceFields,CONSTANTS, RESOURCE_KEYS } from '../Constants/types';
import { CallApiAsync, formatNHSNumber, getResourceValue, validEmail } from '../Functions/CommonFunctions';
import ConfirmationModal from '../Modals/confirmModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import PatientModal from '../Modals/patientModal';
import SinglePatientModal from '../Modals/singlePatientModal';

const SendMediaModal = React.memo((props) => {
    const [name, setName] = useState('');
    const [emailId, setEmailId] = useState('');
    const [emailMsg, setEmailMsg] = useState('');
    const [dob, setDob] = useState(new Date());
    const [nhsNumber, setNhsNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [files, setFiles] = useState([]);
    const [emptyDob, setEmptyDob] = useState(false)
    const [nhsErrorMessage, setErrorNhsNumber] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [emailMessageError, setEmailMessageError] = useState("")
    const [valueInDate, setValueInDate] = useState(false);
    const [nhsActive, setNhsActive] = useState(false);
    const [allChecked, setAllChecked] = useState(false);
    const [attachmentIds, setAttachmentIds] = useState([]);
    const [masterAttachments, setMasterAttachments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [patientUsers, setPatientUsers] = useState(props.patientUsers);
    const [masterPatientUsers, setMasterPatientUsers] = useState(props.patientUsers);
    const [attachmentCatIds, setAttachmentCatIds] = useState([]);
    const [imgFiles, setImgFiles] = useState([]);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectPatientModalOpen, setSelectPatientModalOpen] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [userFound, setUserFound] = useState(false);
    const [fileError, setFileError] = useState('');
    const [patientDetail, setPatientDetail] = useState('');
    const [isSSOUserActive, setisSSOUserActive] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [sortColName, setSortColName] = useState('');
    const [sortType, setSortType] = useState(true);
    const [columnArray, setColumnArray] = useState([])
    const [tempPatient, setTempPatient] = useState([]);
    const [checkedCount, setCheckedCount] = useState(0);
    const [searchVal, setSearchVal] = useState('');
    const [singlePatient, setSinglePatient] = useState(false);
    const [multiplePatient, setMultiplePatient] = useState(false);
    const [categories, setCategories] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [openEditUserModal, setOpenEditUserModal] = useState("");
    const [search, setSearch] = useState('');
    const [isSingleModal, setIsSingleModal] = useState(false);

    let isSSOUser = localStorage.getItem('isSSOUser');
    let patient_detail = localStorage.getItem('patient_detail');

    if (isSSOUser) {
        patient_detail = JSON.parse(localStorage.getItem('patient_detail'));
    }

    const filterOptions = createFilterOptions({
        // matchFrom: 'start',
        stringify: (option) => option.title + option.first_name + option.last_name + option.nhs_number + option.email,
    });



    useEffect(() => {
        if (!isSSOUser) {
            let localPatientUsers = [...patientUsers];
            localPatientUsers.forEach(element => {
                element.checked = false;
            });
            setPatientUsers(localPatientUsers);
        } else {
            setNhsActive(true);
            setValueInDate(true);
            setUserFound(true);

            setEmailId(patient_detail.email);
            setNhsNumber(patient_detail.nhs_number);
            setDob(new Date(patient_detail.date_of_birth));
            setFirstName(patient_detail.first_name);
            setLastName(patient_detail.last_name);
            if (isSSOUser === 'true') {
                setisSSOUserActive(true);
            }
            else {
                setisSSOUserActive(false);
            }

            let localPatientUsers = {};
            let tempLocalArray = []

            localPatientUsers.nhs_number = (patient_detail.nhs_number.split('-').join(''));
            let formattedDob = format(new Date(patient_detail.date_of_birth), 'yyyy-MM-dd');
            localPatientUsers.date_of_birth = (formattedDob);
            localPatientUsers.first_name = (patient_detail.first_name);
            localPatientUsers.last_name = (patient_detail.last_name);
            localPatientUsers.email = (patient_detail.email);

            tempLocalArray.push(localPatientUsers)
            setTempPatient(tempLocalArray);
            setSinglePatient(false);
            setShowTable(true);
            setNhsActive(true);
            setSelectedRecipients(false);
        }
    }, []);

    useEffect(() => {
        if (props.data && props.data.length > 0) {
            let categories = [];
            for (let i = 0; i < props.data.length; i++) {
                let content = props.data[i];
                if (!categories.includes(content.category_id)) {
                    categories.push(content.category_id);
                }
            }

            if (categories.length > 0) {
                setupAttachment(categories);
            }
            setCategories(categories);
        }
    }, [props.data]);

    const setupAttachment = async (categories) => {
        try {
            globalLoader(true);

            let obj = {
                method: API_METHODS.POST,
                history: props.history,
                api: '/get-contents',
                body: {
                    search_string: '',
                    filter_type: CONTENT_FILTER_TYPES.FOR_PATIENTS,
                    view_type: CONTENT_VIEW_TYPES.ORIGINAL,
                    categories: categories.toString()
                }
            }

            let contentApiResponse = await CallApiAsync(obj);
            if (contentApiResponse.data.status == 200) {
                    let contentsData = contentApiResponse.data.data.contents;
                    if (contentsData && contentsData.length > 0) {
                        let contents = [];
                        for (let content of contentsData) {
                            let findIndex = props.data.findIndex(e => e.content_id == content.content_id && e.clinician_content_id == content.clinician_content_id);
                            if (content.content_type_key != CONTENT_TYPE.DECK && findIndex < 0) {
                                let newContent = Object.create(content);
                                let contentData = [];
                                let defaultLanguageId = 0;
                                for (let langId of newContent.languages) {
                                    if (!defaultLanguageId) {
                                        defaultLanguageId = langId;
                                    }
                                    if (newContent.content_data.length > 0) {
                                        let deckDetail = newContent.content_data.find(e => e.language_id == langId);
                                        if (deckDetail) {
                                            contentData[langId] = deckDetail
                                        }
                                    }
                                }
                                newContent.content_data = contentData;
                                newContent.default_language_id = defaultLanguageId;
                                contents.push(newContent);
                            }
                        }
                        setAttachments(contents);
                        setMasterAttachments(contents);
                    }
                    else {
                        setAttachments([]);
                        setMasterAttachments([]);
                    }
               
            } else {
                setAttachments([]);
                setMasterAttachments([]);
                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, contentApiResponse.data.status.toString()));
            }
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "_loggedInLayout/fetchContent",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    useEffect(() => {
        setEmailMsg(props?.userDetail?.email_message);
        if (isSSOUser) {
            setNhsActive(true);
            setValueInDate(true);
            setUserFound(true);

            setEmailId(patient_detail.email);
            setNhsNumber(patient_detail.nhs_number);
            setDob(new Date(patient_detail.date_of_birth));
            setFirstName(patient_detail.first_name);
            setLastName(patient_detail.last_name);
            if (isSSOUser === 'true') {
                setisSSOUserActive(true);
            }
            else {
                setisSSOUserActive(false);
            }
        }

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
                isSort: false
            },
            {
                databaseColumn: 'date_of_birth',
                columnName: getResourceValue(props.resources, 'DATE_OF_BIRTH'),
                isSort: false
            }
        ]
        setColumnArray(columnArraySuper);

    }, [emailId])

    const fetchEmailChange = async (ev) => {
        if (isSSOUser) {
            return ev.preventDefault();
        } else {
            setEmailId(ev.target.value.trim());
            getNhsFunc(ev.target.value.trim());
        }
    }

    const getNhsFunc = async (email) => {

        try {

            let formValidation = true;
            setUserFound(false);
            setErrorNhsNumber('');

            let emailMaxLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Max_Length);

            if (!email) {
                formValidation = false;
                setEmailErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"))
            }
            else {
                let validEmailLocal = await validEmail(email);
                if (!validEmailLocal) {
                    formValidation = false;
                    setEmailErrorMessage(getResourceValue(props.resources, "FIELD_INVALID"))
                } else {
                    if (email.length > emailMaxLength) {
                        formValidation = false;
                        setEmailErrorMessage(getResourceValue(props.resources, 'FIELD_LENGTH').replace('{max_length}', emailMaxLength))
                    } else {
                        setEmailErrorMessage('')
                    }
                }
            }

            if (formValidation) {
                globalLoader(true)
                setNhsActive(false);
                setDob('');
                setNhsNumber('');
                setFirstName('');
                setLastName('');
                setValueInDate(false);
                if (!isSSOUserActive) {
                    let obj = {
                        method: API_METHODS.POST,
                        history: props.history,
                        api: '/check-patient-exists',
                        body: {
                            email: email
                        }
                    }
                    let res = await CallApiAsync(obj);
                    if (res?.data?.status === 200) {
                        globalLoader(false)
                        setNhsActive(true);

                        if (res.data?.data?.date_of_birth) {
                            setDob(new Date(res.data?.data?.date_of_birth))
                            setValueInDate(true)
                        }
                        if (res.data?.data?.nhs_number > 0) {
                            setUserFound(true);
                            setFirstName(res.data?.data?.first_name);
                            setLastName(res.data?.data?.last_name);
                            nhsNumberFunc(res.data?.data?.nhs_number.toString())
                        }
                    } else if (res?.data?.status.toString() === RESOURCE_KEYS.ERROR_CODES.NHS_NOT_AVAILABLE) {
                        globalLoader(false)
                        setNhsActive(true);
                        setUserFound(false);
                    } else {
                        globalLoader(false)

                        if (res?.data?.data?.errors) {
                            let emailMaxLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Max_Length);
                            let emailMinLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Min_Length);
                            setEmailErrorMessage(getResourceValue(props.resources, res?.data?.data?.errors.email).replace('{min_length}', emailMinLength).replace('{max_length}', emailMaxLength))
                        }
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, res?.data?.status.toString()))
                    }
                }
            }
            else {
                globalLoader(false)
                setNhsActive(false);
            }

        } catch (error) {
            let errorObject = {
                methodName: "sendMediaModal/getNhsFunc",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    const formSubmit = async () => {

        try {

            let value = await formValidation()
            if (value) {
                globalLoader(true);
                const formData = new FormData();
                formData.append('email_message', emailMsg);
                if (nhsActive) {
                    formData.append('email', emailId);
                    formData.append('nhs_number', nhsNumber.split('-').join(''));
                    let formattedDob = format(dob, 'yyyy-MM-dd');
                    formData.append('date_of_birth', formattedDob);
                    formData.append('first_name', firstName);
                    formData.append('last_name', lastName);
                }

                if (!isSSOUserActive) {
                    let userIds = [];
                    let changedUserData = [];
                    let localPatientUsers = [...patientUsers];
                    localPatientUsers.forEach(element => {
                        if (element.checked && selectedRecipients) {
                            userIds.push(element.user_id);
                        }
                        if (element?.changed) {
                            changedUserData.push(element)
                        }
                    });
                    if (userIds.length > 0) {
                        formData.append('users', userIds.join().toString());
                    }
                    if (changedUserData.length > 0) {
                        formData.append('changed_user_data', JSON.stringify(changedUserData));
                    }
                }


                if (files?.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        formData.append(`attachments`, files[i])
                    }
                }

                if (attachmentIds.length > 0) {
                    formData.append('content_attachments', attachmentIds.join().toString());
                }

                let contents = [];
                let fileContentCount = 0;
                for (let i = 0; i < props.data.length; i++) {
                    let content = props.data[i];
                    let newContent = {
                        modified: content.modified ? 1 : 0,
                        content_id: content.content_id,
                        clinician_content_id: content.clinician_content_id,
                    }
                    if (content.modified) {
                        fileContentCount++;
                        newContent.file_key_id = fileContentCount;
                        newContent.files_info = content.files_info;
                        newContent.content_title = content.content_title;
                        newContent.language_id = content.language_id;

                        content.modified_images.forEach(x => {
                            formData.append(`modified_images_${fileContentCount}`, x)
                        });

                        formData.append(`modified_video_${fileContentCount}`, content.modified_video);
                    }
                    contents.push(newContent);
                }

                if (categories.length > 0) {
                    formData.append('categories', categories.toString());
                }

                if (contents.length > 0) {
                    formData.append('contents', JSON.stringify(contents));
                }

                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/send-contents',
                    body: formData
                }

                let res = await CallApiAsync(obj);
                if (res.data.status === 200) {
                    globalAlert('success', getResourceValue(props.resources, "SUCCESS_MAIL"));
                    globalLoader(false)
                    props.onCloseModal()
                    onSinglePatientModalClose(false)
                    changeContentBasket([]);
                    changeBasketView(false);

                } else  {
                    if (res.data?.data?.errors?.email) {
                        let emailMaxLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Max_Length);
                        let emailMinLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Min_Length);
                        setEmailErrorMessage(getResourceValue(props.resources, res.data?.data?.errors?.email).replace('{min_length}', emailMinLength).replace('{max_length}', emailMaxLength));
                    }
                    if (res?.data?.data?.errors?.nhs_number) {
                        setErrorNhsNumber(getResourceValue(props.resources, res?.data?.data?.errors?.nhs_number));
                    }
                    if (res?.data?.data?.errors?.attachments) {
                        setFileError(getResourceValue(props.resources, res?.data?.data?.errors?.attachments));
                    }
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, res.data.status.toString()))
                    globalLoader(false)
                }
               
            }

        } catch (error) {
            let errorObject = {
                methodName: "sendMediaModal/formSubmit",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }


    }


    const formValidation = async () => {
        let formValidation = true;
        setFileError('');

        let emailMaxLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Max_Length);
        let emailMessageMaxLength = getResourceValue(props.resources, "DEFAULT_MESSAGE", resourceFields.Max_Length);

        if (nhsActive) {
            if (!emailId) {
                formValidation = false;
                setEmailErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"))
            }
            else {
                let validEmailLocal = await validEmail(emailId);
                if (!validEmailLocal) {
                    formValidation = false;
                    setEmailErrorMessage(getResourceValue(props.resources, "FIELD_INVALID"))
                } else {
                    if (emailId.length > emailMaxLength) {
                        formValidation = false;
                        setEmailErrorMessage(getResourceValue(props.resources, 'FIELD_LENGTH').replace('{max_length}', emailMaxLength))
                    } else {
                        setEmailErrorMessage('')
                    }
                }
            }

            if (!dob) {
                formValidation = false;
                setEmptyDob(true)
            }
            if (!nhsNumber) {
                formValidation = false;
                setErrorNhsNumber(getResourceValue(props.resources, "FIELD_REQUIRED"))
            }
            else {
                setErrorNhsNumber('');
            }

            let firstNameMinLength = getResourceValue(props.resources, "FIRSTNAME", resourceFields.Min_Length);
            let firstNameMaxLength = getResourceValue(props.resources, "FIRSTNAME", resourceFields.Max_Length);
            let lastnameMinLength = getResourceValue(props.resources, "LASTNAME", resourceFields.Min_Length);
            let lastnameMaxLength = getResourceValue(props.resources, "LASTNAME", resourceFields.Max_Length);
            if (!firstName) {
                formValidation = false;
                setFirstNameError(getResourceValue(props.resources, 'FIELD_REQUIRED'));
            } else if (firstName.length > firstNameMaxLength) {
                formValidation = false;
                setFirstNameError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', firstNameMinLength).replace('{max_length}', firstNameMaxLength));
            } else {
                setFirstNameError('');
            }

            if (!lastName) {
                formValidation = false;
                setLastNameError(getResourceValue(props.resources, 'FIELD_REQUIRED'));
            } else if (lastName.length > lastnameMaxLength) {
                formValidation = false;
                setLastNameError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', lastnameMinLength).replace('{max_length}', lastnameMaxLength));
            } else {
                setLastNameError('');
            }
            if (!formValidation) {
                setSinglePatient(true);
            }
        }

        if (selectedRecipients) {
            let localPatientUsers = [...patientUsers];
            let checkedAvailable = localPatientUsers.findIndex(e => e.checked == true);
            if (checkedAvailable < 0) {
                formValidation = false;
                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "SELECT_PATIENT_ERROR"));
            }
        }

        if (!nhsActive && !selectedRecipients) {
            formValidation = false;
            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "SELECT_PATIENT_ERROR"));
        }

        if (!emailMsg) {
            formValidation = false;
            setEmailMessageError(getResourceValue(props.resources, "FIELD_REQUIRED"));
        } else if (emailMsg.length > emailMessageMaxLength) {
            formValidation = false;
            setEmailMessageError(getResourceValue(props.resources, 'FIELD_LENGTH').replace('{max_length}', emailMessageMaxLength))
        }

        if (!formValidation) {
            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, RESOURCE_KEYS.ERROR_CODES.VALIDATION_ERROR));
        }

        return formValidation
    }

    const datePickerValue = () => {
        if (!dob) {
            setValueInDate(false)
        }
    }

    const changeFileSelect = (attachment) => {
        let loaclIds = [...attachmentIds];
        let index = loaclIds.findIndex(x => x === attachment);
        if (index > -1) {
            loaclIds.splice(index, 1)
        }
        else {
            loaclIds.push(attachment)
        }
        setAttachmentIds(loaclIds)
    }

    const readAsDataURL = (file) => {

        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.onload = function () {
                return resolve({ data: fileReader.result, name: file.name, size: file.size, type: file.type });
            }
            fileReader.readAsDataURL(file);
        })
    }

    const changeFile = async (ev) => {
        try {
            if (ev.target.files && ev.target.files.length > 0) {
                let allValidFile = true;
                for (let i = 0; i < ev.target.files.length; i++) {

                    let fileType = ev.target.files[i].type.split("/");

                    if (ImageFileTypes.includes(fileType[1].toLowerCase())) {
                        if (ev.target.files[i].size / 1024 == 0) {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "FILE_SIZE_LIMIT"));
                            allValidFile = false;
                            break
                        }
                    }
                    else {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "IMAGE_FILES_VALIDATION"));
                        allValidFile = false;
                        break
                    }
                }
                if (allValidFile) {
                    let allFiles = [...files, ...ev.target.files];
                    if (allFiles.length > 0) {
                        let images = await Promise.all(allFiles.map(f => { return readAsDataURL(f) }));
                        if (images.length > 0) {
                            setImgFiles(images)
                            setFiles(allFiles)
                        }
                    }
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "sendMediaModal/changeFile",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const removeImg = (index) => {
        let localImages = [...imgFiles];
        let localFiles = [...files];

        localFiles.splice(index, 1);
        localImages.splice(index, 1);
        setImgFiles(localImages);
        setFiles(localFiles)

    }

    const nhsNumberFunc = (value) => {
        try {
            var containsNumber = /^[0-9\-\b]+$/;
            let firstLetterZero = false;
            let maxLength = 12;
            if (value && value[0] === '0') {
                firstLetterZero = true;
            }


            if ((containsNumber.test(value) || value === '') && value.length <= maxLength) {

                let newVal = value.split('-').join('');

                if (newVal.length > 3 && newVal.length < 7) {
                    setNhsNumber(newVal.slice(0, 3) + "-" + newVal.slice(3, 6));

                }
                else if (newVal.length >= 7) {
                    setNhsNumber(newVal.slice(0, 3) + "-" + newVal.slice(3, 6) + "-" + newVal.slice(6, 10));
                }
                else {
                    setNhsNumber(newVal);
                }
            }
            else {
                return false
            }
        } catch (error) {
            let errorObject = {
                methodName: "sendMediaModal/nhsNumberFunc",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    const onConfirmCloseModalFunc = (val) => {
        if (val) {
            setConfirmModalOpen(false);
            props.onCloseModal()
        }
        else {
            setConfirmModalOpen(false)
        }
    }

    const onSelectPatientModal = (val) => {
        if (val) {
            setSelectPatientModalOpen(false)
            props.onCloseModal();
        }
        else {
            setSelectPatientModalOpen(false)
        }


        let tempPatientUsers = []
        let count = 0;
        patientUsers.length > 0 && patientUsers.map((item, index) => {
            if (item.checked) {
                count++;
                tempPatientUsers.push(item)
            }
            setCheckedCount(count)
        })
        if (tempPatientUsers.length > 0) {
            setTempPatient(tempPatientUsers);
        }

    }

    const checkRecipients = (val) => {
        if (val) {
            setSelectedRecipients(true)
            setNhsActive(false);
            setShowTable(true);
        } else {
            setSelectedRecipients(false)
            setShowTable(false);
            setTempPatient([]);
        }
    }

    const onCloseModalFunc = (val) => {
        props.onCloseModal()
    }

    const checkedUsers = (ev, id, type) => {
        try {
            let localPatientUsers = [...patientUsers];

            if (type === "All") {

                localPatientUsers.forEach(element => {
                    element.checked = ev.target.checked
                });

                setPatientUsers(localPatientUsers);
                setAllChecked(false);
                //remove all selection
                if (allChecked) {
                    setAllChecked(false);
                }
                //check all rows
                else {
                    setAllChecked(true);
                }

                //sort the list based on user id
                localPatientUsers.sort((a, b) => (a.user_id > b.user_id) ? 1 : ((b.user_id > a.user_id) ? -1 : 0));
            }

            else {
                let index = localPatientUsers.findIndex(x => x.user_id === id);
                localPatientUsers[index].checked = ev.target.checked;

                //sort the list based on checked items
                localPatientUsers.sort((a, b) => (a.checked < b.checked) ? 1 : ((b.checked < a.checked) ? -1 : 0));

                setPatientUsers(localPatientUsers);
                setAllChecked(false);

            }
        } catch (error) {
            let errorObject = {
                methodName: "manageUsers/checkedUsers",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    const sortingTable = (val) => {
        let localPatientUsers = [...patientUsers];
        // // localPatientUsers.sort((a, b) => a.val - b.val);
        // setPatientUsers(localPatientUsers)
        // console.log(val)
        // console.log(sortColName)
        // console.log(sortType)
    }

    const searchPatients = (searchQuery) => {
        if (searchQuery != "") {
            let searchText = searchQuery.toLowerCase();

            let filteredData = masterPatientUsers.filter(e => {
                return (e.title?.toLowerCase().includes(searchText) || e.first_name?.toLowerCase().includes(searchText) || e.last_name?.toLowerCase().includes(searchText) || e.email?.toLowerCase().includes(searchText) || e.nhs_number?.toLowerCase().includes(searchText))
            });

            setPatientUsers(filteredData);

        }
        else {
            setPatientUsers(masterPatientUsers);
        }

    }

    const getSearchLabel = (option) => {
        let label = ``;
        if (option.nhs_number) {
            label += `${formatNHSNumber(option.nhs_number)} `;
        }
        if (option.title || option.first_name || option.last_name) {
            label += `- `
            if (option.title) {
                label += `${option.title} `;
            }
            if (option.first_name) {
                label += `${option.first_name} `;
            }
            if (option.last_name) {
                label += `${option.last_name} `;
            }
        }
        if (label) {
            label += `- `
        }
        label += `${option.email}`;
        return label;
    }

    const searchFilter = (ev) => {
        ev.preventDefault();
        let searchString = searchVal.toLowerCase();
        let content = masterAttachments;
        let filteredData = content.filter(e => {
            return (getContentTitle(e).toLowerCase().includes(searchString) || e.description?.toLowerCase().includes(searchString))
        });
        setAttachments(filteredData);
    }
    const changeValue = (ev) => {

    }

    const singlePatientFun = () => {
        setSinglePatient(true);
        setIsSingleModal(true);
        setMultiplePatient(false);
    }

    const multiplePatientFun = () => {
        setSinglePatient(false);
        setMultiplePatient(true);
        setSelectPatientModalOpen(true);
        setIsSingleModal(false)
    }

    const onSinglePatientModalClose = (val) => {
        if (val) {
            setSinglePatient(false);
            props.onCloseModal()
        }
        else {
            setSinglePatient(false)
        }
    }

    const getContentTitle = (content) => {
        let defaultLanguageId = localStorage.getItem('default_language_id');
        if (content.content_data[props.languageId]) {
            return content.content_data[props.languageId]?.content_title;
        } else if (content.content_data[defaultLanguageId]) {
            return content.content_data[defaultLanguageId]?.content_title;
        } else {
            return content.content_data[content.default_language_id]?.content_title;
        }
    }

    const submitPatients = () => {

        let selectedPatients = patientUsers.filter(element => {
            return element.checked == true;
        });

        if (selectedPatients.length > 0) {
            props.selectedRecipent(true);
        }
        else {
            props.selectedRecipent();
        }

        // props.onCloseModal(null);
        setSelectedRecipients(true);
        onSelectPatientModal()

    }

    const openEditUserModalFunc = (id) => {
        let data = props.patientUsers.find((val) => val.user_id == id);
        setSinglePatient(data)
        setCurrentUserId(id);
        setOpenEditUserModal(true)
    }
    const handleSearching = (ev) => {
        setSearch(ev.target.value)
    }

    const singleformSubmit = async (ev) => {

        ev.preventDefault();

        let formValidation = true;
        let emailMaxLength = getResourceValue(props.resources, "EMAIL_ID", resourceFields.Max_Length);
        if (!emailId) {
            formValidation = false;
            setEmailErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"))
        }
        else {
            let validEmailLocal = await validEmail(emailId);
            if (!validEmailLocal) {
                formValidation = false;
                setEmailErrorMessage(getResourceValue(props.resources, "FIELD_INVALID"))
            } else {
                if (emailId.length > emailMaxLength) {
                    formValidation = false;
                    setEmailErrorMessage(getResourceValue(props.resources, 'FIELD_LENGTH').replace('{max_length}', emailMaxLength))
                } else {
                    setEmailErrorMessage('')
                }
            }
        }

        if (!dob) {
            formValidation = false;
            setEmptyDob(true)
        }
        if (!nhsNumber) {
            formValidation = false;
            setErrorNhsNumber(getResourceValue(props.resources, "FIELD_REQUIRED"))
        }
        else {
            setErrorNhsNumber('');
        }

        let firstNameMinLength = getResourceValue(props.resources, "FIRSTNAME", resourceFields.Min_Length);
        let firstNameMaxLength = getResourceValue(props.resources, "FIRSTNAME", resourceFields.Max_Length);
        let lastnameMinLength = getResourceValue(props.resources, "LASTNAME", resourceFields.Min_Length);
        let lastnameMaxLength = getResourceValue(props.resources, "LASTNAME", resourceFields.Max_Length);
        if (!firstName) {
            formValidation = false;
            setFirstNameError(getResourceValue(props.resources, 'FIELD_REQUIRED'));
        } else if (firstName.length > firstNameMaxLength) {
            formValidation = false;
            setFirstNameError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', firstNameMinLength).replace('{max_length}', firstNameMaxLength));
        } else {
            setFirstNameError('');
        }

        if (!lastName) {
            formValidation = false;
            setLastNameError(getResourceValue(props.resources, 'FIELD_REQUIRED'));
        } else if (lastName.length > lastnameMaxLength) {
            formValidation = false;
            setLastNameError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', lastnameMinLength).replace('{max_length}', lastnameMaxLength));
        } else {
            setLastNameError('');
        }

        if (formValidation) {
            let localPatientUsers = {};
            let tempLocalArray = []

            localPatientUsers.nhs_number = (nhsNumber.split('-').join(''));
            let formattedDob = format(new Date(dob), 'yyyy-MM-dd');
            localPatientUsers.date_of_birth = (formattedDob);
            localPatientUsers.first_name = (firstName);
            localPatientUsers.last_name = (lastName);
            localPatientUsers.email = (emailId);

            tempLocalArray.push(localPatientUsers)
            setTempPatient(tempLocalArray);
            setSinglePatient(false);
            setShowTable(true);
            setNhsActive(true);
            setSelectedRecipients(false);
        } else {
            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, RESOURCE_KEYS.ERROR_CODES.VALIDATION_ERROR))
        }
    }



    return (
        <>
            <Modal classNames={{ modal: "modal-xl modal-own custom-modal-own" }} showCloseIcon={false} open={props.open} onClose={() => onCloseModalFunc()} center closeOnOverlayClick={true}>
                <div className="row d-flex justify-content-between cpl-20 cpr-20 cpb-10 " >
                    <div className="d-flex align-self-center" >
                        <p className="login-txt mb-0 primary-color">{getResourceValue(props.resources, "SendContent")}</p>
                    </div>

                    <div className="d-flex btn-wrapper">
                        <div className="cpr-10 ">
                            <button type="button" onClick={() => props.onCloseModal()} className="btn btn-own btn-block btn-grey min-height-btn mw-100">{getResourceValue(props.resources, "CANCEL")}</button>
                        </div>
                        <div className=" ">
                            <button type="submit" onClick={() => formSubmit()} className="btn btn-own btn-block btn-own-primary min-height-btn mw-100">{getResourceValue(props.resources, "SEND")}</button>
                        </div>
                    </div>
                </div>
                <div className="send-form-wrapper cpl-10 cpr-10">
                    <div className="col-12 p-0">
                        <div className="row px-2 file-row-wrapper position-relative">
                            <div className="attachment-wrapper position-relative add-attachment-container py-3 col-md-6 col-12">
                                <div className="row d-flex justify-content-between  cpr-10 cpl-10" >
                                    <div className="d-flex align-self-center" >
                                        <h4 className="font-16 font-600 attachment-heading mb-0 "> {getResourceValue(props.resources, "ADD_ATTACHMENT")}</h4>
                                    </div>
                                    <div className="btn-wrapper">
                                        <form
                                            className="form-own form-auto-height"
                                            noValidate
                                            autoComplete="off"
                                            onSubmit={(ev) => searchFilter(ev)}
                                        >
                                            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                                                <OutlinedInput
                                                    id="standard-adornment-amount"
                                                    name="searchVal"
                                                    onChange={(ev) => setSearchVal(ev.target.value)}
                                                    value={searchVal}
                                                    variant="outlined"
                                                    startAdornment={<InputAdornment position="start"><i className="fa fa-search" aria-hidden="true" ></i></InputAdornment>}
                                                    placeholder={getResourceValue(props.resources, "SEARCH")}
                                                    style={{ background: '#F4F4F4', width: '200px' }}
                                                />
                                            </FormControl>
                                        </form>
                                    </div>
                                </div>
                                <Scrollbars style={{ height: 150 }} >
                                    <div className="px-3">
                                        <FormGroup aria-label="attchment" name="attchments" >
                                            {attachments && attachments.length > 0 && attachments.map((content, index) => (
                                                <FormControlLabel key={content.content_id} value={`img${index}`} control={
                                                    <Checkbox onChange={() => changeFileSelect(content.content_id)} checked={attachmentIds.indexOf(content.content_id) > -1} />} label={getContentTitle(content)}
                                                />
                                            ))}
                                        </FormGroup>
                                    </div>

                                </Scrollbars>


                            </div>

                            <div className="attachment-wrapper py-3 col-md-6 col-12">
                                <>
                                    <h4 className="font-16 font-600 attachment-heading pt-2"> {getResourceValue(props.resources, "ADD_IMAGE")}</h4>

                                    <div className="upload-file-img pb-3">
                                        <div className="upload-btn ">
                                            <div className="upload-btn-txt btn">
                                                + {getResourceValue(props.resources, "ADD_IMAGES")}
                                            </div>
                                            <div className="py-2">
                                                {getResourceValue(props.resources, "IMAGE_DESCRIPTION")}
                                            </div>

                                            <input type="file" onClick={e => (e.target.value = null)} multiple accept=".png,.jpeg,.jpg" className="upload-input cursor" onChange={changeFile} title="" />
                                        </div>
                                        <div className="error-wrapper">
                                            {fileError}
                                        </div>
                                    </div>

                                    <Scrollbars style={{ height: 100 }} >
                                        <div className="px-2">
                                            <ul className="img-list list-unstyled">
                                                {imgFiles.length > 0 && imgFiles.map((img, index) => (
                                                    <li key={index}>
                                                        <div className="inner-wrapper position-relative">
                                                            <div className="cross-wrapper cursor" onClick={() => removeImg(index)}>
                                                                <img src="/assets/img/cross.png" alt="img" />
                                                            </div>
                                                            <img className="main-img" src={img.data} alt="img" />
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Scrollbars>
                                </>
                            </div>
                        </div>
                    </div>
                    <>
                        {isSSOUserActive ?
                            <div className="col-12 cpt-10 d-flex"></div>
                            :
                            <div className="col-12 p-0 d-flex">
                                <h4 className="font-16 font-600 attachment-heading mb-0 cpt-10 cpb-10">{getResourceValue(props.resources, "SELECT_PATIENT")}:</h4>

                                <div onClick={() => singlePatientFun()} className="custom-checkboxSP-wrapper position-relative cpt-10">
                                    <input className="styled-checkboxSP" checked={isSingleModal ? true : singlePatient} id="styled-checkbox-1" type="checkbox" />
                                    <label htmlFor="styled-checkbox-1">
                                        <h5>{getResourceValue(props.resources, "SINGLE_PATIENT")}</h5>
                                    </label>
                                </div>
                                <div onClick={() => multiplePatientFun()} className="custom-checkboxSP-wrapper position-relative cpt-10">
                                    <input className="styled-checkboxSP" checked={isSingleModal ? false : multiplePatient} id="styled-checkbox-2" type="checkbox" />
                                    <label htmlFor="styled-checkbox-2">
                                        <h5>{getResourceValue(props.resources, "MULTIPLE_PATIENT")}</h5>
                                    </label>
                                </div>
                            </div>}
                    </>
                </div>
                {showTable &&
                    <>
                        <div className="col-12 content-container p-0">
                            <CustomTableComponent
                                buttons={isSSOUserActive ? [] : [
                                    {
                                        text: `${getResourceValue(props.resources, "EDIT")}`,
                                        onClick: () => isSingleModal ? setSinglePatient(true) : setSelectPatientModalOpen(true),
                                        type: BUTTON_TYPES.PRIMARY
                                    },

                                ]}
                                allChecked={allChecked}
                                isCheckRequired={showTable ? false : true}
                                openEditUserModalFunc={openEditUserModalFunc}
                                columnArray={columnArray}
                                tableTitle={getResourceValue(props.resources, "SELECTED_PATIENTS")}
                                primaryKey={'user_id'}
                                showCheckbox={true}
                                showSearchBar={showTable ? false : true}
                                showTitle={true}
                                showNavigation={!isSSOUserActive}
                                showFilter={false}
                                resources={props.resources}
                                dataArray={tempPatient}
                                totalCount={tempPatient.length}
                                searchVal={search}
                                changeValue={handleSearching}
                                searchFilter={searchFilter}
                                checkedUsers={props.checkedUsers}
                            />
                        </div>
                        <div className="col-12 col-md-12 p-0 cmt-20">
                            <p className=" font-14 m-0 cpb-10">
                                {getResourceValue(props.resources, "DEFAULT_EMAIL_MESSAGE")}
                            </p>
                            <div className="own-textarea pb-3 form-group">
                                <TextField
                                    type="text"
                                    multiline
                                    className='mt-0 mb-0 d-flex'
                                    margin="normal"
                                    variant="outlined"
                                    name="emailMsg"
                                    onChange={(ev) => setEmailMsg(ev.target.value)}
                                    value={emailMsg}
                                    rows={1}
                                />
                                <div className="error-wrapper">
                                    {emailMessageError}
                                </div>
                            </div>
                        </div>


                    </>

                }
            </Modal>




            {confirmModalOpen && <ConfirmationModal resources={props.resources} open={confirmModalOpen} description={getResourceValue(props.resources, "TEACH_NOW_CANCEL")} onCloseModal={onConfirmCloseModalFunc} />}

            {singlePatient && <SinglePatientModal resources={props.resources} open={singlePatient} getSearchLabel={getSearchLabel} emailId={emailId} filterOptions={filterOptions} fetchEmailChange={fetchEmailChange} patientUsers={patientUsers} setEmailId={setEmailId} getNhsFunc={getNhsFunc} isSSOUserActive={isSSOUserActive} onCloseModal={onSinglePatientModalClose} nhsActive={nhsActive} nhsNumberFunc={nhsNumberFunc} nhsNumber={nhsNumber} userFound={userFound} nhsErrorMessage={nhsErrorMessage} emailErrorMessage={emailErrorMessage} valueInDate={valueInDate} dob={dob} setDob={setDob} datePickerValue={datePickerValue} emptyDob={emptyDob} firstName={firstName} lastName={lastName} setFirstName={setFirstName} setLastName={setLastName} setValueInDate={setValueInDate} firstNameError={firstNameError} lastNameError={lastNameError} selectedRecipients={selectedRecipients} singleformSubmit={singleformSubmit} />}

            {selectPatientModalOpen && <PatientModal searchPatients={searchPatients} checkedUsers={checkedUsers} patientUsers={patientUsers} allChecked={allChecked} resources={props.resources} open={selectPatientModalOpen} onCloseModal={onSelectPatientModal} sortingTable={sortingTable} selectedRecipent={checkRecipients} sortVal={sortColName} sortType={sortType}
            />}




        </>
    )
})

const mapStateToProps = state => ({
    patientUsers: state.common.patientUsers,
    orgId: state.user.orgId,
    userDetail: state.user.userDetail,
    startTime: state.common.startTime,
    endTime: state.common.endTime,
    languageId: state.common.languageId,
})


export default connect(mapStateToProps)(withRouter(SendMediaModal));