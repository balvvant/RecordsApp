import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';
import { API_METHODS, CONSTANTS, resourceFields } from '../Constants/types';



const CategoryModal = React.memo((props) => {
    const [name, setName] = useState('');
    const [typeList, setTypeList] = useState([]);
    const [categoryErrorMessage, setCategoryErrorMessage] = useState('');
    const [placeholderTxt, setPlaceholderTxt] = useState('');
    const [hcpArry, setHcpArray] = useState([]);
    const [hcpVal, setHcpVal] = useState([]);
    const [oldHcpVal, setoldHcpVal] = useState([]);
    const [emptyHcpVal, setEmptyHcpVal] = useState(false);
    const [address, setAddress] = useState('');
    const [copyright, setCopyright] = useState('');
    const [emptyAddress, setEmptyAddress] = useState(false);
    const [file, setFile] = useState(null);
    const [filename, setFileName] = useState('');

    useEffect(() => {
        if (props.currentData && props.editMode) {
            setName(props.currentData.name)

        }
        if (props.currentType && props.tabArray) {

            let txt = props.tabArray.find(x => x.val === props.currentType);
            let name = getResourceValue(props.resources, txt.name);
            setPlaceholderTxt(name);

        }
        if (props.currentType === "aop") {
            callHcpList();
            if (props.editMode) {
                let NewHcpVal = props.currentData.aop_hcp_mappings && props.currentData.aop_hcp_mappings.length > 0 &&
                    props.currentData.aop_hcp_mappings.map(data => {
                        return data.hcp_type.name
                    })
                setHcpVal(NewHcpVal ? NewHcpVal : [])
                setoldHcpVal(NewHcpVal ? NewHcpVal : [])

            }
        }
    }, []);



    const callHcpList = async () => {
        globalLoader(true)
        let obj = {
            method: API_METHODS.POST,
            history: props.history,
            api: '/view-job-titles',
            body: {}
        }
        let result = await CallApiAsync(obj);

        if (result.data.status === 200) {
            setHcpArray(result.data.data.hcpList)
            globalLoader(false)
        }
        else {
            globalLoader(false)
            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()));
        }
    }

    const saveData = async (ev) => {
        ev.preventDefault();
        try {
            let formValidateVal = await formValidate();
            if (formValidateVal) {
                if (name || typeList.length > 0) {
                    let localTypeList = [];

                    if (props.editMode == false || (props.editMode == true && props.currentData && name != props.currentData.name)) {
                        if (name) {
                            setCategoryErrorMessage('');
                            localTypeList = [...typeList];
                            localTypeList.push(name);
                            setName('');
                            setTypeList(localTypeList)
                        }
                        else {
                            localTypeList = [...typeList];
                        }
                    }

                    globalLoader(true)

                    let result;
                    if (props.currentType === 'hcp') {
                        let obj = {
                            method: API_METHODS.POST,
                            history: props.history,
                            api: '/save-job-title',
                            body: {
                                name: localTypeList.toString(),
                            }
                        }
                        if (props.editMode) {
                            obj.body.job_title_id = props.currentData.job_title_id;

                            result = await CallApiAsync(obj);
                        }
                        else {
                            result = await CallApiAsync(obj);
                        }
                    }
                    else if (props.currentType === 'aop') {
                        let obj = {
                            method: API_METHODS.POST,
                            api: '/save-specialty',
                            history: props.history,
                            body: {
                                name: localTypeList.toString(),
                            }
                        }
                        if (props.editMode) {
                            obj.body.specialty_id = props.currentData.specialty_id
                            result = await CallApiAsync(obj);
                        }
                        else {
                            result = await CallApiAsync(obj);
                        }

                    }


                    if (result.data.status === 200) {
                        props.onCloseModal('success')

                        globalAlert('success', getResourceValue(props.resources, props.currentType === 'hcp' ? 'JOB_TITLE_SUCCESS' : 'SPECIALTY_SUCCESS'))
                    }
                    else {
                        globalLoader(false)
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()))
                    }

                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "addCategoryModal/saveData",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const formValidate = async () => {
        let formValid = true;
        let nameMinLength = getResourceValue(props.resources, "NAME", resourceFields.Min_Length);
        let nameMaxLength = getResourceValue(props.resources, "NAME", resourceFields.Max_Length);
        var specailChar = /[0-9`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

        if (props.currentType === 'hcp') {
            let validateName = false;
            if (!name.trim() && typeList.length <= 0) {
                formValid = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_REQUIRED'));
            }
            else if (typeList.length > 0 && name.trim() != '') {
                validateName = true;
            }
            else if (name.trim() != '') {
                validateName = true;
            }

            if (validateName) {
                if (name.length < nameMinLength || name.length > nameMaxLength) {
                    formValid = false;
                    setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', nameMinLength).replace('{max_length}', nameMaxLength));
                }
            }

            if (specailChar.test(name)) {
                formValid = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_INVALID'));
            }

        }

        if (props.currentType === 'aop') {
            let validateName = false;

            if (!name.trim() && typeList.length <= 0) {
                formValid = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_REQUIRED'));
            }
            else if (typeList.length > 0 && name != '') {
                validateName = true;
            }
            else if (name.trim() != '') {
                validateName = true;
            }

            if (validateName) {
                if (name.length < nameMinLength || name.length > nameMaxLength) {
                    formValid = false;
                    setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', nameMinLength).replace('{max_length}', nameMaxLength));
                }
            }
            if (specailChar.test(name)) {
                formValid = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_INVALID'));
            }

        }

        return formValid

    }

    const pushListItem = async (ev) => {
        ev.preventDefault();
        try {
            let validate = true;
            var specailChar = /[0-9`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

            let nameMinLength = getResourceValue(props.resources, "NAME", resourceFields.Min_Length);
            let nameMaxLength = getResourceValue(props.resources, "NAME", resourceFields.Max_Length);

            if (!name) {
                validate = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_REQUIRED'));
            } if (name.length < 2 || name.length > 100) {
                validate = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', nameMinLength).replace('{max_length}', nameMaxLength));
            } else {
                validate = true;
                setCategoryErrorMessage('');
            }

            if (specailChar.test(name)) {
                validate = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_INVALID'));
            }




            if (validate) {
                globalLoader(true);
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,

                    body: {
                        name: name
                    }
                }
                let res;
                if (props.currentType === 'hcp') {
                    obj.api = '/check-job-title';
                    res = await CallApiAsync(obj);
                }
                else if (props.currentType === 'aop') {
                    obj.api = '/check-specialty'
                    res = await CallApiAsync(obj)
                }

                if (res?.data?.status === 200) {
                    let localTypeList = [...typeList];
                    localTypeList.push(name);
                    setName('');
                    setTypeList(localTypeList);
                }

                else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, res?.data?.status.toString()))
                }
                globalLoader(false);
            }

        } catch (error) {
            let errorObject = {
                methodName: "addCategoryModal/pushListItem",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }
    const removeListItem = (index) => {
        let localTypeList = [...typeList];
        localTypeList.splice(index, 1);
        setTypeList(localTypeList)
    }

    return (
        <Modal classNames={{ modal: "modal-md modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
            <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => props.editMode ? saveData(ev) : pushListItem(ev)}>
                <div className="">
                    <p className="login-txt primary-color"> {props.editMode ? getResourceValue(props.resources, 'EDIT') : getResourceValue(props.resources, 'ADD_NEW')} {props.currentTabTitle}</p>

                    <div className="form-own  add-list-form d-flex flex-wrap" >
                        <div className="form-group flex-1">
                            <TextField
                                id="outlined-textarea"
                                label={placeholderTxt}
                                placeholder={placeholderTxt}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                name="name"
                                onChange={(ev) => setName(ev.target.value)}
                                value={name}
                                inputRef={input => input && input.focus()}
                            />

                            <div className="error-wrapper">

                                <span>{categoryErrorMessage}</span>

                            </div>
                        </div>

                        {!props.editMode ?

                            <div className="add-list-button">
                                <button className="btn btn-own min-height-btn mw-100" type="submit">
                                    {getResourceValue(props.resources, 'ADD_TO_LIST')}
                                </button>

                            </div> : null}


                    </div>
                    {props.currentType !== "organisation" &&
                        typeList && typeList.length > 0 ?
                        <ul className="list-unstyled added-item-list pb-3">
                            {typeList.map((item, index) => (
                                <li className="d-flex flex-wrap" key={index}>
                                    <div className="flex-1">{item}</div>
                                    <div className="remove-list-txt font-14 text-underline cursor" onClick={() => removeListItem(index)}>
                                        {getResourceValue(props.resources, 'REMOVE')}
                                    </div>
                                </li>
                            ))}


                        </ul> : null}


                    <div className="btn-wrapper">
                        <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, 'CANCEL')}</button>
                        <button type="button" onClick={saveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, 'SAVE')}</button>
                    </div>
                </div>
            </form>
        </Modal>

    )
})



export default CategoryModal