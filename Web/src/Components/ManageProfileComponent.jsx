import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { format } from "date-fns";
import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { changeOpenComponent, errorLogger, globalAlert, globalLoader, organizationsArray, storeActivateParam, verifyRoute, setUserDetail, otherUserData } from '../actions/commonActions';
import { ACTIONS, API_METHODS, CONSTANTS, INVITATION_TYPES, resourceFields, resourceGroups, RESOURCE_KEYS, ROLES, salutationArray, HCP_LIST, AOP_LIST, USER_STATUS } from '../Constants/types';
import StaticPage from '../Pages/staticPage';
import { CallApiAsync, getResourceValue, sessionSetup } from '../Functions/CommonFunctions';
import TagComponent from '../Components/TagComponent';
import { appstore } from '../store/index';
const yourhandle = require('countrycitystatejson');

class ManageProfileComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            emailId: '',
            securityCode: '',
            firstName: '',
            confirmPassword: '',
            emptyFirstName: false,
            lastName: '',
            emptyLastName: false,
            country: 'GB',
            emptyCountry: false,
            city: '',
            emptyCity: false,
            stateProvince: '',
            mobile: '',
            emptyMobile: false,
            zipcode: '',
            nhsNumber: '',
            emptyZipcode: false,
            minPostcode: false,
            emptyStateProvince: false,
            emptyPassword: false,
            passwordVisible: false,
            confirmPasswordVisible: false,
            stateProvinceIndex: null,
            passwordValid: false,
            areaOfPractice: '',
            emptyAreaOfPractice: false,
            hcpList: '',
            emptyHcpList: false,
            hcpValueIndex: null,
            aopValueIndex: null,
            organizationsList: '',
            emptyorganizationsList: false,
            countryList: [],
            stateList: [],
            subscribed: false,
            firstNameError: '',
            lastNameError: '',
            nhsNumberError: '',
            mobileError: '',
            cityError: '',
            postCodeError: '',
            dateOfBirthError: '',
            errorTagMessage: '',
            startDate: null,
            valueInDate: false,
            formattedDate: "",
            filteredList: salutationArray,
            title: '',
            titleError: '',
            userOrgid: 0,
            languageId: props.languageId,
            manageProfileResources: [],
            nhsNumber: '',
            tagData: {},
            isCheckedTermOfUse: false,
            isCheckedAllowToUse: false,
            isIframeOpen: false,

            emptyDob: false,
            newPassword: '',
            confirmPassword: '',
            newPasswordVisible: false,
            confirmPasswordVisible: false,
            notMatchPassword: false,
            minEightChar: false,
            oneVarIncluded: false,
            numberIncluded: false,
            specialCharacter: false,
            passwordErrorMessage: '',
            newPasswordError: '',
            confirmPasswordError: '',
            otpErr: '',
        }
    }

    componentDidMount = async () => {
        try {
            globalLoader(true);
            let localUserData = this.props.userData;
            let orgid = this.props.orgId?.organization_id ? this.props.orgId?.organization_id : 0;
            this.setState({ userOrgid: orgid });
            this.getManageProfileResources();
            if (this.props.currentAction != ACTIONS.CREATE) {
                this.basicApiCall();
            } else {
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: '/get-jobtitles-specialties',
                }
                let result = await CallApiAsync(obj);
                if (result.data.status === 200) {
                    appstore.dispatch({
                        type: HCP_LIST,
                        payload: result.data.data.jobTitles,
                    });
                    appstore.dispatch({
                        type: AOP_LIST,
                        payload: result.data.data.specialities,
                    });
                }
                let userInfo = this.props.userInfo;
                this.setState({
                    emailId: userInfo.email ? userInfo.email : "",
                    nhsNumber: userInfo.nhs_number ? userInfo.nhs_number : "",
                    firstName: userInfo.first_name ? userInfo.first_name : "",
                    lastName: userInfo.last_name ? userInfo.last_name : ""
                });
            }

            let sortedCountries = yourhandle.getCountries();
            sortedCountries.sort((a, b) => (a.name > b.name) ? 1 : -1);
            this.setState({ countryList: sortedCountries });

            if (localUserData?.date_of_birth && localUserData?.date_of_birth != "null") {
                this.setState({ startDate: new Date(localUserData?.date_of_birth) })
            } else if (this.props.userInfo && this.props.userInfo.date_of_birth && this.props.userInfo.date_of_birth != "null") {
                this.setState({ startDate: new Date(this.props.userInfo.date_of_birth) })
            }
            else {
                if (this.props.roleType != ROLES.PATIENT) {
                    this.setState({ startDate: new Date().setFullYear(new Date().getFullYear() - 16), valueInDate: true });
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageProfile/componentDidMount",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    componentDidUpdate() {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getManageProfileResources() });
        }
    }


    /**
     * Forgot password resources
     */
    getManageProfileResources = async () => {
        try {
            globalLoader(true);
            let languageId = this.state.languageId;
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.COMMON, resourceGroups.CREATE_PROFILE, resourceGroups.UPLOAD_MEDIA, resourceGroups.ACTIVATE_USER, resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.UNLOCK_DECK, resourceGroups.PATIENT_DASHBOARD, resourceGroups.FEATURE_MENU, resourceGroups.CREATE_PROFILE],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ manageProfileResources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.manageProfileResources, resourcesResult.data.status.toString()));
            }
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "manageProfile/getManageProfileResources",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    setPropsToState = () => {

        try {
            let localUserData = this.props.userDetail;

            if (this.props.currentAction !== ACTIONS.CREATE) {
                let localStateProvinceIndex;
                let localHcpValueIndex;
                let localAopValueIndex;
                let localOrganizationsList;
                if (this.props.currentAction === ACTIONS.MANAGE_USER) {
                    localUserData = this.props.otherUserData;
                }
                if (localUserData.organizations && localUserData.organizations.length > 0) {
                    localOrganizationsList = localUserData.organizations;
                }

                this.setState({
                    emailId: localUserData.email,
                    firstName: localUserData && localUserData.first_name ? localUserData.first_name : '',
                    lastName: localUserData && localUserData.last_name ? localUserData.last_name : '',
                    zipcode: localUserData && localUserData.zip_code ? localUserData.zip_code : '',
                    mobile: localUserData && localUserData.mobile ? localUserData.mobile : '',
                    nhsNumber: localUserData && localUserData.nhs_number ? localUserData.nhs_number : '',
                    city: localUserData && localUserData.city ? localUserData.city : '',
                    country: localUserData && localUserData.country ? localUserData.country : 'GB',
                    stateProvince: localUserData && localUserData.state ? localUserData.state : '',
                    hcpList: localUserData && localUserData.job_title_id ? localUserData.job_title_id : '',
                    areaOfPractice: localUserData && localUserData.specialty_id ? localUserData.specialty_id : '',
                    stateProvinceIndex: localStateProvinceIndex ? localStateProvinceIndex : '',
                    hcpValueIndex: localHcpValueIndex,
                    aopValueIndex: localAopValueIndex,
                    organizationsList: localOrganizationsList ? localOrganizationsList[0] : '',
                    subscribed: localUserData ? localUserData.subscribed : false,
                    title: localUserData?.title ? localUserData?.title : '',
                    startDate: (localUserData?.date_of_birth && localUserData?.date_of_birth != "null") ? new Date(localUserData?.date_of_birth) : '',
                    valueInDate: (localUserData?.date_of_birth && localUserData?.date_of_birth != "null") ? true : false
                });

                this.nhsNumberFunc(localUserData && localUserData.nhs_number ? localUserData.nhs_number.toString() : '');
            }
            else {
                this.setState({
                    emailId: localUserData.email,
                    hcpList: localUserData && localUserData?.job_title_id ? localUserData?.job_title_id : '',
                    areaOfPractice: localUserData && localUserData?.specialty_id ? localUserData?.specialty_id : '',
                });

                if (this.props.roleType == ROLES.PATIENT) {
                    this.setState({
                        startDate: localUserData?.date_of_birth ? new Date(localUserData?.date_of_birth) : "",
                        valueInDate: localUserData?.date_of_birth ? true : false,
                    });
                    this.nhsNumberFunc(localUserData && localUserData?.nhs_number ? localUserData?.nhs_number.toString() : '');
                }
            }

        } catch (error) {
            let errorObject = {
                methodName: "manageProfile/setPropsToState",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    nhsNumberFunc = (value) => {
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
                    this.setState({ nhsNumber: newVal.slice(0, 3) + "-" + newVal.slice(3, 6) });
                }
                else if (newVal.length >= 7) {
                    this.setState({ nhsNumber: newVal.slice(0, 3) + "-" + newVal.slice(3, 6) + "-" + newVal.slice(6, 10) })
                }
                else {
                    this.setState({ nhsNumber: newVal });
                }
            }
            else {
                return false
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageProfile/nhsNumberFunc",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    datePickerClicked = () => {
        if (this.props.currentAction !== ACTIONS.MANAGE_USER) {
            this.setState({
                valueInDate: true,
            });
        }
    };

    datePickerValue = () => {
        if (!this.state.startDate) {
            this.setState({
                valueInDate: false,
            });
        }
    };

    dateChange = (date) => {
        this.setState({
            startDate: date,
            formattedDate: format(date, "dd-MM-yyyy"),
        });
    };

    flatMap = (array, fn) => {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            var mapping = array[i];
            if (mapping == '') {
                mapping = fn(array[i]);
            }
            result = result.concat(mapping);
        }
        return result;
    }

    handTermOfUse = () => {
        this.setState({ isCheckedTermOfUse: !this.state.isCheckedTermOfUse, isIframeOpen: !this.state.isIframeOpen });
    }

    getTermOfuseContent = () => {
        let termoFUse = getResourceValue(this.state.manageProfileResources, 'TERMS_OF_USE');
        var callback = this.handTermOfUse;
        return this.flatMap(getResourceValue(this.state.manageProfileResources, 'TERMS_CONDITIONS_PART_ONE').split('{TERMS_OF_USE}'), function (part) {
            return [part, <span onClick={() => callback()} style={{ textDecoration: 'underline' }} >{termoFUse}</span>];
        })

    }

    basicApiCall = async () => {
        try {
            if (localStorage.getItem('token')) {
                let userData;
                let api = "";
                if (this.props.currentAction === ACTIONS.MANAGE_USER) {
                    if (this.props.roleAction == ROLES.SUPER_ADMIN) {
                        api = "/view-superadmin-profile";
                    }
                    if (this.props.roleAction == ROLES.ADMIN) {
                        api = "/view-admin-profile";
                    }
                    if (this.props.roleAction == ROLES.CLINICIAN) {
                        api = "/view-clinician-profile";
                    }
                    if (this.props.roleAction == ROLES.PATIENT) {
                        api = "/view-patient-profile";
                    }
                }
                else {
                    api = "/view-own-profile";
                }
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: api,
                    body: this.props.currentAction === ACTIONS.MANAGE_USER ? {
                        user_id: this.props.currentUserId
                    } : null
                }

                userData = await CallApiAsync(obj);

                if (userData.data.status === 200 && !userData.data.data.userDetails.activation_status && this.props.currentAction === ACTIONS.CREATE) {
                    this.props.history.push(`/`);
                } else {
                    if(obj.api == "/view-own-profile") {
                        setUserDetail(userData.data.data.userDetails);
                    } else {
                        otherUserData(userData.data.data.userDetails);
                    }
                    this.setPropsToState();
                    if (this.props.roleType === ROLES.SUPER_ADMIN && this.props.roleAction == ROLES.ADMIN && this.props.currentAction === ACTIONS.MANAGE_USER) {

                        if (this.props.organizationsArray.length <= 0) {

                            let newObj = {
                                method: API_METHODS.POST,
                                history: this.props.history,
                                api: '/view-organizations',
                            }
                            await CallApiAsync(newObj).then(data => {
                                globalLoader(false)
                                if (data.data.status !== 200) {
                                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.manageProfileResources, data.data.status.toString()))
                                }
                                else {
                                    organizationsArray(data.data.data.organizations)
                                    this.setPropsToState();
                                }
                            });
                        } else {
                            this.setPropsToState();
                            globalLoader(false)
                        }
                    }
                    else if (((this.props.roleType === ROLES.ADMIN && this.props.roleAction == ROLES.CLINICIAN) && this.props.currentAction === ACTIONS.MANAGE_USER) || this.props.roleType === ROLES.CLINICIAN) {
                        if (this.props.aopList.length <= 0) {
                            let obj = {
                                method: API_METHODS.POST,
                                history: this.props.history,
                                api: '/view-specialties',
                                body: {}
                            }
                            let result =  await CallApiAsync(obj);
                            if (result.data.status === 200) {
                                globalLoader(false)
                                if (result.data.status !== 200) {
                                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.manageProfileResources, result.data.status.toString()));
                                }
                                else {
                                    appstore.dispatch({
                                        type: AOP_LIST,
                                        payload: result.data.data.specialities,
                                    });
                                    this.setPropsToState()
                                }
                            }
                        } else {
                            this.setPropsToState();
                            globalLoader(false)
                        }
                        if (this.props.hcpList.length <= 0) {
                            let obj = {
                                method: API_METHODS.POST,
                                history: this.props.history,
                                api: '/view-job-titles',
                                body: {}
                            }
                            let result = await CallApiAsync(obj);
                            if (result.data.status === 200) {
                                globalLoader(false)
                                if (result.data.status !== 200) {
                                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.manageProfileResources, result.data.status.toString()));
                                } else {
                                    appstore.dispatch({
                                        type: HCP_LIST,
                                        payload: result.data.data.jobTitles,
                                    });
                                    this.setPropsToState()
                                }
                            }
                        } else {
                            this.setPropsToState();
                            globalLoader(false)
                        }
                    }
                    else {
                        this.setPropsToState()
                        globalLoader(false)
                    }
                }
                if (userData.data.status !== 200) {
                    this.setPropsToState()
                    globalLoader(false)
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageProfile/basicApiCall",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    toggleEye = (val) => {
        this.setState(prevState => {
            return {
                [val]: !prevState[val]
            }
        })
    }

    changeValue = (ev) => {
        try {
            let name = ev.target.name;
            let value = ev.target.value;
            // if (name === 'zipcode') {
            //     var containsNumber = /^([a-zA-Z0-9 _]+)$/;

            //     // remove space at validation time
            //     let zipcode = value;

            //     if (containsNumber.test(zipcode.trim()) || value === '') {
            //         this.setState({
            //             [name]: value,
            //         })
            //     }
            //     else {
            //         return false
            //     }
            // }
            if (name === "mobile") {
                var containsNumber = /^[0-9\b]+$/;
                let firstLetterZero = false;
                let maxLength = 20;
                if (value && value[0] === '0') {
                    firstLetterZero = true;
                }
                if (firstLetterZero) {
                    maxLength = 21
                }
                if ((containsNumber.test(value) || value === '') && value.length <= maxLength) {
                    this.setState({ [name]: value })
                } else {
                    return false
                }
            }
            if (name === "country") {
                let sortedStateList = yourhandle.getStatesByShort(value)
                if (sortedStateList.length > 0) {
                    this.setState({ [name]: value, stateProvince: '' })
                } else {
                    this.setState({ [name]: value, stateProvince: '' })
                }
            } else if (name === "hcpList") {
                this.setState({ [name]: value })
            } else {
                this.setState({ [name]: value });
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageProfile/changeValue",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    changePassword = (ev) => {
        let name = ev.target.name;
        let value = ev.target.value;
        var containsNumber = /\d+/;
        var specailChar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        var variableChar = /[A-Z]/;
        if (value.length >= 8) {
            this.setState({ minEightChar: true });
        }
        else {
            this.setState({ minEightChar: false });
        }

        if (variableChar.test(value)) {
            this.setState({ oneVarIncluded: true });
        }
        else {
            this.setState({ oneVarIncluded: false });
        }
        if (specailChar.test(value)) {
            this.setState({ specialCharacter: true });
        }
        else {
            this.setState({ specialCharacter: false });
        }
        if (containsNumber.test(value)) {
            this.setState({ numberIncluded: true });
        }
        else {
            this.setState({ numberIncluded: false });
        }
        if (value.length >= 8 && containsNumber.test(value) && specailChar.test(value) && variableChar.test(value)) {
            this.setState({ passwordValid: true });
        }
        this.setState({ [name]: value });;
    }

    userCreateData = async (ev) => {
        ev.preventDefault();
        try {
            if (this.formValidation()) {
                globalLoader(true);
                let formattedDob = null;
                if (this.state.startDate && this.state.startDate != "null") {
                    formattedDob = format(this.state.startDate, 'yyyy-MM-dd');
                }
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: '/login',
                    body: {
                        email: this.state.emailId,
                        password: this.state.newPassword,
                        first_name: this.state.firstName,
                        last_name: this.state.lastName,
                        mobile: this.state.mobile,
                        country: this.state.country,
                        title: this.state.title,
                        date_of_birth: formattedDob,
                        otp: this.state.securityCode
                    }
                }
                if (this.props.roleType == ROLES.PATIENT) {
                    obj.body.dob = formattedDob;
                }
                if (this.props.roleType === ROLES.CLINICIAN) {
                    obj.body.specialty_id = this.state.areaOfPractice;
                    obj.body.job_title_id = this.state.hcpList;
                }
                let result = await CallApiAsync(obj);
                if (result.data.status === 200) {
                    if (result?.data?.data?.userInfo) {
                        changeOpenComponent(false);
                        storeActivateParam({});
                        await sessionSetup(result?.data?.data, this.props.history);
                    }
                    else {
                        globalLoader(false)
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.manageProfileResources, result?.data?.status.toString()))
                    }
                } else {
                    if (result?.data?.data?.errors) {
                        let passwordMinLength = getResourceValue(this.state.manageProfileResources, "PASSWORD", resourceFields.Min_Length);
                        let passwordMaxLength = getResourceValue(this.state.manageProfileResources, "PASSWORD", resourceFields.Max_Length);
                        this.setState({ passwordErrorMessage: getResourceValue(this.state.manageProfileResources, result?.data?.data?.errors?.password).replace('{min_length}', passwordMinLength).replace('{max_length}', passwordMaxLength) });
                    }
                    if (result?.data?.data?.profile?.errors) {
                        let titleMinLength = getResourceValue(this.state.manageProfileResources, "TITLE", resourceFields.Min_Length);
                        let titleMaxLength = getResourceValue(this.state.manageProfileResources, "TITLE", resourceFields.Max_Length);
                        this.setState({ titleError: getResourceValue(this.state.manageProfileResources, result?.data?.data?.profile?.errors?.title).replace('{min_length}', titleMinLength).replace('{max_length}', titleMaxLength) });
                        this.setState({ dateOfBirthError: getResourceValue(this.state.manageProfileResources, result?.data?.data?.profile?.errors?.date_of_birth) });
                        this.setState({ mobileError: getResourceValue(this.state.manageProfileResources, result?.data?.data?.profile?.errors?.mobile) });
                        this.setState({ mobileError: getResourceValue(this.state.manageProfileResources, result?.data?.data?.profile?.errors?.mobile) });
                    }
                    globalLoader(false)
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.manageProfileResources, result?.data?.status.toString()))
                }



            }
        } catch (error) {
            let errorObject = {
                methodName: "manageProfile/userCreateData",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    userPostData = (ev) => {
        ev.preventDefault();
        try {
            this.formValidation().then(async (value) => {
                if (value) {
                    globalLoader(true)
                    let otherApiCall = false;
                    let deletedOrg = 0;
                    let newOrg = 0;
                    let formattedDob = null;
                    if (this.state.startDate && this.state.startDate != "null") {
                        formattedDob = format(this.state.startDate, 'yyyy-MM-dd');
                    }
                    let obj = {
                        email: this.state.emailId,
                        password: this.state.password,
                        first_name: this.state.firstName,
                        last_name: this.state.lastName,
                        mobile: this.state.mobile,
                        country: this.state.country,
                        //state: this.state.stateProvince,
                        // city: this.state.city,
                        // zip_code: this.state.zipcode,
                        subscribed: this.state.subscribed,
                        title: this.state.title,
                        date_of_birth: formattedDob
                    }

                    if (this.props.roleType !== ROLES.PATIENT && this.props.roleAction === ROLES.PATIENT) {
                        if (this.state.tagData?.oldTag?.length > 0) {
                            let deleteTags = [];
                            let oldTagsList = this.state.tagData.oldTag;
                            if (oldTagsList.length > 0 && this.props.patientEditTags.length > 0) {
                                for (let tag of this.props.patientEditTags) {
                                    let index = oldTagsList.findIndex(e => e == tag.id);
                                    if (index < 0) {
                                        deleteTags.push(tag.id);
                                    }
                                }
                            }
                            obj.removed_tag_ids = deleteTags.join().toString();
                            obj.added_tag_ids = this.state.tagData.oldTag.toString();
                        } else {
                            if (this.props.patientEditTags.length > 0) {
                                let deleteTags = [];
                                for (let tag of this.props.patientEditTags) {
                                    deleteTags.push(tag.id);
                                }
                                obj.removed_tag_ids = deleteTags.join().toString();
                            }
                        }
                        if (this.state.tagData?.newTag?.length > 0) {
                            obj.new_tags = this.state.tagData.newTag.toString();
                        }
                    }
                    if (this.props.currentAction === ACTIONS.MANAGE_OWN) {
                        delete obj.password;
                    }
                    if (this.props.roleAction === ROLES.CLINICIAN || this.props.roleType === ROLES.CLINICIAN) {
                        obj = { ...obj, specialty_id: this.state.areaOfPractice, job_title_id: this.state.hcpList }
                    }
                    if (this.props.roleAction === ROLES.ADMIN) {
                        obj = { ...obj, specialty_id: this.state.areaOfPractice, job_title_id: this.state.hcpList }
                        if (this.props.currentAction === ACTIONS.MANAGE_USER) {
                            let localUserData = this.props.otherUserData;
                            let deletedFlag = false;
                            let addedFlag = false;

                            let oldOrgDetails = localUserData.organizations && localUserData.organizations.length > 0 ? localUserData.organizations : [];

                            let oldOrgId = oldOrgDetails.length > 0 ? oldOrgDetails[0] : 0;

                            newOrg = this.state.organizationsList; //only one org can be selected

                            if (oldOrgId != 0) {
                                if (oldOrgId != newOrg) {
                                    deletedFlag = true;
                                    deletedOrg = oldOrgId;
                                }
                            }
                            else {
                                addedFlag = true;
                            }

                            //check for any changes in the organisation list
                            if (deletedFlag == true || addedFlag == true) {
                                otherApiCall = true;
                            }

                        }
                    }

                    let roleBase;
                    if (this.props.currentAction === ACTIONS.MANAGE_USER) {
                        roleBase = "user";
                        obj = { ...obj, user_id: this.props.currentUserId }
                        if (!this.state.password) {
                            delete obj.password;
                        }
                    }

                    let api = "";
                    if (this.props.currentAction === ACTIONS.MANAGE_USER) {
                        if (this.props.roleAction == ROLES.SUPER_ADMIN) {
                            api = "/edit-superadmin-profile";
                        }
                        if (this.props.roleAction == ROLES.ADMIN) {
                            api = "/edit-admin-profile";
                        }
                        if (this.props.roleAction == ROLES.CLINICIAN) {
                            api = "/edit-clinician-profile";
                        }
                        if (this.props.roleAction == ROLES.PATIENT) {
                            api = "/edit-patient-profile";
                        }
                    }
                    else {
                        api = "/edit-own-profile";
                    }

                    if (otherApiCall) {
                        let res = {};
                        let newObj = {
                            method: API_METHODS.POST,
                            history: this.props.history,
                            api: api,
                            body: obj
                        }
                        res = await CallApiAsync(newObj);

                        if (this.props.currentAction === ACTIONS.MANAGE_USER) {
                            if (this.props.roleAction == ROLES.ADMIN) {
                                let orgObj = {
                                    method: API_METHODS.POST,
                                    history: this.props.history,
                                    api: '/map-admin-organization',
                                    body: {
                                        user_id: this.props.currentUserId,
                                        orgId: newOrg,
                                        removedOrgId: deletedOrg > 0 ? deletedOrg : 0,
                                    }
                                }
                                res = await CallApiAsync(orgObj);
                            }
                        }

                        if (res.data.status === 200) {
                            if (this.props.currentAction === ACTIONS.MANAGE_USER) {
                                this.props.closeModal("sucess")
                            }
                            else {
                                verifyRoute(this.props.history, `/dashboard`);
                            }

                            globalAlert('success', getResourceValue(this.state.manageProfileResources, 'SUCCESS_TEXT'));
                            globalLoader(false)
                        }
                        else {
                            globalLoader(false)
                            globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.manageProfileResources, res.data.status.toString()));
                        }
                    }

                    let userData = this.props.userDetail;

                    let newObj = {
                        method: API_METHODS.POST,
                        history: this.props.history,
                        api: api,
                        body: obj
                    }

                    let data = await CallApiAsync(newObj);
                    if (data.data.status === 200) {
                        localStorage.removeItem('mailId');
                        if (this.props.currentAction === ACTIONS.MANAGE_USER) {
                            this.props.closeModal("sucess")
                        } else if (this.props.currentAction === ACTIONS.CREATE && this.props.roleAction === ROLES.CLINICIAN) {
                            if (userData.multiple_organizations) {
                                verifyRoute(this.props.history, `/organisations`);
                            } else {
                                verifyRoute(this.props.history, `/dashboard`);
                            }
                        } else {
                            verifyRoute(this.props.history, `/dashboard`);
                        }
                        globalAlert('success', getResourceValue(this.state.manageProfileResources, "SUCCESS_TEXT"));
                        globalLoader(false)
                    } else {
                        if (data?.data?.data?.errors) {
                            // let postcodeMinLength = getResourceValue(this.state.manageProfileResources, "POSTCODE", resourceFields.Min_Length);
                            // let postcodeMaxLength = getResourceValue(this.state.manageProfileResources, "POSTCODE", resourceFields.Max_Length);

                            this.setState({ titleError: getResourceValue(this.state.manageProfileResources, data?.data?.data?.errors?.title) });
                            this.setState({ dateOfBirthError: getResourceValue(this.state.manageProfileResources, data?.data?.data?.errors?.date_of_birth) });
                            // this.setState({ postCodeError: getResourceValue(this.state.manageProfileResources, data?.data?.data?.errors?.zip_code).replace('{min_length}', postcodeMinLength).replace('{max_length}', postcodeMaxLength) });

                            this.setState({ errorTagMessage: getResourceValue(this.state.manageProfileResources, data?.data?.data?.errors?.new_tags) });
                        }

                        globalLoader(false)
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.manageProfileResources, data.data.status.toString()));
                    }

                }
            }).catch(err => {
            })
        } catch (error) {
            let errorObject = {
                methodName: "manageProfile/userPostData",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    formValidation = async () => {
        this.setState({
            emptyPassword: false,
            emptyAnswer: false,
            emptyCity: false,
            emptyConfirmPassword: false,
            emptyCountry: false,
            emptyFirstName: false,
            emptyLastName: false,
            emptyStateProvince: false,
            notMatchPassword: false,
            emptyorganizationsList: false,
            emptyZipcode: false,
            emptyMobile: false,
            emptyAreaOfPractice: false,
            emptyHcpList: false,
            emptyDob: false,
        })
        let formValidation = true;

        if (this.props.currentAction === ACTIONS.CREATE) {
            if (this.props.roleType === ROLES.PATIENT) {
                if (!this.state.formattedDate) {
                    formValidation = false;
                    this.setState({
                        emptyDob: true,
                    });
                }
            }
            let otpMaxLength = getResourceValue(this.state.manageProfileResources, "OTP", resourceFields.Max_Length);
            let otpMinLength = getResourceValue(this.state.manageProfileResources, "OTP", resourceFields.Min_Length);

            if (!this.state.securityCode) {
                formValidation = false;
                this.setState({ otpErr: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED') })
            } else if (this.state.securityCode.length > otpMaxLength) {
                formValidation = false
                this.setState({ otpErr: getResourceValue(this.state.manageProfileResources, 'OTP_CRITERIA') })
            } else if (this.state.securityCode.length < otpMinLength) {
                formValidation = false
                this.setState({ otpErr: getResourceValue(this.state.manageProfileResources, 'OTP_CRITERIA') })
            } else {
                this.setState({ otpErr: '' })
            }

            if (!this.state.passwordValid) {
                formValidation = false;
            }

            let confirmPasswordMinLength = getResourceValue(this.state.manageProfileResources, "CONFIRM", resourceFields.Min_Length);
            let confirmPasswordMaxLength = getResourceValue(this.state.manageProfileResources, "CONFIRM", resourceFields.Max_Length);

            if (!this.state.confirmPassword) {
                formValidation = false;
                this.setState({
                    emptyConfirmPassword: true, confirmPasswordError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')
                })
            } else if (this.state.confirmPassword.length == 0) {
                formValidation = false;
                this.setState({ confirmPasswordError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED') })
            } else if (this.state.confirmPassword.length < confirmPasswordMinLength || this.state.confirmPassword.length > confirmPasswordMaxLength) {
                formValidation = false;
                this.setState({ confirmPasswordError: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}', confirmPasswordMinLength).replace('{max_length}', confirmPasswordMaxLength) })
            } else {
                this.setState({ confirmPasswordError: '' })
            }

            let newPasswordMinLength = getResourceValue(this.state.manageProfileResources, "PASSWORD", resourceFields.Min_Length);
            let newPasswordMaxLength = getResourceValue(this.state.manageProfileResources, "PASSWORD", resourceFields.Max_Length);

            if (!this.state.newPassword) {
                formValidation = false;
                this.setState({
                    emptyNewPassword: true, newPasswordError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')
                })
            } else if (this.state.newPassword.length == 0) {
                formValidation = false;
                this.setState({ newPasswordError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED') })
            } else if (this.state.newPassword.length < newPasswordMinLength || this.state.newPassword.length > newPasswordMaxLength) {
                formValidation = false;
                this.setState({ newPasswordError: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}', newPasswordMinLength).replace('{max_length}', newPasswordMaxLength) })
            } else {
                this.setState({ newPasswordError: '' })
            }


            if (this.state.newPassword && this.state.confirmPassword && this.state.confirmPassword !== this.state.newPassword) {
                formValidation = false;
                this.setState({
                    notMatchPassword: true,
                })
            }
        }

        if (this.props.currentAction === ACTIONS.MANAGE_USER) {
            if (this.state.password || this.state.confirmPassword) {
                if (!this.state.passwordValid) {
                    formValidation = false;
                }
                if (!this.state.confirmPassword) {
                    formValidation = false;
                    this.setState({
                        emptyConfirmPassword: true,
                    })
                }
                if (!this.state.password) {
                    formValidation = false;
                    this.setState({
                        emptyPassword: true,
                    })
                }

                if (this.state.password && this.state.confirmPassword && this.state.confirmPassword !== this.state.password) {
                    formValidation = false;
                    this.setState({
                        notMatchPassword: true,
                    })
                }
            }

            //check organisation list
            if (this.props.roleType == ROLES.SUPER_ADMIN && this.props.roleAction === ROLES.ADMIN && (this.state.organizationsList == '' || this.state.organizationsList <= 0)) {
                formValidation = false;
                this.setState({ emptyorganizationsList: true });
            }

        }


        else if (this.props.currentAction === ACTIONS.CREATE || this.props.currentAction === ACTIONS.MANAGE_OWN) {
            // if (!this.state.passwordValid) {
            //     formValidation = false;
            // }
            // if (!this.state.confirmPassword) {
            //     formValidation = false;
            //     this.setState({
            //         emptyConfirmPassword: true,
            //     })
            // }
            // if (!this.state.password) {
            //     formValidation = false;
            //     this.setState({
            //         emptyPassword: true,
            //     })
            // }

            // if (this.state.password && this.state.confirmPassword && this.state.confirmPassword !== this.state.password) {
            //     formValidation = false;
            //     this.setState({
            //         notMatchPassword: true,
            //     })
            // }

            //calculate age in years
            if (this.props.roleAction != ROLES.PATIENT && this.props.roleType != ROLES.PATIENT) {
                if (this.state.startDate) {
                    let dob = new Date(this.state.startDate)
                    var month_diff = Date.now() - dob.getTime();
                    var age_dt = new Date(month_diff);
                    var year = age_dt.getUTCFullYear();
                    var age = Math.abs(year - 1970);
                    if (age < 16) {
                        formValidation = false;
                        this.setState({ dateOfBirthError: getResourceValue(this.state.manageProfileResources, 'DOB_CRITERIA') })
                    } else {
                        this.setState({ dateOfBirthError: '' })
                    }
                } else {
                    formValidation = false;
                    this.setState({ dateOfBirthError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED') })
                }
            } else {
                if (this.state.startDate == '') {
                    formValidation = false;
                    this.setState({ dateOfBirthError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED') })
                }
            }


            let titleMinLength = getResourceValue(this.state.manageProfileResources, "TITLE", resourceFields.Min_Length);
            let titleMaxLength = getResourceValue(this.state.manageProfileResources, "TITLE", resourceFields.Max_Length);

            if (!this.state.title) {
                if (this.props.roleAction !== ROLES.PATIENT && this.props.roleType !== ROLES.PATIENT) {
                    formValidation = false;
                    this.setState({
                        titleError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')
                    })
                }
            } else if (this.state.title.length < titleMinLength || this.state.title.length > titleMaxLength) {
                formValidation = false;
                this.setState({
                    titleError: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}', titleMinLength).replace('{max_length}', titleMaxLength)
                })
            } else {
                this.setState({
                    titleError: ''
                })
            }
        }


        if (this.props.currentAction !== ACTIONS.MANAGE_USER) {


            // if (!this.state.country) {
            //     formValidation = false;
            //     this.setState({
            //         emptyCountry: true,
            //     })
            // }

            // let cityMinLength = getResourceValue(this.state.manageProfileResources, "CITY", resourceFields.Min_Length);
            // let cityMaxLength = getResourceValue(this.state.manageProfileResources, "CITY", resourceFields.Max_Length);

            let firstNameMinLength = getResourceValue(this.state.manageProfileResources, "FIRSTNAME", resourceFields.Min_Length);
            let firstNameMaxLength = getResourceValue(this.state.manageProfileResources, "FIRSTNAME", resourceFields.Max_Length);

            let mobileMinLength = getResourceValue(this.state.manageProfileResources, "MOBILE", resourceFields.Min_Length);
            let mobileMaxLength = getResourceValue(this.state.manageProfileResources, "MOBILE", resourceFields.Max_Length);

            // let postcodeMinLength = getResourceValue(this.state.manageProfileResources, "POSTCODE", resourceFields.Min_Length);
            // let postcodeMaxLength = getResourceValue(this.state.manageProfileResources, "POSTCODE", resourceFields.Max_Length);

            let lastnameMinLength = getResourceValue(this.state.manageProfileResources, "LASTNAME", resourceFields.Min_Length);
            let lastnameMaxLength = getResourceValue(this.state.manageProfileResources, "LASTNAME", resourceFields.Max_Length);


            // if (!this.state.city) {
            //     formValidation = false;
            //     this.setState({
            //         emptyCity: true,cityError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')
            //     })
            // }else if(this.state.city.length > cityMaxLength){
            //     formValidation = false;
            //     this.setState({
            //         cityError: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}',cityMinLength).replace('{max_length}',cityMaxLength)
            //     })
            // }else{
            //     this.setState({
            //         cityError:''
            //     })
            // }

            if (!this.state.firstName) {
                formValidation = false;
                this.setState({
                    emptyFirstName: true, firstNameError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')
                })
            } else if (this.state.firstName.length > firstNameMaxLength) {
                formValidation = false;
                this.setState({
                    firstNameError: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}', firstNameMinLength).replace('{max_length}', firstNameMaxLength)
                })
            } else {
                this.setState({
                    firstNameError: ''
                })
            }

            if (!this.state.mobile) {
                formValidation = false;
                this.setState({
                    mobileError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')
                })
            } else if (this.state.mobile.length < mobileMinLength || this.state.mobile.length > mobileMaxLength) {
                formValidation = false;
                this.setState({
                    mobileError: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}', mobileMinLength).replace('{max_length}', mobileMaxLength)
                })
            } else {
                this.setState({
                    mobileError: ''
                })
            }

            // if(this.props.roleAction == ROLES.PATIENT){
            //     if(!this.state.nhsNumber){
            //         formValidation = false;
            //         this.setState({
            //             nhsNumberError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')
            //         })
            //     }else{
            //         this.setState({
            //             nhsNumberError:''
            //         })
            //     }
            // }

            // let zipcode = this.state.zipcode;
            // zipcode = zipcode.replace(/\s/g,'');

            // if (!zipcode) {
            //     formValidation = false;
            //     this.setState({postCodeError:getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')});
            // }
            // else if (zipcode.length < postcodeMinLength || zipcode.length > postcodeMaxLength) {
            //     formValidation = false;
            //     this.setState({postCodeError: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}',postcodeMinLength).replace('{max_length}',postcodeMaxLength)});
            // }else if(this.state.zipcode.length < postcodeMinLength || this.state.zipcode.length > 30){
            //     formValidation = false;
            //     this.setState({postCodeError:getResourceValue(this.state.manageProfileResources, 'SPACE_LIMIT')});
            // }else{
            //     this.setState({postCodeError:''});
            // }

            if (!this.state.lastName) {
                formValidation = false;
                this.setState({
                    lastNameError: getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')
                })
            } else if (this.state.lastName.length > lastnameMaxLength) {
                formValidation = false;
                this.setState({
                    lastNameError: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}', lastnameMinLength).replace('{max_length}', lastnameMaxLength)
                })
            } else {
                this.setState({
                    lastNameError: ''
                })
            }

        }

        if (this.props.roleAction === ROLES.CLINICIAN || this.props.roleType === ROLES.CLINICIAN) {
            if ((!this.state.areaOfPractice) || this.props.aopList.length < 1) {
                formValidation = false;
                this.setState({
                    emptyAreaOfPractice: true,
                })
            }
            if ((!this.state.hcpList) || this.props.hcpList.length < 1) {
                formValidation = false;
                this.setState({
                    emptyHcpList: true,
                })
            }
        }

        if (this.props.roleType !== ROLES.PATIENT && this.props.roleAction === ROLES.PATIENT) {
            let tagResult = await this.refs.tagComp.formValidation();

            if (tagResult.formValidation) {
                this.setState({
                    tagData: tagResult.data,
                })
            }
            else {
                formValidation = false
            }
        }

        return formValidation;
    }
    handleChangeMultiple = idArray => {

        try {
            if (idArray.length > 0) {
                let val = [];
                idArray.forEach(element => {
                    let ele = this.props.organizationsArray.find(x => x.organization_id === element)
                    val.push(ele.name)

                });
                return val.toString()
            }
        } catch (error) {
            let errorObject = {
                methodName: "manageProfile/handleChangeMultiple",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    };

    renderResendContent = () => {
        if (this.props.otherUserData?.activation_status == USER_STATUS.ACTIVATED) {
            return <div className="color-green">{getResourceValue(this.state.manageProfileResources, 'ACTIVATED')}</div>;
        }

        return (
            <>
                {this.state.emailId && this.props.otherUserData?.activation_status == USER_STATUS.INVITED ? <div className="color-primary" onClick={() => this.props.resendUserEmail(this.state.userOrgid)}>{getResourceValue(this.state.manageProfileResources, 'RESEND')}</div> : <div className="color-primary">{getResourceValue(this.state.manageProfileResources, 'NOT_ACTIVATED')}</div>}
            </>
        )
    }

    render() {
        const { otherUserData, currentAction, organizationsArray } = this.props;
        const { hcpList, organizationsList } = this.state;
        let hList = this.props.hcpList
        hList.sort((a, b) => a.name.localeCompare(b.name))
        return (
            <>
                <div className={(this.props.roleType === ROLES.CLINICIAN || this.props.roleType === ROLES.ADMIN) && this.props.currentAction === ACTIONS.MANAGE_OWN ? ` ` : `container align-middle`}>
                    <form className={(this.props.roleType === ROLES.CLINICIAN) && this.props.currentAction === ACTIONS.MANAGE_OWN ? ` modal-full` : ` modal-full`} noValidate autoComplete="off" onSubmit={(ev) => this.props.currentAction == ACTIONS.CREATE ? this.userCreateData(ev) : this.userPostData(ev)}>
                        <div className="col-md-12 col-12">
                            {this.props.currentAction === ACTIONS.MANAGE_OWN &&
                                <>
                                    <div className={`row d-flex justify-content-between cpb-10 ${(this.props.roleType == ROLES.SUPER_ADMIN || this.props.roleType == ROLES.ADMIN) ? '' : 'cpt-10'}`} >
                                        <div className="d-flex" >
                                            <p className="login-txt mb-0 d-flex align-self-center font-20 primary-color">{getResourceValue(this.state.manageProfileResources, 'EDIT_OWN')}</p>
                                        </div>
                                        <div className=" btn-wrapper  ">
                                            {/* <button type="button" className="btn btn-own btn-own-grey min-height-btn mr-3 mw-100" >{getResourceValue(this.state.manageProfileResources, 'CANCEL')}</button> */}
                                            <button type="submit" className="btn btn-own btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.manageProfileResources, 'UPDATE PROFILE')}</button>
                                        </div>
                                    </div>
                                </>}
                            {this.props.currentAction == ACTIONS.CREATE &&
                                <>
                                    <div className="row d-flex justify-content-between py-3" >
                                        <div className="d-flex">
                                            <p className="login-txt mb-0 d-flex align-self-center font-20 primary-color">{getResourceValue(this.state.manageProfileResources, 'NEW_ACCOUNT').replace('{role_name}', getResourceValue(this.state.manageProfileResources, this.props.roleType).toLowerCase())}</p>
                                        </div>
                                        <div className="btn-wrapper">
                                            <button type="submit" disabled={(this.state.isCheckedAllowToUse && this.state.isCheckedTermOfUse) ? false : true} className="btn btn-own btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.manageProfileResources, 'BUTTON')}</button>
                                        </div>

                                    </div>
                                </>}
                            {this.props.currentAction == ACTIONS.MANAGE_USER && <>
                                <div className="row d-flex justify-content-between pb-3" >
                                    <div className="d-flex">
                                        <div>
                                            <p className="login-txt  mb-0 d-flex align-self-center font-20 primary-color">{getResourceValue(this.state.manageProfileResources, 'EDIT_USER')}</p>
                                            {
                                                this.props.roleAction == ROLES.PATIENT ?
                                                    otherUserData?.activation_status == USER_STATUS.CREATED ? 
                                                        <p className="mb-0 d-flex align-self-center font-14">{getResourceValue(this.state.manageProfileResources, 'PATIENT_CREATED_DESCRIPTION')}</p>
                                                    : null
                                                : null
                                            }
                                        </div>
                                    </div>
                                    <div className="d-flex" >

                                        {(this.props.currentAction && this.props.currentAction == ACTIONS.MANAGE_USER) || currentAction == ACTIONS.MANAGE_USER ?
                                            <>
                                                <div className="text-center d-flex align-self-center px-4">
                                                    {this.renderResendContent()}
                                                </div>
                                                <button type="button" className="btn btn-own btn-own-grey min-height-btn mr-3 mw-100" onClick={() => this.props.closeModal(null)}>{getResourceValue(this.state.manageProfileResources, 'CANCEL')}</button>
                                            </>
                                            :
                                            <button type="button" className="btn btn-own btn-own-grey min-height-btn mr-3 mw-100" onClick={() => this.props.history.goBack()}>{getResourceValue(this.state.manageProfileResources, 'CANCEL')}</button>
                                        }
                                        <button type="submit" className="btn btn-own btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.manageProfileResources, 'UPDATE PROFILE')}</button>
                                    </div>
                                </div>
                            </>}
                        </div>
                        <div className="content-container align-middle">
                            {this.props.currentAction !== ACTIONS.MANAGE_OWN && otherUserData && otherUserData?.activation_status ?
                                <>
                                    <div className="row m-0">
                                        <div className="col-12 col-md-4">
                                            {this.props.currentAction === ACTIONS.CREATE ?
                                                <div className="form-group-icon position-relative form-group pb-1">
                                                    <TextField
                                                        label={getResourceValue(this.state.manageProfileResources, 'EMAIL')}
                                                        placeholder={getResourceValue(this.state.manageProfileResources, 'EMAIL', resourceFields.Placeholder)}
                                                        className='mt-0 mb-0 d-flex'
                                                        margin="normal"
                                                        variant="outlined"
                                                        name="emailId"
                                                        onChange={(ev) => this.changeValue(ev)}
                                                        value={this.state.emailId}
                                                        disabled
                                                    />
                                                    <div className="form-img-wrapper no-pointer">
                                                        <img src="/assets/img/lock-arrow.png" alt="lock" />
                                                    </div>

                                                </div>
                                                : null}

                                        </div>
                                        <div className="col-md-4 col-12 input-helper-wrapper font-14">
                                            {this.props.currentAction === ACTIONS.CREATE ?
                                                <div className="right-side-helper-txt">
                                                    {getResourceValue(this.state.manageProfileResources, 'USER_ID_MESSAGE')}
                                                </div> :

                                                null}
                                        </div>
                                    </div>

                                </> : null}
                            <div className="row m-0">

                                <div className="col-lg-12 p-0">
                                    <div className="row p-0 m-0">
                                        {
                                            this.props.roleAction != ROLES.PATIENT && this.props.roleType != ROLES.PATIENT &&
                                            <>
                                                <div className='col-12 m-0 p-0' >
                                                    <div className={"col-md-6 cpl-10  cpt-10 cpb-10 cpr-10"}>
                                                        <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                            <Autocomplete
                                                                freeSolo
                                                                id="free-solo-2-demo"
                                                                disableClearable
                                                                options={salutationArray.map((option) => option.text)}
                                                                onChange={(_, newValue) => {
                                                                    this.setState({ title: newValue })
                                                                }}
                                                                disabled={currentAction === ACTIONS.MANAGE_USER}
                                                                value={this.state.title}
                                                                renderInput={(params) => (
                                                                    params.InputProps.className = '',
                                                                    <TextField
                                                                        {...params}
                                                                        label={getResourceValue(this.state.manageProfileResources, 'TITLE')}
                                                                        value={this.state.title}
                                                                        margin="normal"
                                                                        variant="outlined"
                                                                        InputProps={{ ...params.InputProps, type: 'search' }}
                                                                        name="title"
                                                                        onChange={(ev) => this.setState({ title: ev.target.value })}
                                                                        className={currentAction === ACTIONS.MANAGE_USER ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                                                    />
                                                                )}
                                                            />
                                                            <div className="error-wrapper">
                                                                {this.state.titleError}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        }
                                        <div className={"col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10"}>
                                            <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                <TextField
                                                    type="text"

                                                    label={getResourceValue(this.state.manageProfileResources, 'FIRSTNAME')}
                                                    placeholder={getResourceValue(this.state.manageProfileResources, 'FIRSTNAME', resourceFields.Placeholder)}
                                                    className={currentAction === ACTIONS.MANAGE_USER ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                                    margin="normal"
                                                    variant="outlined"
                                                    name="firstName"
                                                    onChange={(ev) => this.changeValue(ev)}
                                                    value={this.state.firstName}
                                                    disabled={currentAction === ACTIONS.MANAGE_USER}

                                                />

                                                <div className="error-wrapper">
                                                    {this.state.firstNameError}
                                                </div>
                                            </div>

                                        </div>
                                        <div className={"col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10"}>
                                            <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                <TextField
                                                    type="text"
                                                    label={getResourceValue(this.state.manageProfileResources, 'LASTNAME')}
                                                    placeholder={getResourceValue(this.state.manageProfileResources, 'LASTNAME', resourceFields.Placeholder)}
                                                    className={currentAction === ACTIONS.MANAGE_USER ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                                    margin="normal"
                                                    variant="outlined"
                                                    name="lastName"
                                                    onChange={(ev) => this.changeValue(ev)}
                                                    value={this.state.lastName}
                                                    disabled={currentAction === ACTIONS.MANAGE_USER}
                                                />

                                                <div className="error-wrapper">
                                                    {this.state.lastNameError}
                                                </div>
                                            </div>

                                        </div>
                                        {
                                            <div className='col-12 m-0 p-0'>
                                                <div className={"col-md-6  cpl-10  cpt-10 cpb-10 cpr-10"}>
                                                    <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                        <TextField
                                                            label={getResourceValue(this.state.manageProfileResources, 'EMAIL')}
                                                            placeholder={getResourceValue(this.state.manageProfileResources, 'EMAIL', resourceFields.Placeholder)}
                                                            className={(this.props.roleAction !== ROLES.PATIENT) || this.props.userInfo && this.props.userInfo.email || (this.props.roleType == ROLES.PATIENT) ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex '}
                                                            margin="normal"
                                                            variant="outlined"
                                                            name="emailId"
                                                            onChange={(ev) => this.changeValue(ev)}
                                                            value={this.state.emailId}
                                                            disabled={(this.props.roleAction !== ROLES.PATIENT) || this.props.userInfo && this.props.userInfo.email}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        {
                                            currentAction == ACTIONS.CREATE && this.props.roleType == ROLES.PATIENT ? null : (
                                                <div className={"col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10"}>
                                                    <div className="form-group-icon position-relative datepicker-form-group form-group pb-1" style={{ display: 'contents' }}>
                                                        <div className={`own-custom-label ${this.state.valueInDate ? "active" : ""}`}>
                                                            {getResourceValue(this.state.manageProfileResources, 'DOB')}
                                                        </div>
                                                        <div onClick={this.datePickerClicked}>
                                                            <DatePicker
                                                                selected={this.state.startDate ? new Date(this.state.startDate) : new Date().setFullYear(new Date().getFullYear() - 16)}
                                                                onChange={this.dateChange}
                                                                onClickOutside={this.datePickerValue}
                                                                maxDate={new Date()}
                                                                scrollableYearDropdown={true}
                                                                yearDropdownItemNumber={100}
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
                                                                autoComplete="off"
                                                                dateFormat="dd-MM-yyyy"
                                                                showYearDropdown
                                                                showMonthDropdown
                                                                readOnly={(currentAction === ACTIONS.MANAGE_USER && this.props.roleAction !== ROLES.PATIENT) || (currentAction === ACTIONS.MANAGE_OWN && this.props.roleType == ROLES.PATIENT)}
                                                                // disabled={this.props.roleAction !== ROLES.PATIENT && (currentAction !== ACTIONS.CREATE || currentAction === ACTIONS.MANAGE_OWN)}
                                                                disabled={(currentAction === ACTIONS.MANAGE_USER && this.props.roleAction !== ROLES.PATIENT) || (currentAction === ACTIONS.MANAGE_OWN && this.props.roleType == ROLES.PATIENT)}
                                                                className={(currentAction === ACTIONS.MANAGE_USER && this.props.roleAction !== ROLES.PATIENT) || (currentAction === ACTIONS.MANAGE_OWN && this.props.roleType == ROLES.PATIENT) ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                                                onChangeRaw={(ev) => ev.preventDefault()}
                                                            />
                                                        </div>
                                                        <div className="error-wrapper">
                                                            {this.state.dateOfBirthError}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }



                                        {this.props.roleAction === ROLES.PATIENT &&
                                            <>
                                                <div className={this.props.roleAction === ROLES.PATIENT ? "col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10" : "col-md-6 col-12 cpl-10 cpt-10 cpb-10"}>
                                                    <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                        <TextField
                                                            type="text"
                                                            label={getResourceValue(this.state.manageProfileResources, 'NHS_NUMBER')}
                                                            placeholder={getResourceValue(this.state.manageProfileResources, 'NHS_NUMBER', resourceFields.Placeholder)}
                                                            className={'mt-0 mb-0 d-flex nonEditable'}
                                                            margin="normal"
                                                            variant="outlined"
                                                            name="nhsNumber"
                                                            onChange={(ev) => this.changeValue(ev)}
                                                            value={this.state.nhsNumber}
                                                            disabled={true}

                                                        />

                                                        <div className="error-wrapper">
                                                            {this.state.nhsNumberError}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        }

                                        <div className="col-md-6 col-12 cpl-10 cpt-10 cpb-10 cpr-10">
                                            <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                <TextField
                                                    type="text"
                                                    label={getResourceValue(this.state.manageProfileResources, 'MOBILE')}
                                                    placeholder={getResourceValue(this.state.manageProfileResources, 'MOBILE', resourceFields.Placeholder)}
                                                    className={currentAction === ACTIONS.MANAGE_USER ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                                    margin="normal"
                                                    variant="outlined"
                                                    name="mobile"
                                                    onChange={(ev) => this.changeValue(ev)}
                                                    value={this.state.mobile}
                                                    disabled={currentAction === ACTIONS.MANAGE_USER}

                                                />

                                                <div className="error-wrapper">
                                                    {this.state.mobileError}
                                                </div>
                                            </div>

                                        </div>

                                        {(this.props.roleType !== ROLES.PATIENT && this.props.roleAction === ROLES.PATIENT) &&
                                            <div className="col-md-6 col-12 cpl-10 cpt-10 cpb-10 cpr-10">
                                                <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                    <TagComponent resources={this.state.manageProfileResources} formNumber="07" ref="tagComp" existingTab={this.props.patientTags} editMode={true} errorTag={this.state.errorTagMessage} dataVal={this.props.patientEditTags} tagLABEL={null} from={resourceGroups.MANAGE_USERS} />
                                                </div>
                                            </div>}
                                        {/* <div className="col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10">
                                                <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                    <TextField
                                                        type="text"
                                                        label={getResourceValue(this.state.manageProfileResources, 'POSTCODE')}
                                                        placeholder={getResourceValue(this.state.manageProfileResources, 'POSTCODE', resourceFields.Placeholder)}
                                                        className={currentAction === ACTIONS.MANAGE_USER ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                                        margin="normal"
                                                        variant="outlined"
                                                        name="zipcode"
                                                        onChange={(ev) => this.changeValue(ev)}
                                                        value={this.state.zipcode}
                                                        disabled={currentAction === ACTIONS.MANAGE_USER}

                                                    />

                                                    <div className="error-wrapper">
                                                        {this.state.postCodeError}
                                                    </div>
                                                </div>
                                            </div> */}
                                        {/* <div className="col-md-6 col-12 cpl-10  cpt-10 cpb-10 cpr-10">
                                                <div className="form-group-icon form-group mb-0" style={{ display: 'grid' }}>
                                                    <FormControl variant="outlined">
                                                        <InputLabel id="country-label">{getResourceValue(this.state.manageProfileResources, 'COUNTRY')}</InputLabel>
                                                        <Select
                                                            labelId="country-label"
                                                            id="demo-simple-select-outlined"
                                                            value={this.state.country}
                                                            onChange={(ev) => this.changeValue(ev)}
                                                            label={getResourceValue(this.state.manageProfileResources, 'COUNTRY')}
                                                            disabled={currentAction === ACTIONS.MANAGE_USER}
                                                            className={currentAction === ACTIONS.MANAGE_USER ? 'mt-0 mb-0 d-flex nonEditable' : 'mt-0 mb-0 d-flex'}
                                                            name="country"
                                                        >
                                                            {this.state.countryList && this.state.countryList.length > 0 && this.state.countryList.map((countries, index) => (
                                                                <MenuItem value={countries.shortName} key={index}>{countries.name}</MenuItem>
                                                            ))}

                                                        </Select>
                                                    </FormControl>
                                                    <div className="error-wrapper">
                                                        {this.state.emptyCountry ? <span >{getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')}</span> : null}
                                                    </div>
                                                </div>
                                            </div> */}

                                        {/* {(this.props.roleType !== ROLES.PATIENT && this.props.roleAction === ROLES.PATIENT) &&
                                        <div className="col-md-4 col-12  cpl-10 cpt-10 cpb-10 ">
                                            <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                                <TagComponent resources={this.state.manageProfileResources} formNumber="07" ref="tagComp" existingTab={this.props.patientTags} editMode={true} errorTag={this.state.errorTagMessage} dataVal={this.props.patientEditTags} tagLABEL={null} from={resourceGroups.MANAGE_USERS} />
                                            </div>
                                        </div>
                                    } */}
                                    </div>
                                </div>
                            </div>

                            {(this.props.roleType === ROLES.CLINICIAN || this.props.roleAction === ROLES.CLINICIAN) ?
                                <>
                                    <div className="row m-0">
                                        <div className="col-lg-12 col-12">
                                            <div className="row p-0 m-0">
                                                {/* {this.props.currentAction !== ACTIONS.CREATE ?
                                                <div className="col-12   pb-3 mb-2 font-14">
                                                    {getResourceValue(this.state.manageProfileResources, 'JOB_TITLE_SPECIALITY')}
                                                </div> :
                                                <p className="col-12   font-14">
                                                    {getResourceValue(this.state.manageProfileResources, 'CLINICIAN_DESCRIPTION')}
                                                </p>} */}
                                                <div className="col-12 col-md-6 cpl-10 cpr-10 cpt-10 cpb-10 cpr-10">
                                                    <div className="form-group-icon form-group mb-0" style={{ display: 'grid' }}>
                                                        <FormControl variant="outlined">
                                                            <InputLabel id="area-practice-label">{getResourceValue(this.state.manageProfileResources, 'JOB_TITLE')}</InputLabel>
                                                            <Select
                                                                labelId="area-practice-label"
                                                                id="demo-simple-select-outlined"
                                                                value={hcpList}
                                                                onChange={(ev) => this.changeValue(ev)}
                                                                label={getResourceValue(this.state.manageProfileResources, 'JOB_TITLE')}
                                                                name="hcpList"
                                                            >
                                                                {hList && hList.length > 0 && hList.map((hcp) => (
                                                                    <MenuItem value={hcp.job_title_id} key={hcp.job_title_id}>{hcp.name}</MenuItem>

                                                                ))}

                                                                {
                                                                    hList && hList.length < 1 && <MenuItem value={null} >{getResourceValue(this.state.manageProfileResources, "NO_RECORDS")}</MenuItem>
                                                                }
                                                            </Select>
                                                        </FormControl>
                                                        <div className="error-wrapper">
                                                            {this.state.emptyHcpList ? <span >{getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')}</span> : null}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-12 col-md-6 cpl-10 cpt-10 cpb-10 cpr-10">
                                                    <div className="form-group-icon form-group mb-0" style={{ display: 'grid' }}>
                                                        <FormControl variant="outlined">
                                                            <InputLabel id="area-practice-label">{getResourceValue(this.state.manageProfileResources, 'SPECIALITY')}</InputLabel>
                                                            <Select
                                                                labelId="area-practice-label"
                                                                id="demo-simple-select-outlined"
                                                                value={this.state.areaOfPractice}
                                                                onChange={(ev) => this.changeValue(ev)}
                                                                label={getResourceValue(this.state.manageProfileResources, 'SPECIALITY')}
                                                                name="areaOfPractice"
                                                            >
                                                                {this.props.aopList && this.props.aopList.length > 0 && this.props.aopList.map((area) => (
                                                                    <MenuItem value={area.specialty_id} key={area.specialty_id}>{area.name}</MenuItem>

                                                                ))}

                                                                {
                                                                    this.props.aopList && this.props.aopList.length < 1 && <MenuItem value={null} >{getResourceValue(this.state.manageProfileResources, "NO_RECORDS")}</MenuItem>
                                                                }

                                                            </Select>
                                                        </FormControl>
                                                        <div className="error-wrapper">
                                                            {this.state.emptyAreaOfPractice ? <span >{getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')}</span> : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </> : null}

                            {(this.props.roleType == ROLES.SUPER_ADMIN && this.props.roleAction === ROLES.ADMIN) &&
                                <>
                                    <div className="row m-0">
                                        <div className="col-lg-12 col-12">
                                            <div className="row p-0">
                                                {this.props.currentAction !== ACTIONS.CREATE ?
                                                    null :
                                                    <p className="col-12  font-14">
                                                        {getResourceValue(this.state.manageProfileResources, 'SELECT_ORGANIZATION')}
                                                    </p>}
                                                <div className="col-12 col-md-6 cpl-10 cpr-10  cpt-10 cpb-10 ">
                                                    <div className="form-group-icon form-group mb-0" style={{ display: 'grid' }}>
                                                        <FormControl variant="outlined">
                                                            <InputLabel id="organizationsList-label">{getResourceValue(this.state.manageProfileResources, 'ORGANIZATION_LIST')}</InputLabel>
                                                            <Select
                                                                labelId="organizationsList-label"
                                                                id="demo-simple-select-outlined"
                                                                value={organizationsList}
                                                                
                                                                onChange={(ev) => this.changeValue(ev)}
                                                                label={getResourceValue(this.state.manageProfileResources, 'ORGANIZATION_LIST')}
                                                                name="organizationsList"
                                                            >
                                                                {organizationsArray && organizationsArray.length > 0 && organizationsArray.map((organizations) => (
                                                                    this.props.roleType == ROLES.SUPER_ADMIN ? (
                                                                        organizations.organization_id != this.state.userOrgid &&
                                                                        <MenuItem
                                                                            value={organizations.organization_id}
                                                                            key={organizations.organization_id}
                                                                            selected={true}
                                                                        >
                                                                            {organizations.name}
                                                                        </MenuItem>
                                                                    ) : (
                                                                        <MenuItem
                                                                            value={organizations.organization_id}
                                                                            key={organizations.organization_id}
                                                                        >
                                                                            {organizations.name}
                                                                        </MenuItem>
                                                                    )
                                                                ))}

                                                            </Select>
                                                        </FormControl>
                                                        <div className="error-wrapper">
                                                            {this.state.emptyorganizationsList ? <span >{getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')}</span> : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }

                            {this.props.currentAction === ACTIONS.CREATE &&
                                <>

                                    <div className="form-group-icon cpl-10 cpr-10">
                                        <p className="mb-3 color-green mt-2">{getResourceValue(this.state.manageProfileResources, 'OTP_MESSAGE')}</p>
                                    </div>
                                    <div className="row p-0 m-0">
                                        <div className="col-lg-12 col-12 row p-0 m-0">
                                            <div className="col-12 col-md-4 cpl-10 cpr-10 cpt-10 cpb-10">
                                                <div className="form-group-icon form-group" style={{ display: 'grid' }}>
                                                    <TextField
                                                        type="text"
                                                        id="outlined-password-input"
                                                        label={getResourceValue(this.state.manageProfileResources, 'OTP')}
                                                        placeholder={getResourceValue(this.state.manageProfileResources, 'OTP')}
                                                        className='mt-0 mb-0 d-flex'
                                                        margin="normal"
                                                        variant="outlined"
                                                        name="securityCode"
                                                        autoComplete='new-password'
                                                        onChange={(ev) => this.changeValue(ev)}
                                                        value={this.state.securityCode}
                                                    />
                                                    <div className="error-wrapper">{this.state.otpErr}</div>
                                                </div>
                                            </div>
                                            {this.props.roleType === ROLES.PATIENT ? (
                                                <div className="col-12 col-md-4 cpl-10 cpr-10 cpt-10 cpb-10">
                                                    <div className="form-group-icon position-relative datepicker-form-group form-group pb-1" style={{ display: 'contents' }}>
                                                        <div className={`own-custom-label ${this.state.valueInDate ? "active" : ""}`} style={{ left: 20 }}>
                                                            {getResourceValue(this.state.manageProfileResources, 'DOB')}
                                                        </div>
                                                        <div onClick={this.datePickerClicked}>
                                                            <DatePicker
                                                                selected={this.state.startDate}
                                                                onChange={this.dateChange}
                                                                onClickOutside={this.datePickerValue}
                                                                maxDate={new Date()}
                                                                scrollableYearDropdown={true}
                                                                yearDropdownItemNumber={100}
                                                                dateFormat="dd-MM-yyyy"
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
                                                                autoComplete="new-password"
                                                                showYearDropdown
                                                                showMonthDropdown
                                                                onChangeRaw={(ev) => ev.preventDefault()}
                                                            />
                                                        </div>
                                                        <div className="error-wrapper"> {this.state.emptyDob ? (<span>{getResourceValue(this.state.manageProfileResources, 'FIELD_REQUIRED')}</span>) : null}</div>
                                                    </div>
                                                </div>
                                            ) : null}
                                            <div className="col-12 col-md-4 cpl-10 cpr-10 cpt-10 cpb-10">

                                                <div className="form-group-icon form-group" style={{ display: 'grid' }}>
                                                    <TextField
                                                        type={this.state.newPasswordVisible ? "text" : "password"}
                                                        label={getResourceValue(this.state.manageProfileResources, 'PASSWORD')}
                                                        placeholder={getResourceValue(this.state.manageProfileResources, 'PASSWORD')}
                                                        className='mt-0 mb-0 d-flex'
                                                        margin="normal"
                                                        variant="outlined"
                                                        name="newPassword"
                                                        onChange={(ev) => this.changePassword(ev)}
                                                        value={this.state.newPassword}
                                                        autoComplete="new-password"
                                                    />
                                                    <div className="form-img-wrapper cursor" onClick={() => this.toggleEye('newPasswordVisible')}>
                                                        {this.state.newPasswordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                                    </div>
                                                    <div className="error-wrapper">
                                                        {/* {this.state.emptyNewPassword ? <span >Choose Password is empty</span> : null} */}
                                                        {this.state.newPasswordError}
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4 cpl-10 cpr-10 cpt-10 cpb-10">
                                                <div className="form-group-icon form-group" style={{ display: 'grid' }}>
                                                    <TextField
                                                        type={this.state.confirmPasswordVisible ? "text" : "password"}
                                                        label={getResourceValue(this.state.manageProfileResources, 'CONFIRM')}
                                                        placeholder={getResourceValue(this.state.manageProfileResources, 'CONFIRM')}
                                                        className='mt-0 mb-0 d-flex'
                                                        margin="normal"
                                                        variant="outlined"
                                                        name="confirmPassword"
                                                        onChange={(ev) => this.changeValue(ev)}
                                                        value={this.state.confirmPassword}
                                                    />
                                                    <div className="form-img-wrapper cursor" onClick={() => this.toggleEye('confirmPasswordVisible')}>
                                                        {this.state.confirmPasswordVisible ? <img src="/assets/img/eye-close.png" alt="lock" /> : <img src="/assets/img/eye.png" alt="lock" />}
                                                    </div>
                                                    <div className="error-wrapper">
                                                        {/* {this.state.emptyConfirmPassword ? <span >Confirm password is empty</span> : null} */}
                                                        {this.state.confirmPasswordError}
                                                        {this.state.notMatchPassword ? <span >{getResourceValue(this.state.manageProfileResources, 'PASSWORD_NOT_MATCH')}</span> : null}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="pswrd-info-list reset-pswrd-info-list list-unstyled cpl-10 cpr-10 cpt-10 m-0">
                                        <li className={`${this.state.minEightChar ? 'active' : ''}`}>{getResourceValue(this.state.manageProfileResources, 'CRITERIA_MIN')}</li>
                                        <li className={`${this.state.oneVarIncluded ? 'active' : ''}`}>{getResourceValue(this.state.manageProfileResources, 'CRITERIA_CASE')}</li>
                                        <li className={`${this.state.numberIncluded ? 'active' : ''}`}>{getResourceValue(this.state.manageProfileResources, 'CRITERIA_NUM')}</li>
                                        <li className={`${this.state.specialCharacter ? 'active' : ''}`}>{getResourceValue(this.state.manageProfileResources, 'CRITERIA_SPECIAL')}</li>
                                    </ul>
                                </>}

                            {this.props.currentAction === ACTIONS.CREATE ?
                                <>
                                    <div className="form-group-icon form-group cpl-10 cpr-10">
                                        <div className="form-group-icon form-group mb-0" style={{ display: 'grid' }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={this.state.isCheckedTermOfUse}
                                                        onChange={() => this.setState({
                                                            isCheckedTermOfUse: !this.state.isCheckedTermOfUse
                                                        })}
                                                        name="isCheckedTermOfUse"
                                                        color="primary"
                                                    />
                                                }
                                                label=
                                                {<>
                                                    <div>{this.getTermOfuseContent()}</div>
                                                </>}
                                                style={{ marginBottom: 0 }}
                                            />
                                            {this.state.isIframeOpen &&
                                                <div className='border term-of-use-box'>
                                                    <StaticPage resourceKey={RESOURCE_KEYS.TERMS_OF_USE} />
                                                </div>
                                            }

                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={this.state.isCheckedAllowToUse}
                                                        onChange={() => this.setState({
                                                            isCheckedAllowToUse: !this.state.isCheckedAllowToUse
                                                        })}
                                                        name="isCheckedAllowToUse"
                                                        color="primary"
                                                    />
                                                }
                                                label={getResourceValue(this.state.manageProfileResources, 'ALLOW_TO_USE')}
                                                style={{ marginBottom: 0 }}
                                            />
                                        </div>
                                    </div>
                                </>
                                :
                                <></>
                            }
                        </div>
                    </form>
                </div>

            </>

        )
    }

}

const mapStateToProps = state => ({
    aopList: state.common.aopList,
    hcpList: state.common.hcpList,
    userData: state.user.userData,
    userDetail: state.user.userDetail,
    otherUserData: state.user.otherUserData,
    organizationsArray: state.common.organizationsArray,
    orgId: state.user.orgId,
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(ManageProfileComponent));

