import TextField from '@material-ui/core/TextField';
import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, CONSTANTS, resourceFields } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';



const MediaCategoryModal = React.memo((props) => {
    const [name, setName] = useState('');
    const [label, setLabel] = useState('');
    const [title, setTitle] = useState('');
    const [typeList, setTypeList] = useState([]);
    const [categoryErrorMessage, setCategoryErrorMessage] = useState('');

    let textInput = null;


    useEffect(() => {
        if (props.currentData && props.editMode) {
            setName(props.currentData.category_name)

        }

        $(textInput).find('input').focus();

        // textInput
    }, [props?.currentData?.category_name]);

    useEffect(() => {

        let titleData = props.tabArray.find(x => x.val === props.currentTabActive);
        if (titleData.parent_category_id == 1) {
            setTitle(getResourceValue(props.resources, 'CONDITION'));
        } else if (titleData.parent_category_id == 2) {
            setTitle(getResourceValue(props.resources, 'TREATMENT'));
        } else if (titleData.parent_category_id == 3) {
            setTitle(getResourceValue(props.resources, 'PARTNERS'));
        }
    }, [props.currentTabActive]);



    const saveData = async (ev) => {
        ev.preventDefault();
        try {
            let validate = true;
            let validateName = false;
            var specailChar = /[0-9`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

            if (!name && typeList.length <= 0) {
                validate = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_REQUIRED'));
            }
            else if (typeList.length > 0 && name != '') {
                validateName = true;
            }
            else if (name != '') {
                validateName = true;
            }

            if (validateName) {
                let nameMinLength = getResourceValue(props.resources, "NAME", resourceFields.Min_Length);
                let nameMaxLength = getResourceValue(props.resources, "NAME", resourceFields.Max_Length);
                if (name.length < nameMinLength || name.length > nameMaxLength) {
                    validate = false;
                    setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_LIMIT').replace('{min_length}', nameMinLength).replace('{max_length}', nameMaxLength));
                }
            }

            if (specailChar.test(name)) {
                validate = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_INVALID'));
            }


            if (validate) {
                let localTypeList = [];

                if (props.editMode == false || (props.editMode == true && props.currentData && name != props.currentData.category_name)) {
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
                let parent_category_id = props.tabArray.find(x => x.val === props.currentTabActive).parent_category_id;
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/',
                    body: {
                        name: localTypeList.toString(),
                        parent_category_id: parent_category_id
                    }
                }
                let result;
                if (props.editMode) {
                    obj.body.category_id = props.currentData.category_id
                    delete obj.body.parent_category_id;
                    obj.api = '/edit-category'
                    result = await CallApiAsync(obj);
                }
                else {
                    obj.api = '/add-category'
                    result = await CallApiAsync(obj)
                }

                if (result.data.status === 200) {
                    props.onCloseModal('success')
                    globalAlert('success', getResourceValue(props.resources, obj.api === "/add-category" ? 'CATEGORY_SUCCESS':'RECORD_UPDATED'))
                }
                else {
                    globalLoader(false)
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()))
                }

            }

        } catch (error) {
            let errorObject = {
                methodName: "mediaCategoryModal/saveData",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }

    const pushListItem = async (ev) => {
        ev.preventDefault();
        try {
            let validate = true;
            let nameMinLength = getResourceValue(props.resources, "NAME", resourceFields.Min_Length);
            let nameMaxLength = getResourceValue(props.resources, "NAME", resourceFields.Max_Length);
            var specailChar = /[0-9`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

            if (!name) {
                validate = false;
                setCategoryErrorMessage(getResourceValue(props.resources, 'FIELD_REQUIRED'));
            } else if (name.length < nameMinLength || name.length > nameMaxLength) {
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
                let localTypeList = [...typeList];
                globalLoader(true);

                let res;
                let parent_category_id = props.tabArray.find(x => x.val === props.currentTabActive).parent_category_id;
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/check-category',
                    body: {
                        name: name,
                        parent_category_id: parent_category_id

                    }
                }

                res = await CallApiAsync(obj);

                if (res?.data?.status === 200) {
                    localTypeList.push(name);
                    setName('');
                    setTypeList(localTypeList)
                }
                else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, res?.data?.status.toString()))
                }
                globalLoader(false);
            }
        } catch (error) {
            let errorObject = {
                methodName: "mediaCategoryModal/pushListItem",
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
        <Modal classNames={{ modal: "modal-md modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={false} closeIcon={''}>
            <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => props.editMode ? saveData(ev) : pushListItem(ev)}>
                <div className="">
                    <p className="login-txt mb-2 primary-color">
                        {props.editMode ? getResourceValue(props.resources, 'EDIT') : getResourceValue(props.resources, 'ADD_NEW')} {title}</p>

                    <div className="form-own pt-2 add-list-form d-flex flex-wrap" >
                        <div className="form-group pb-1 flex-1">
                            <TextField
                                id="outlined-textarea"
                                label={label}
                                placeholder={label}
                                className='mt-0 mb-0 d-flex'
                                margin="normal"
                                variant="outlined"
                                name="name"
                                onChange={(ev) => setName(ev.target.value)}
                                value={name}
                                // inputRef={input => input && input.focus()}
                                // focused={textInput}
                                ref={(input) => { textInput = input; }}
                            />

                            <div className="error-wrapper">
                                <span>{categoryErrorMessage}</span>
                            </div>
                        </div>

                        {!props.editMode ?

                            <div className="add-list-button">
                                <button className="btn btn-own min-height-btn mw-100" type="submit">
                                    {props.addList}
                                </button>

                            </div> : null}


                    </div>

                    {typeList && typeList.length > 0 ?
                        <ul className="list-unstyled added-item-list pb-3">
                            {typeList.map((item, index) => (
                                <li className="d-flex flex-wrap" key={index}>
                                    <div className="flex-1">{item}</div>
                                    <div className="remove-list-txt font-14 text-underline cursor" onClick={() => removeListItem(index)}>
                                        {props.removeButton}
                                    </div>
                                </li>
                            ))}
                        </ul> : null}


                    <div className="btn-wrapper">
                        <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{props.cancelButton}</button>
                        <button type="button" onClick={saveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{props.saveButton}</button>
                    </div>





                </div>
            </form>
        </Modal>

    )
})



export default withRouter(MediaCategoryModal)