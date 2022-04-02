import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { changeOrgId, errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, GLOBAL_API, ImageFileTypes, INVITATION_TYPES, PRIMARY_COLOR, PRIMARY_FONT_COLOR, resourceFields, ROLES } from '../Constants/types';
import CustomColorPicker from '../Components/CustomColorPickerComponent';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

const yourhandle = require('countrycitystatejson');
const AddOrganisationModal = React.memo((props) => {
    const [name, setName] = useState('');
    const [typeList, setTypeList] = useState([]);
    const [nameError, setNameError] = useState(false);
    const [country, setCountry] = useState('');
    const [emptyCountry, setEmptyCountry] = useState(false);
    const [state, setState] = useState('');
    const [emptyState, setEmptyState] = useState(false);
    const [postcode, setPostcode] = useState('');
    const [city, setCity] = useState('');
    const [emptyCity, setEmptyCity] = useState(false);
    const [addressLineOne, setAddressLineOne] = useState('');
    const [addressLineTwo, setAddressLineTwo] = useState('');
    const [copyright, setCopyright] = useState('');
    const [file, setFile] = useState(null);
    const [filename, setFileName] = useState('');
    const [countryList, setCountryList] = useState([])
    const [stateList, setStateList] = useState([]);
    const [fileChange, setFileChanged] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    const [patientExcelFile, setPatientExcelFile] = useState(null);
    const [selectedValue, setSelectedValue] = useState([])
    // const [oldSelectedValues, setOldSelectedValues]=useState([{name: 'Srigar', id: 1, group:'tt'}]);
    const [options, setOptions] = useState([]);
    const [emptyCat, setEmptyCat] = useState(false);
    const [partnerList, setPartnerList] = useState([])
    const [allPartnerSelcted, setAllPartnerSelcted] = useState(false);
    const [allTreatmentSelected, setAllTreatmentSelected] = useState(false)
    const [allConditionSelected, setAllConditionSelected] = useState(false)
    const [treatmentList, setTreatmentList] = useState([])
    const [conditionList, setConditionList] = useState([])
    const [copyRightError, setCopyRightError] = useState('')
    const [addressLineOneError, setAddressLineOneError] = useState('')
    const [addressLineTwoError, setAddressLineTwoError] = useState('')
    const [cityError, setCityError] = useState('')
    const [postCodeError, setPostCodeError] = useState('')
    const [allCategories, setAllCategories] = useState([]);
    const [conditionAll, setConditionAll] = useState(0);
    const [treatmentAll, setTreatmentAll] = useState(0);
    const [partnersAll, setPartnersAll] = useState(0);
    const [conditionCatCount, setConditionCatCount] = useState(0);
    const [treatmentCatCount, setTreatmentCatCount] = useState(0);
    const [partnersCatCount, setPartnersCatCount] = useState(0);
    const [primaryColor, setPrimaryColor] = useState(PRIMARY_COLOR);
    const [primaryFontColor, setPrimaryFontColor] = useState(PRIMARY_FONT_COLOR);
    const [bulkUploadFlag, setBulkUploadFlag] = useState(false);
    const [bulkPatientFlag, setBulkPatientFlag] = useState(false);
    const [bulkClinicianFlag, setBulkClinicianFlag] = useState(false);
    const [patientSuccess, setPatientSuccess] = useState(0);
    const [patientFailed, setPatientFailed] = useState(0);
    const [patientUploadError, setPatientUploadError] = useState('');
    const [clinicianUploadError, setClinicianUploadError] = useState('');
    const [clinicianSuccess, setClinicianSuccess] = useState(0);
    const [clinicianFailed, setClinicianFailed] = useState(0);
    const [clinicianStatusFile, setClinicianStatusFile] = useState('');
    const [patientStatusFile, setPatientStatusFile] = useState('');
    const [inviteType, setInviteType] = useState(INVITATION_TYPES.WITH_CONTENT);

    useEffect(() => {

        const fetchData = async () => {
            try {
                globalLoader(true)
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/view-categories',
                    body: {}
                }
                let catData = await CallApiAsync(obj);

                if (catData.data.status === 200) {

                    let parentCategory = [];
                    let localCat = [];
                    let allCategories = [];


                    catData.data.data.categories.forEach(data => {
                        if (!parentCategory.includes(data.parent_category_name)) {
                            parentCategory.push(data.parent_category_name)
                        }
                    })
                    parentCategory.forEach(data => {
                        let count = 0;
                        let filteredData = catData.data.data.categories.filter(x => x.parent_category_name === data);
                        let isAllAvailable = catData.data.data.categories.filter(x => (x.parent_category_name === data && x.all === 1));
                        if (isAllAvailable.length > 0) {
                            count = filteredData.length - 1; //removing 'all' from the count
                        } else {
                            count = filteredData.length;
                        }



                        if (data === 'Condition') {
                            setConditionCatCount(count);
                        }
                        else if (data === 'Treatment') {
                            setTreatmentCatCount(count);
                        }
                        else if (data === 'Partners') {
                            setPartnersCatCount(count);
                        }

                        filteredData.forEach(x => {
                            localCat.push({
                                category_name: x.category_name, category_id: x.category_id, all: x.all, parent_category_name: x.parent_category_name
                            });
                        })

                        //get the id of 'all category' for the respective parent category
                        let allCatIdIndex = filteredData.findIndex(e => e.category_name == "All");

                        if (allCatIdIndex >= 0) {
                            let allCat = filteredData[allCatIdIndex];

                            //set all category data for each parent category
                            allCategories.push({ parent_category_id: allCat.parent_category_id, parent_category_name: data, category_id: allCat.category_id, category_name: allCat.category_name });
                        }

                    });

                    setOptions(localCat);
                    setAllCategories(allCategories);

                    // set all category 
                    let conditionAll = allCategories.find(e => e.parent_category_name === 'Condition');
                    let treatmentAll = allCategories.find(e => e.parent_category_name === 'Treatment');
                    let partnersAll = allCategories.find(e => e.parent_category_name === 'Partners');


                    setConditionAll(conditionAll);
                    setTreatmentAll(treatmentAll);
                    setPartnersAll(partnersAll);

                    let localCondition = [];
                    let localTreatment = [];
                    let localpartnerList = []


                    if (props?.currentData?.categories && props?.currentData?.categories?.length > 0) {

                        props.currentData.categories.forEach(x => {
                            if (x.parent_category_name === 'Condition') {
                                localCondition.push(x.category_id)
                            }
                            if (x.parent_category_name === 'Treatment') {
                                localTreatment.push(x.category_id)
                            }
                            if (x.parent_category_name === "Partners") {
                                localpartnerList.push(x.category_id)
                            }

                        });

                        //check if all is selected
                        let conditionId = conditionAll.category_id;
                        if (localCondition.includes(conditionId)) {
                            setAllConditionSelected(true);

                        }



                        let treatmentId = treatmentAll.category_id;
                        if (localTreatment.includes(treatmentId)) {
                            setAllTreatmentSelected(true);

                        }



                        let partnerId = partnersAll.category_id;

                        if (localpartnerList.includes(partnerId)) {
                            setAllPartnerSelcted(true);
                        }
                    }
                }
            } catch (error) {
                let errorObject = {
                    methodName: "addOrganisationModal/fetchData",
                    errorStake: error.toString(),
                    history: props.history
                };

                errorLogger(errorObject);
            }


        }
        fetchData();
        globalLoader(false)

        let sortedCountries = yourhandle.getCountries();
        sortedCountries.sort((a, b) => (a.name > b.name) ? 1 : -1);

        setCountryList(sortedCountries)

        if (props.currentData && props.editMode) {
            setPropsToState()
        } else {

            //select default country
            setCountryFunc("GB")
        }



    }, []);

    const setPropsToState = () => {

        try {
            let fileName
            if (props.currentData.brand_logo) {
                let fileIndex = props.currentData.brand_logo.split('/');
                fileName = fileIndex[fileIndex.length - 1];
                fileName = fileName.split("_$_").pop();

            }


            let localSelectedValue = [];

            if (props.currentData.categories && props.currentData.categories.length > 0) {

                let localCondition = [];
                let localTreatment = [];
                let localpartnerList = []

                props.currentData.categories.forEach(x => {

                    if (x.parent_category_name === 'Condition') {
                        localCondition.push(x.category_id)
                    }
                    if (x.parent_category_name === 'Treatment') {
                        localTreatment.push(x.category_id)
                    }
                    if (x.parent_category_name === "Partners") {
                        localpartnerList.push(x.category_id)
                    }
                    localSelectedValue.push(x.category_id)
                });

                setConditionList(localCondition)
                setTreatmentList(localTreatment)
                setPartnerList(localpartnerList)
            }

            setName(props.currentData.name ? props.currentData.name : '');
            setCopyright(props.currentData.copyright_text ? props.currentData.copyright_text : '');
            setAddressLineOne(props.currentData.address ? props.currentData.address : '');
            setAddressLineTwo(props.currentData.additional_address ? props.currentData.additional_address : '');
            setCity(props.currentData.city ? props.currentData.city : '');
            setPostcode(props.currentData.zip_code ? props.currentData.zip_code : '');
            //setState(props.currentData.state ? props.currentData.state : '');
            setFileName(fileName ? fileName : '');
            setPrimaryColor(props.currentData.primary_color ? props.currentData.primary_color : primaryColor);
            setPrimaryFontColor(props.currentData.primary_font_color ? props.currentData.primary_font_color : primaryFontColor);
            setInviteType(props.currentData.invitation_type ? props.currentData.invitation_type : INVITATION_TYPES.WITH_CONTENT);

            setSelectedValue(localSelectedValue);

            let country = props.currentData.country ? props.currentData.country : '';

            setCountry(country);

            // let sortedStateList = yourhandle.getStatesByShort(country)
            // if (sortedStateList.length > 0) {
            //     setStateList(sortedStateList)
            // }
        } catch (error) {
            let errorObject = {
                methodName: "addOrganisationModal/setPropsToState",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    const calculateRatio = (num_1, num_2) => {
        for (let num = num_2; num > 1; num--) {
            if ((num_1 % num) == 0 && (num_2 % num) == 0) {
                num_1 = num_1 / num;
                num_2 = num_2 / num;
            }
        }
        var ratio = num_1 + ":" + num_2;
        return ratio;
    }

    const saveData = async (ev) => {
        try {

            let formValidateVal = await formValidate();
            if (formValidateVal) {
                globalLoader(true)

                let result;
                let formData = new FormData();
                formData.append('name', name);
                formData.append('address', addressLineOne);
                formData.append('additional_address', addressLineTwo);
                formData.append('country', country);
                //formData.append('state', state);
                formData.append('zip_code', postcode);
                formData.append('city', city);
                formData.append('copyright_text', copyright);
                formData.append('catIds', [...conditionList, ...partnerList, ...treatmentList].toString());
                formData.append('primary_color', primaryColor);
                formData.append('primary_font_color', primaryFontColor);
                formData.append('invitation_type', inviteType);
                fileChange && formData.append('brand_logo', file ? file : '', filename ? filename : '');
                // document.body.style.setProperty('--primary-color', primaryColor);
                // document.body.style.setProperty('--primary-font-color', primaryFontColor);

                if (props.editMode) {

                    let otherApiCall = false;
                    let deletedOrg = [];
                    let newOrg = [];
                    let olderOrg = [];

                    // fileChange && formData.append('brand_logo', file ? file : '', filename ? filename : '');
                    excelFile && formData.append('bulk_upload', excelFile);
                    patientExcelFile && formData.append('bulk_patient_upload', patientExcelFile);

                    formData.append('organization_id', props.currentData.organization_id);
                    let selectedValue = [...partnerList, ...conditionList, ...treatmentList]
                    selectedValue && selectedValue.length > 0 &&
                        selectedValue.forEach(element => {
                            let newCat = props.currentData.categories.find(x => x.category_id === element);
                            if (!newCat) {
                                newOrg.push(element)
                            }
                        });
                    props.currentData.categories && props.currentData.categories.length > 0 && props.currentData.categories.forEach(element => {
                        olderOrg.push(element.category_id)

                    });
                    let totalOrg = [...newOrg, ...selectedValue];
                    totalOrg = [...new Set(totalOrg)]

                    let deleted = true
                    props.currentData.categories.forEach(element => {
                        deleted = false;

                        let delCat = totalOrg.find(x => x === element.category_id);
                        if (!delCat) {
                            deletedOrg.push(element.category_id)
                        }


                    });
                    if (deletedOrg.length > 0 || props.currentData.categories.length !== selectedValue.length) {
                        otherApiCall = true;
                    }

                    if (otherApiCall) {
                        let mapUserOrgs = {
                            organization_id: props.currentData.organization_id,
                            removedCatIds: deletedOrg.toString(),
                            catIds: newOrg.toString()
                        }
                        let obj = {
                            method: API_METHODS.POST,
                            history: props.history,
                            api: '/edit-organization',
                            body: formData
                        }
                        let obj2 = {
                            method: API_METHODS.POST,
                            history: props.history,
                            api: '/map-categories-organization',
                            body: mapUserOrgs
                        }
                        await Promise.all([CallApiAsync(obj),
                        CallApiAsync(obj2)]).then(res => {

                            result = res[0];

                            if (res[0].data.status === 200 && res[1].data.status) {

                                if (props.roleType == ROLES.SUPER_ADMIN) {
                                    props.onCloseModal('success')
                                }
                                globalLoader(false);
                                globalAlert('success', getResourceValue(props.resources, res[0].data.status.toString()))
                            } else {
                                if (res[0].data?.data?.errors) {

                                    let nameMinLength = getResourceValue(props.resources, "NAME", resourceFields.Min_Length);
                                    let nameMaxLength = getResourceValue(props.resources, "NAME", resourceFields.Max_Length);
                                    let addressMinLength = getResourceValue(props.resources, "ADDRESS1", resourceFields.Min_Length);
                                    let addressMaxLength = getResourceValue(props.resources, "ADDRESS1", resourceFields.Max_Length);
                                    let additionalAddressMaxLength = getResourceValue(props.resources, "ADDRESS2", resourceFields.Max_Length);
                                    let cityMinLength = getResourceValue(props.resources, "CITY", resourceFields.Min_Length);
                                    let cityMaxLength = getResourceValue(props.resources, "CITY", resourceFields.Max_Length);
                                    let zipCodeMinLength = getResourceValue(props.resources, "POSTCODE", resourceFields.Min_Length);
                                    let zipCodeMaxLength = getResourceValue(props.resources, "POSTCODE", resourceFields.Max_Length);
                                    let copyrightTextMaxLength = getResourceValue(props.resources, "COPYRIGHT", resourceFields.Max_Length);

                                    setNameError(getResourceValue(props.resources, res[0].data?.data?.errors?.name).replace('{min_length}', nameMinLength).replace('{max_length}', nameMaxLength));
                                    setAddressLineOneError(getResourceValue(props.resources, res[0].data?.data?.errors?.address).replace('{min_length}', addressMinLength).replace('{max_length}', addressMaxLength))
                                    setAddressLineTwoError(getResourceValue(props.resources, res[0].data?.data?.errors?.additional_address).replace('{max_length}', additionalAddressMaxLength))
                                    setCityError(getResourceValue(props.resources, res[0].data?.data?.errors?.city).replace('{min_length}', cityMinLength).replace('{max_length}', cityMaxLength))
                                    setPostCodeError(getResourceValue(props.resources, res[0].data?.data?.errors?.zip_code).replace('{min_length}', zipCodeMinLength).replace('{max_length}', zipCodeMaxLength))
                                    setCopyRightError(getResourceValue(props.resources, res[0].data?.data?.errors?.copyright_text).replace('{max_length}', copyrightTextMaxLength))
                                    setPatientUploadError(getResourceValue(props.resources, res[0].data?.data?.errors?.bulk_patient_upload).replace("{roleName}", ROLES.PATIENT))
                                    setClinicianUploadError(getResourceValue(props.resources, res[0].data?.data?.errors?.bulk_upload).replace("{roleName}", ROLES.CLINICIAN))
                                }
                                globalLoader(false)
                                globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, res[0].data.status.toString()));
                            }
                        }).catch(err => {
                            // console.log(err)
                        })
                    }
                    else {
                        let obj = {
                            method: API_METHODS.POST,
                            history: props.history,
                            api: '/edit-organization',
                            body: formData
                        }
                        result = await CallApiAsync(obj);


                    }
                }
                else {

                    if (props.roleType == ROLES.SUPER_ADMIN) {
                        let obj = {
                            method: API_METHODS.POST,
                            history: props.history,
                            api: '/add-organization',
                            body: formData
                        }
                        result = await CallApiAsync(obj)
                    }
                    else {
                        globalLoader(false);
                        globalAlert(getResourceValue(props.resources, 'TECHNICAL_ERROR'));
                    }
                }




                if (result) {
                    setBulkPatientFlag(false);
                    setBulkClinicianFlag(false);

                    if (result.data.status === 200) {
                        if (props.roleType == ROLES.SUPER_ADMIN) {
                            props.onCloseModal('success')
                        }
                        globalAlert('success', getResourceValue(props.resources, props.editMode ? 'SUCCESS_UPDATED' : 'SUCCESS_CREATED'));
                        globalLoader(false);

                        if (result?.data?.data?.organization) {
                            localStorage.setItem('orgDetail', JSON.stringify(result?.data?.data?.organization));
                            changeOrgId(result?.data?.data?.organization);
                            document.body.style.setProperty('--primary-color', result?.data?.data?.organization?.primary_color);
                            document.body.style.setProperty('--primary-font-color', result?.data?.data?.organization?.primary_font_color);

                        }

                        if (props.roleType == ROLES.ADMIN) {
                            let bulkUpload = false;

                            if (result.data.data?.bulkPatientFile && result.data.data?.bulkPatientFile != '') {
                                let successCount = result.data.data.patientSuccessCount;
                                let failedCount = result.data.data.patientFailedCount;

                                setPatientStatusFile(result.data.data.bulkPatientFile);
                                setPatientSuccess(successCount);
                                setPatientFailed(failedCount);
                                setBulkPatientFlag(true);
                                setPatientExcelFile(null);

                                bulkUpload = true;
                            }

                            if (result.data.data?.bulkClinicianFile && result.data.data?.bulkClinicianFile != '') {
                                let successCount = result.data.data.clinicianSuccessCount;
                                let failedCount = result.data.data.clinicianFailedCount;

                                setClinicianStatusFile(result.data.data.bulkClinicianFile);
                                setClinicianSuccess(successCount);
                                setClinicianFailed(failedCount);
                                setBulkClinicianFlag(true);
                                setExcelFile(null);

                                bulkUpload = true;
                            }

                            if (bulkUpload) {
                                setBulkUploadFlag(true);
                            }

                        }

                    } else {
                        if (result.data?.data?.errors) {

                            let nameMinLength = getResourceValue(props.resources, "NAME", resourceFields.Min_Length);
                            let nameMaxLength = getResourceValue(props.resources, "NAME", resourceFields.Max_Length);
                            let addressMinLength = getResourceValue(props.resources, "ADDRESS1", resourceFields.Min_Length);
                            let addressMaxLength = getResourceValue(props.resources, "ADDRESS1", resourceFields.Max_Length);
                            let additionalAddressMaxLength = getResourceValue(props.resources, "ADDRESS2", resourceFields.Max_Length);
                            let cityMinLength = getResourceValue(props.resources, "CITY", resourceFields.Min_Length);
                            let cityMaxLength = getResourceValue(props.resources, "CITY", resourceFields.Max_Length);
                            let zipCodeMinLength = getResourceValue(props.resources, "POSTCODE", resourceFields.Min_Length);
                            let zipCodeMaxLength = getResourceValue(props.resources, "POSTCODE", resourceFields.Max_Length);
                            let copyrightTextMaxLength = getResourceValue(props.resources, "COPYRIGHT", resourceFields.Max_Length);

                            setNameError(getResourceValue(props.resources, result.data?.data?.errors?.name).replace('{min_length}', nameMinLength).replace('{max_length}', nameMaxLength))
                            setAddressLineOneError(getResourceValue(props.resources, result.data?.data?.errors?.address).replace('{min_length}', addressMinLength).replace('{max_length}', addressMaxLength))
                            setAddressLineTwoError(getResourceValue(props.resources, result.data?.data?.errors?.additional_address).replace('{max_length}', additionalAddressMaxLength))
                            setCityError(getResourceValue(props.resources, result.data?.data?.errors?.city).replace('{min_length}', cityMinLength).replace('{max_length}', cityMaxLength))
                            setPostCodeError(getResourceValue(props.resources, result.data?.data?.errors?.zip_code).replace('{min_length}', zipCodeMinLength).replace('{max_length}', zipCodeMaxLength))
                            setCopyRightError(getResourceValue(props.resources, result.data?.data?.errors?.copyright_text).replace('{max_length}', copyrightTextMaxLength))
                            setPatientUploadError(getResourceValue(props.resources, result.data?.data?.errors?.bulk_patient_upload).replace("{roleName}", getResourceValue(props.resources, ROLES.PATIENT).toLowerCase()))
                            setClinicianUploadError(getResourceValue(props.resources, result.data?.data?.errors?.bulk_upload).replace("{roleName}", getResourceValue(props.resources, ROLES.CLINICIAN).toLowerCase()))
                        }

                        globalLoader(false)
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()))
                    }



                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "addOrganisationModal/saveData",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const setAlphaNumberValue = (value, Callbacks) => {

        var containsNumber = /^([a-zA-Z0-9 _]+)$/;

        if (containsNumber.test(value) || value === '') {
            Callbacks(value)
        }
        else {
            return false
        }


    }

    const formValidate = async () => {
        let formValid = true;

        // remove error
        setPatientUploadError('');
        setClinicianUploadError('');

        let nameMinLength = getResourceValue(props.resources, "NAME", resourceFields.Min_Length);
        let nameMaxLength = getResourceValue(props.resources, "NAME", resourceFields.Max_Length);
        let addressMinLength = getResourceValue(props.resources, "ADDRESS1", resourceFields.Min_Length);
        let addressMaxLength = getResourceValue(props.resources, "ADDRESS1", resourceFields.Max_Length);
        let additionalAddressMaxLength = getResourceValue(props.resources, "ADDRESS2", resourceFields.Max_Length);
        let cityMinLength = getResourceValue(props.resources, "CITY", resourceFields.Min_Length);
        let cityMaxLength = getResourceValue(props.resources, "CITY", resourceFields.Max_Length);
        let zipCodeMinLength = getResourceValue(props.resources, "POSTCODE", resourceFields.Min_Length);
        let zipCodeMaxLength = getResourceValue(props.resources, "POSTCODE", resourceFields.Max_Length);
        let copyrightTextMaxLength = getResourceValue(props.resources, "COPYRIGHT", resourceFields.Max_Length);

        if (!name) {
            formValid = false;
            //setEmptyName(true)
            setNameError(getResourceValue(props.resources, 'FIELD_REQUIRED'))
        } else if (name.length == 0) {
            formValid = false;
            setNameError(getResourceValue(props.resources, 'FIELD_REQUIRED'))
        } else if (name.length > nameMaxLength) {
            formValid = false;
            setNameError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', nameMinLength).replace('{max_length}', nameMaxLength))
        } else {
            setNameError('')
        }

        if (copyright.length > copyrightTextMaxLength) {
            formValid = false;
            setCopyRightError(getResourceValue(props.resources, 'FIELD_LENGTH').replace('{max_length}', copyrightTextMaxLength))
        }

        if (!addressLineOne) {
            formValid = false;
            //setEmptyAddressLineOne(true)
            setAddressLineOneError(getResourceValue(props.resources, 'FIELD_REQUIRED'))
        } else if (addressLineOne.length == 0) {
            formValid = false;
            setAddressLineOneError(getResourceValue(props.resources, 'FIELD_REQUIRED'))
        } else if (addressLineOne.length > addressMaxLength) {
            formValid = false;
            setAddressLineOneError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', addressMinLength).replace('{max_length}', addressMaxLength))
        } else {
            setAddressLineOneError('')
        }

        if (addressLineTwo.length > additionalAddressMaxLength) {
            formValid = false;
            setAddressLineTwoError(getResourceValue(props.resources, 'FIELD_LENGTH').replace('{max_length}', additionalAddressMaxLength))
        } else {
            setAddressLineTwoError('')
        }

        if (!country) {
            formValid = false;
            setEmptyCountry(true)
        }

        if (!city) {
            formValid = false;
            setEmptyCity(true)
            setCityError(getResourceValue(props.resources, 'FIELD_REQUIRED'))
        } else if (city.length > cityMaxLength) {
            formValid = false;
            setCityError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', cityMinLength).replace('{max_length}', cityMaxLength))
        } else {
            setCityError('')
        }

        let zipcode = postcode;
        zipcode = zipcode.replace(/\s/g, '');

        if (!zipcode) {
            formValid = false;
            setPostCodeError(getResourceValue(props.resources, 'FIELD_REQUIRED'));
        }
        else if (zipcode.length < zipCodeMinLength || zipcode.length > zipCodeMaxLength) {
            formValid = false;
            setPostCodeError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', zipCodeMinLength).replace('{max_length}', zipCodeMaxLength));
        } else if (postcode.length < zipCodeMinLength || postcode.length > 30) {
            formValid = false;
            setPostCodeError(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', zipCodeMinLength).replace('{max_length}', '30'));
        } else {
            setPostCodeError('');
        }
        if (partnerList.length <= 0 && conditionList.length <= 0 && treatmentList.length <= 0) {
            formValid = false;
            setEmptyCat(true)
        }
        return formValid
    }

    const pushListItem = (ev) => {
        ev.preventDefault();
    }
    const removeListItem = (index) => {
        let localTypeList = [...typeList];
        localTypeList.splice(index, 1);
        setTypeList(localTypeList)
    }

    const changeFile = async (ev, type, cat = '') => {
        ev.persist();
        try {
            if (type !== "img") {

                if (ev.target.files && ev.target.files.length == 1) {
                    if ((ev.target.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
                        if (ev.target.files[0].size / 1024 == 0) {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "FILE_SIZE_LIMIT"));
                        } else {
                            if (cat === 'patient') {
                                setPatientExcelFile(ev.target.files[0]);
                            }
                            else {
                                setExcelFile(ev.target.files[0]);
                            }
                        }
                    }
                    else {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "EXCEL_FILE_LIMIT"));

                    }


                }
            }
            else {

                if (ev.target.files && ev.target.files.length > 0) {
                    let fileType = ev.target.files[0].type.split("/");
                    let imgFile = ev.target.files[0];
                    let imgRatio = await getImageAspectRatio(imgFile)
                    let imgHeight = imgRatio.height;
                    let imgWidth = imgRatio.width;
                    if (ImageFileTypes.includes(fileType[1].toLowerCase())) {

                        let minLength = getResourceValue(props.resources, 'ASPECT_RATIO', resourceFields.Min_Length);
                        let maxLength = getResourceValue(props.resources, 'ASPECT_RATIO', resourceFields.Max_Length);

                        if (ev.target.files[0].size / 1024 == 0) {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "FILE_SIZE_LIMIT"));
                        }
                        else if (calculateRatio(imgHeight, imgWidth) !== calculateRatio(minLength, maxLength)) {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, 'ASPECT_RATIO_VALIDATION'));
                        }
                        else {
                            setFile(ev.target.files[0]);
                            setFileName(ev.target.files[0].name);
                            setFileChanged(true)
                        }
                    }
                    else {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "IMAGE_FILES_VALIDATION"));
                    }

                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "addOrganisationModal/changeFile",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }
    const getImageAspectRatio = (file) => {
        return new Promise((resolve) => {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                var image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    resolve(this);
                };
            }
        })
    }
    const downloadFormatFile = (ev) => {
        window.open(`${GLOBAL_API}/uploads/sample.xlsx`);
    }
    const onSelect = (selectedList, selectedItem) => {
        setSelectedValue(...selectedList)
    }
    const onRemove = (selectedList, removedItem) => {
        setSelectedValue(selectedList)
    }

    const downloadPatientFormatFile = (ev) => {
        window.open(`${GLOBAL_API}/uploads/patient_sample.xlsx`);
    }

    const handleChangeMultiple = idArray => {

        if (idArray.length > 0) {
            let val = [];
            idArray.forEach(element => {
                let ele = options.find(x => x.category_id === element)
                if (ele) {
                    val.push(ele.category_name)

                }

            });
            return val.toString()
        }
    };
    const changeValue = (ev) => {

        let name = ev.target.name;
        let value = ev.target.value;


        // this.setState({
        //     [name]: value,
        // })

    }

    const setCountryFunc = (val) => {
        let sortedStateList = yourhandle.getStatesByShort(val)

        if (sortedStateList.length > 0) {
            setCountry(val)
            //setState('')
            //setStateList(sortedStateList)
            // this.setState({
            //     [name]: value,
            //     stateProvince: '',
            //     stateList: sortedStateList,

            // })
        }
        else {
            setCountry(val)
            //setState('')

        }
    }
    const removeExcel = (cat) => {
        if (cat === 'patient') {
            setPatientExcelFile(null);
            setPatientUploadError('');

        }
        else {
            setExcelFile(null);
            setClinicianUploadError('');
        }

    }

    const catSelectList = (ev) => {
        try {

            if (props.roleType == ROLES.SUPER_ADMIN) {

                let name = ev.target.name;
                let val = ev.target.value;


                //check if 0 is included, that remove it. 0 -> No items found
                if (val.includes(0)) {
                    const index = val.indexOf(0);
                    if (index >= 0) {
                        val.splice(index, 1);
                    }
                }

                // get all category id
                let allCategory = allCategories.find(e => e.parent_category_name == name);
                let allCatId = allCategory.category_id;

                // check if user has selected all
                if (val.length > 0 && val.includes(allCatId)) {

                    let localArr = [];
                    localArr.push(allCatId);

                    if (name === 'Condition') {


                        //check if user wants to uncheck or check
                        if (allConditionSelected) {
                            let conditions = options.filter(x => x.parent_category_name.toString().toLowerCase() === "condition").map(x => x.category_id);
                            conditions = conditions.filter(item => !val.includes(item));

                            setAllConditionSelected(false);
                            setConditionList(conditions);
                        }
                        else {
                            setAllConditionSelected(true);
                            setConditionList(localArr);
                        }

                    }
                    else if (name === 'Treatment') {

                        //check if user wants to uncheck or check
                        if (allTreatmentSelected) {

                            let treatments = options.filter(x => x.parent_category_name.toString().toLowerCase() === "treatment").map(x => x.category_id);;
                            treatments = treatments.filter(item => !val.includes(item));

                            setAllTreatmentSelected(false);
                            setTreatmentList(treatments);
                        }
                        else {
                            setAllTreatmentSelected(true);
                            setTreatmentList(localArr);
                        }

                    }
                    else if (name === 'Partners') {

                        //check if user wants to uncheck or check
                        if (allPartnerSelcted) {

                            let partners = options.filter(x => x.parent_category_name.toString().toLowerCase() === "partners").map(x => x.category_id);;
                            partners = partners.filter(item => !val.includes(item));

                            setAllPartnerSelcted(false);
                            setPartnerList(partners);
                        }
                        else {
                            setAllPartnerSelcted(true);
                            setPartnerList(localArr);
                        }
                    }

                }
                else {
                    if (name === 'Condition') {
                        setAllConditionSelected(false);
                        setConditionList(val);
                    }
                    else if (name === 'Treatment') {
                        setAllTreatmentSelected(false);
                        setTreatmentList(val);
                    }
                    else if (name === 'Partners') {
                        setAllPartnerSelcted(false);
                        setPartnerList(val);
                    }
                }
            }


        } catch (error) {
            let errorObject = {
                methodName: "addOrganisationModal/catSelectList",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    const downloadStatusFile = (type) => {
        const filePath = type == 'clinician' ? clinicianStatusFile : patientStatusFile;

        const url = `${GLOBAL_API}/${filePath}`;
        window.open(url);
    }

    const renderContent = () => {
        return (
            <>
                <form className="  form-own" noValidate autoComplete="off" onSubmit={(ev) => pushListItem(ev)}>

                    <div className="row d-flex justify-content-between pb-3 m-0" >
                        <div className="d-flex" >
                            <p className="login-txt mb-0 d-flex align-self-center font-20 primary-color">{props.editMode ? getResourceValue(props.resources, 'EDIT_ORG') : getResourceValue(props.resources, 'ADD_NEW_ORGANIZATION')} {getResourceValue(props.resources, 'ORGANIZATION')}</p>
                        </div>
                        <div className="btn-wrapper">
                            {props.roleType == ROLES.SUPER_ADMIN && <button type="button" className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, 'CANCEL')}</button>}
                            <button type="submit" onClick={saveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, 'SAVE')}</button>
                        </div>
                    </div>

                    <div className="content-container mb-10">


                        <div className="row p-0 m-0" >
                            <div className="col-md-6 col-12 cpt-10 cpl-10 cpr-10" >
                                <div className="form-group" style={{ display: 'unset' }}>
                                    <TextField
                                        label={getResourceValue(props.resources, 'NAME')}
                                        placeholder={getResourceValue(props.resources, 'NAME')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="name"
                                        onChange={(ev) => setName(ev.target.value)}
                                        value={name}
                                    />

                                    <div className="error-wrapper">
                                        {/* {emptyName && !name ? <span >Name is empty</span> : null} */}
                                        {nameError}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 col-12 cpt-10 cpl-10 cpr-10" >
                                <div className="form-group" style={{ display: 'unset' }}>
                                    <TextField

                                        label={getResourceValue(props.resources, 'COPYRIGHT')}
                                        placeholder={getResourceValue(props.resources, 'COPYRIGHT')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="name"
                                        onChange={(ev) => setCopyright(ev.target.value)}
                                        value={copyright}
                                    />
                                    <div className="error-wrapper">
                                        {copyRightError}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 col-12 cpt-10 cpl-10 cpr-10" >
                                <div className=" form-group " style={{ display: 'unset' }}>
                                    <TextField
                                        label={getResourceValue(props.resources, 'ADDRESS1')}
                                        placeholder={getResourceValue(props.resources, 'ADDRESS1')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"

                                        onChange={(ev) => setAddressLineOne(ev.target.value)}
                                        value={addressLineOne}
                                    />

                                    <div className="error-wrapper">
                                        {/* {emptyAddressLineOne && !addressLineOne ? <span >Name is empty</span> : null} */}
                                        {addressLineOneError}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 col-12 cpt-10 cpl-10 cpr-10" >
                                <div className="form-group" style={{ display: 'unset' }}>
                                    <TextField
                                        label={getResourceValue(props.resources, 'ADDRESS2')}
                                        placeholder={getResourceValue(props.resources, 'ADDRESS2')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        onChange={(ev) => setAddressLineTwo(ev.target.value)}
                                        value={addressLineTwo}
                                    />

                                    <div className="error-wrapper">
                                        {addressLineTwoError}
                                    </div>
                                </div>
                            </div>
                            <div className=" col-md-6 col-12 cpt-10 cpl-10 cpr-10" >
                                <div className="form-group" style={{ display: 'unset' }}>
                                    <TextField
                                        label={getResourceValue(props.resources, 'CITY')}
                                        placeholder={getResourceValue(props.resources, 'CITY')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="name"
                                        onChange={(ev) => setCity(ev.target.value)}
                                        value={city}
                                    />

                                    <div className="error-wrapper">
                                        {/* {emptyCity && !city ? <span >City is empty</span> : null} */}
                                        {cityError}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 col-12  cpt-10 cpl-10 cpr-10" >
                                <div className="form-group" style={{ display: 'unset' }}>
                                    <TextField
                                        label={getResourceValue(props.resources, 'POSTCODE')}
                                        placeholder={getResourceValue(props.resources, 'POSTCODE')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="name"
                                        onChange={(ev) => setPostcode(ev.target.value)}
                                        value={postcode}
                                        inputProps={{
                                            className: 'text-uppercase',
                                        }}
                                    />

                                    <div className="error-wrapper">
                                        {/* {emptyPostCode && !postcode ? <span >Postcode is empty</span> : null} */}
                                        {/* {minPostcode && postcode.length < 6 && <div>Minimum 6 digit required</div>} */}
                                        {postCodeError}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 col-12  cpt-10 cpl-10 cpr-10">
                                <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                    <FormControl variant="outlined">
                                        <InputLabel id="country-label" style={{ top: 5 }}>{getResourceValue(props.resources, 'COUNTRY')}</InputLabel>
                                        <Select
                                            labelId="country-label"
                                            id="demo-simple-select-outlined"
                                            value={country}
                                            onChange={(ev) => setCountryFunc(ev.target.value)}
                                            label="Country"
                                            name="country"
                                        >
                                            {countryList && countryList.length > 0 && countryList.map((countries, index) => (
                                                <MenuItem value={countries.shortName} key={index}>{countries.name}</MenuItem>

                                            ))}

                                        </Select>
                                    </FormControl>
                                    <div className="error-wrapper">
                                        {emptyCountry && !country ? <span >{getResourceValue(props.resources, "IMAGE_FILES_VALIDATION")}</span> : null}
                                    </div>
                                </div>
                                <div className="col-md-12 col-12 p-0 cmt-10">
                                    <div className="position-relative upload-brand-logo">
                                        <input
                                            type="file"
                                            onChange={(ev) => changeFile(ev, 'img')}
                                            accept=".png,.jpeg,.jpg"
                                            title={filename ? filename : getResourceValue(props.resources, 'NO_FILE')}
                                        />

                                        <div className="upload-wrapper d-flex justify-content-center cpl-20 cpr-20">

                                            <div className="upload-img-wrapper d-flex align-self-center" style={{ marginTop: -10 }}>
                                                <img src="/assets/img/upload-img.png" alt="logo" />
                                            </div>
                                            <div className="cpl-20 cpt-20" >
                                                <div className={`own-custom-labelmt-1 font-600 ${filename ? "active" : ''}`}>
                                                    {filename ? getResourceValue(props.resources, 'CHANGE') : getResourceValue(props.resources, 'UPLOAD')} {getResourceValue(props.resources, 'LOGO')}
                                                </div>
                                                {/* <p className={`own-custom-label mb-0`} style={{ fontSize: 12 }}>
                                                    {getResourceValue(props.resources, 'LOGO_DESCRIPTION')}
                                                </p> */}
                                                <p className={`own-custom-label mb-0`} style={{ fontSize: 12 }}>
                                                    {getResourceValue(props.resources, 'ASPECT_RATIO')}
                                                </p>
                                                <p className="py-3 primary-color font-600 mb-0">
                                                    {filename}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 col-12 cpl-10 cpr-10">
                                <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                    <CustomColorPicker
                                        pickerName={getResourceValue(props.resources, 'PRIMARY_COLOR')}
                                        defaultColor={primaryColor}
                                        onColorChange={(color) => setPrimaryColor(color)}
                                    />

                                    {/* Primary font color selector */}
                                    <CustomColorPicker
                                        pickerName={getResourceValue(props.resources, 'PRIMARY_FONT_COLOR')}
                                        defaultColor={primaryFontColor}
                                        onColorChange={(color) => setPrimaryFontColor(color)}
                                    />
                                </div>
                                <div className="col-md-12 col-12  p-0 cmt-10" >
                                    <div className="form-group" style={{ display: 'unset' }}>
                                        <p className="font-12 m-0">{getResourceValue(props.resources, 'INVITATION_LABEL')}</p>
                                        <div className="row">
                                            <div className="col-12">
                                                <RadioGroup name="lockContent" className="flex-row" value={inviteType} >
                                                    <div>
                                                        <FormControlLabel value={INVITATION_TYPES.IMMEDIATELY} control={<Radio onChange={(ev) => setInviteType(INVITATION_TYPES.IMMEDIATELY)} />} label={getResourceValue(props.resources, 'INVITE_IMMEDIATELY')} />
                                                    </div>
                                                    <div>
                                                        <FormControlLabel value={INVITATION_TYPES.WITH_CONTENT} control={<Radio onChange={(ev) => setInviteType(INVITATION_TYPES.WITH_CONTENT)} />} label={getResourceValue(props.resources, 'INVITE_WITH_CONTENT')} />
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* Primary color selector */}




                            <div className="col-12 own-multiselct-custom cpl-10 cpr-10 cpt-10" >
                                <h2 className="font-16 font-600">{getResourceValue(props.resources, 'CATEGORIES')}</h2>

                                <div className="form-group-icon form-group cpt-20 cpl-10 cpr-10" style={{ display: 'contents' }}>
                                    <FormControl variant="outlined" style={{ paddingTop: 5, paddingBottom: 5 }}>
                                        <InputLabel id="categories-label" style={{ top: 5 }}>{getResourceValue(props.resources, 'CONDITION')}</InputLabel>
                                        <Select
                                            labelId="categories-label"
                                            value={conditionList}
                                            onChange={(ev) => catSelectList(ev)}
                                            label={getResourceValue(props.resources, 'CONDITION')}
                                            multiple
                                            name="Condition"
                                            renderValue={
                                                (arr) => handleChangeMultiple(arr)
                                            }
                                        >

                                            {(props.roleType == ROLES.SUPER_ADMIN && conditionCatCount > 0) &&
                                                <MenuItem value={conditionAll.category_id}>
                                                    <Checkbox checked={allConditionSelected} />

                                                    {conditionAll.category_name}
                                                </MenuItem>
                                            }

                                            {
                                                conditionCatCount < 1 &&
                                                <MenuItem value={0}>
                                                    {getResourceValue(props.resources, "NO_RECORDS")}
                                                </MenuItem>

                                            }

                                            {conditionCatCount > 0 && options && options.length > 0 && options.map((organizations, index) => (
                                                organizations.parent_category_name === "Condition" && organizations.all == 0 &&

                                                <MenuItem value={organizations.category_id} key={index}>
                                                    {props.roleType == ROLES.SUPER_ADMIN && <Checkbox checked={conditionList.indexOf(organizations.category_id) > -1 || allConditionSelected} />}
                                                    {/* <ListItemText primary={organizations.name} /> */}
                                                    {organizations.category_name}
                                                </MenuItem>

                                            ))}

                                        </Select>
                                    </FormControl>

                                </div>
                                <div className="form-group-icon form-group cpt-20 cpl-10 cpr-10" style={{ display: 'contents' }} >

                                    <FormControl variant="outlined" style={{ paddingTop: 5, paddingBottom: 5 }}>
                                        <InputLabel id="categories-label" style={{ top: 5 }}>{getResourceValue(props.resources, 'TREATMENT')}</InputLabel>
                                        <Select
                                            labelId="categories-label"
                                            value={treatmentList}
                                            onChange={(ev) => catSelectList(ev)}
                                            label={getResourceValue(props.resources, 'TREATMENT')}
                                            multiple
                                            name="Treatment"
                                            renderValue={
                                                (arr) => handleChangeMultiple(arr)
                                            }
                                        // renderValue={(selected) => selected.join(', ')}
                                        >
                                            {(props.roleType == ROLES.SUPER_ADMIN && treatmentCatCount > 0) &&
                                                <MenuItem value={treatmentAll.category_id}>
                                                    <Checkbox checked={allTreatmentSelected} />

                                                    {treatmentAll.category_name}
                                                </MenuItem>
                                            }

                                            {treatmentCatCount < 1 &&
                                                <MenuItem value={0}>
                                                    {getResourceValue(props.resources, "NO_RECORDS")}
                                                </MenuItem>
                                            }

                                            {treatmentCatCount > 0 && options && options.length > 0 && options.map((organizations, index) => (
                                                organizations.parent_category_name === "Treatment" && organizations.all == 0 &&

                                                <MenuItem value={organizations.category_id} key={index}>
                                                    {props.roleType == ROLES.SUPER_ADMIN && <Checkbox checked={treatmentList.indexOf(organizations.category_id) > -1 || allTreatmentSelected} />}
                                                    {/* <ListItemText primary={organizations.name} /> */}
                                                    {organizations.category_name}
                                                </MenuItem>

                                            ))}
                                        </Select>
                                    </FormControl>

                                </div>
                                <div className="form-group-icon form-group cpt-20 cpl-10 cpr-10" style={{ display: 'contents' }}>

                                    <FormControl variant="outlined" style={{ paddingTop: 5, paddingBottom: 5 }}>
                                        <InputLabel id="categories-label" style={{ top: 5 }}>{getResourceValue(props.resources, 'PARTNERS')}</InputLabel>
                                        <Select
                                            labelId="categories-label"
                                            value={partnerList}
                                            onChange={(ev) => catSelectList(ev)}
                                            label={getResourceValue(props.resources, 'PARTNERS')}
                                            multiple
                                            name="Partners"
                                            renderValue={
                                                (arr) => handleChangeMultiple(arr)
                                            }
                                        // renderValue={(selected) => selected.join(', ')}
                                        >
                                            {(props.roleType == ROLES.SUPER_ADMIN && partnersCatCount > 0) &&
                                                <MenuItem value={partnersAll.category_id}>
                                                    <Checkbox checked={allPartnerSelcted} />

                                                    {partnersAll.category_name}
                                                </MenuItem>
                                            }

                                            {
                                                partnersCatCount < 1 &&
                                                <MenuItem value={0}>
                                                    {getResourceValue(props.resources, "NO_RECORDS")}
                                                </MenuItem>

                                            }

                                            {partnersCatCount > 0 && options && options.length > 0 && options.map((organizations, index) => (
                                                organizations.parent_category_name === "Partners" && organizations.all == 0 &&

                                                <MenuItem value={organizations.category_id} key={index}>
                                                    {props.roleType == ROLES.SUPER_ADMIN && <Checkbox checked={partnerList.indexOf(organizations.category_id) > -1 || allPartnerSelcted} />}
                                                    {/* <ListItemText primary={organizations.name} /> */}
                                                    {organizations.category_name}
                                                </MenuItem>

                                            ))}
                                        </Select>
                                    </FormControl>
                                    <div className="error-wrapper pt-2">
                                        {emptyCat && (partnerList.length <= 0 && conditionList.length <= 0 && treatmentList.length <= 0) && <span >{getResourceValue(props.resources, 'FIELD_CATEGORY')}</span>}
                                    </div>
                                </div>
                            </div>


                            {
                                props.roleType == ROLES.ADMIN &&
                                /* Clinician bulk upload */
                                <div className="form-group col-12  upload-bulk-user cpl-10  cpr-10">
                                    <div className="d-flex flex-wrap align-items-center">
                                        <div className="font-600 font-16 flex-1">
                                            {getResourceValue(props.resources, "CLINICIAN_BULK_UPLOAD")}
                                        </div>
                                        <div className="download-btn-wrapper">
                                            <button type="button" className="btn btn-own-primary mw-100" onClick={downloadFormatFile}>{getResourceValue(props.resources, "CLINICIAN_TEMPLATE")}</button>
                                        </div>

                                    </div>

                                    <div className="upload-btn-wrapper" style={{ marginTop: -10 }}>
                                        <div className="upload-btn ">
                                            <div className="upload-btn-txt btn">
                                                {excelFile ? getResourceValue(props.resources, 'CHANGE_FILE') : "+" + getResourceValue(props.resources, 'ADD_FILES')}
                                            </div>
                                            <div className={`own-custom-label`}>
                                                {getResourceValue(props.resources, "UPLOADABLE_EXCEL_FILE")}
                                            </div>

                                            <input type="file" onClick={e => (e.target.value = null)} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="upload-input cursor"
                                                onChange={(ev) => changeFile(ev, 'xlsx')} title={excelFile ? excelFile.name : getResourceValue(props.resources, 'NO_FILE')} />
                                        </div>
                                        {excelFile &&

                                            <div className="pt-3 d-flex flex-wrap" >
                                                <div className="flex-1 mr-3">
                                                    {getResourceValue(props.resources, 'FILENAME')} :- <span className="font-600 primary-color">{excelFile.name}</span>
                                                </div>
                                                <div className="cross-icon-wrapper cursor" onClick={removeExcel}>
                                                    <img src="/assets/img/icons/cross.svg" alt="cross-icon" />
                                                </div>
                                            </div>}
                                        <div className="error-wrapper pt-2">
                                            {clinicianUploadError !== '' && <span >{clinicianUploadError}</span>}
                                        </div>
                                    </div>

                                </div>
                            }

                            {
                                props.roleType == ROLES.ADMIN &&
                                /* Patient bulk upload */
                                <div className="form-group col-12 upload-bulk-user cpl-10  cpr-10">
                                    <div className="d-flex flex-wrap align-items-center">
                                        <div className="font-600 font-16 flex-1">
                                            {getResourceValue(props.resources, "PATIENT_BULK_UPLOAD")}
                                        </div>
                                        <div className="download-btn-wrapper">
                                            <button type="button" className="btn btn-own-primary mw-100" onClick={downloadPatientFormatFile}>{getResourceValue(props.resources, "PATIENT_TEMPLATE")}</button>
                                        </div>

                                    </div>

                                    <div className="upload-btn-wrapper" style={{ marginTop: -10 }}>
                                        <div className="upload-btn ">
                                            <div className="upload-btn-txt btn">
                                                {patientExcelFile ? getResourceValue(props.resources, 'CHANGE_FILE') : "+" + getResourceValue(props.resources, 'ADD_FILES')}
                                            </div>
                                            <div className={`own-custom-label`}>
                                                {getResourceValue(props.resources, "UPLOADABLE_EXCEL_FILE")}
                                            </div>

                                            <input type="file" onClick={e => (e.target.value = null)} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="upload-input cursor"
                                                onChange={(ev) => changeFile(ev, 'xlsx', 'patient')} title={patientExcelFile ? patientExcelFile.name : getResourceValue(props.resources, 'NO_FILE')} />
                                        </div>
                                        {patientExcelFile &&

                                            <div className="pt-3 d-flex flex-wrap">
                                                <div className="flex-1 mr-3">
                                                    {getResourceValue(props.resources, 'FILENAME')} :- <span className="font-600 primary-color">{patientExcelFile.name}</span>
                                                </div>
                                                <div className="cross-icon-wrapper cursor" onClick={() => removeExcel('patient')}>
                                                    <img src="/assets/img/icons/cross.svg" alt="cross-icon" />
                                                </div>
                                            </div>}
                                        <div className="error-wrapper pt-2">
                                            {patientUploadError !== '' && <span >{patientUploadError}</span>}
                                        </div>
                                    </div>

                                </div>
                            }

                        </div>


                        {/* <div className="border-bottom-own col-12  mb-3"></div> */}



                    </div>
                </form>
            </>
        )
    };

    return (
        <div>

            {
                props.roleType == ROLES.SUPER_ADMIN ? (
                    <Modal classNames={{ modal: "modal-lg-full modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={false} >
                        {renderContent()}
                    </Modal>
                ) : (
                    renderContent()
                )
            }

            {bulkUploadFlag ?
                <Modal classNames={{ modal: "modal-lg-full modal-own" }} open={bulkUploadFlag}
                    onClose={() => setBulkUploadFlag(false)} center showCloseIcon={true} closeOnOverlayClick={false} closeIcon={''}>
                    <div className="px-3 py-3">
                        <h5 className="pt-3 pb-2">{getResourceValue(props.resources, 'UPLOAD_STATUS')}</h5>

                        {
                            bulkClinicianFlag &&
                            <>
                                <p className="mb-3 pb-1 font-14"><strong>{getResourceValue(props.resources, 'CLINICIAN')} </strong></p>
                                <p className="mb-3 pb-1 font-14">{getResourceValue(props.resources, 'SUCCESS_TEXT')} : {clinicianSuccess}, {getResourceValue(props.resources, 'FAILED_TEXT')} : {clinicianFailed}</p>
                            </>
                        }

                        {
                            bulkPatientFlag &&
                            <>
                                <p className="mb-3 pb-1 font-14"><strong>{getResourceValue(props.resources, 'PATIENT')} </strong></p>
                                <p className="mb-3 pb-1 font-14">{getResourceValue(props.resources, 'SUCCESS_TEXT')} : {patientSuccess}, {getResourceValue(props.resources, 'FAILED_TEXT')} : {patientFailed}</p>
                            </>
                        }

                        <p className="mb-3 pb-1 font-14"><strong>{getResourceValue(props.resources, 'DOWNLOAD_TEXT')} </strong></p>

                        <div className="pb-3 btn-wrapper px-0 col-12 pt-3">
                            {
                                bulkClinicianFlag && <button type="button" onClick={() => downloadStatusFile('clinician')} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mr-3 mw-100">{getResourceValue(props.resources, 'CLINICIAN_UPLOAD_STATUS')}</button>
                            }

                            {
                                bulkPatientFlag && <button type="button" onClick={() => downloadStatusFile('patient')} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, 'PATIENT_UPLOAD_STATUS')}</button>
                            }

                        </div>
                    </div>
                </Modal> : null}

        </div>

    )
})


const mapStateToProps = (state) => ({
    orgId: state.user.orgId,
});

export default connect(mapStateToProps)(withRouter(AddOrganisationModal));