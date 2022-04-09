import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { CONSTANTS,API_METHODS } from '../Constants/types';
import TextEditor from "../Components/TextEditorComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

const AddEditStaticPageModal = React.memo((props) => {
    const [selectedResource, setSelectedResource] = useState([]);
    const [reRender, setReRender] = useState(false);

    useEffect(() => {
        if (props.currentData && props.editMode) {
            getSingleResource(props.currentData.resource_key_id);
        } else {
            setupResourceData();
        }
    }, []);

    const setupResourceData = async (languageResources = []) => {
        let resources = [];
        for (let language of props.languageList) {
            let resourceValue = "";
            let placeHolderValue = "";
            let infoValue = "";
            let index = languageResources.findIndex(e => e?.language_id == language.language_id);
            if (index >= 0) {
                resourceValue = languageResources[index].resource_value;
                placeHolderValue = languageResources[index].place_holder_value;
                infoValue = languageResources[index].info_value;
            }

            resources[language.language_id] = {
                resource_value: resourceValue,
                place_holder_value: placeHolderValue,
                language_id: language.language_id,
                language_name: language.language_name,
                info_value: infoValue,
                error: "",
                place_holder_error: ""
            }
        }
        setSelectedResource(resources);
        setReRender(!reRender);
    }

    const saveData = async (ev) => {
        ev.preventDefault();
        try {
            let formValidateVal = await formValidate();
            if (formValidateVal) {
                globalLoader(true);
                const formData = new FormData();
                if (props.editMode) {
                    formData.append('resource_key_id', props.currentData.resource_key_id);
                }
                formData.append('resource_data', JSON.stringify(selectedResource));
                let obj = {
                    method:API_METHODS.POST,
                    history:props.history,
                    api:'/save-static-page',
                    body:formData}
                let result = await CallApiAsync(obj);
                if (result?.data.status === 200) {
                    props.onCloseModal('success');
                    globalAlert('success', getResourceValue(props.resources, props.editMode > 0 ? "MENU_UPDATED" : "MENU_ADDED"));
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()))
                }
                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "addEditLanguage/saveData",
                errorStake: error.toString(),
                history:props.history
            };

            errorLogger(errorObject);
        }

    }

    const formValidate = async () => {
        let formValid = true;
        let defaultLanguageId = localStorage.getItem('default_language_id');
        let newResources = selectedResource;
        let resourceValueValidation = true;
        let resourcePlaceholderValidation = true;
        selectedResource.forEach((element, index) => {
            if (element) {
                if (element.place_holder_value) {
                    resourcePlaceholderValidation = false;
                }
            }
        });
        if (resourcePlaceholderValidation) {
            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "RESOURCES_VALIDATION"));
            formValid = false;
            newResources[defaultLanguageId].place_holder_error = getResourceValue(props.resources, "FIELD_REQUIRED");
        } else {
            newResources[defaultLanguageId].place_holder_error = "";
        }
        setSelectedResource(newResources);
        setReRender(!reRender);

        return formValid;
    }

    const getSingleResource = async (resource_key_id) => {
        globalLoader(true)

        let obj = {
            method: API_METHODS.POST,
            history: props.history,
            api: '/view-single-resource',
            body: {
                resource_key_id: resource_key_id
            }
        }
        setSelectedResource([]);

        let result = await CallApiAsync(obj);
        if (result.data.status === 200) {
            if (result.data.data.resources) {
                let languageResources = result.data.data.resources;
                setupResourceData(languageResources);
            }
        }  else {
            setupResourceData();
            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()))
        }
        globalLoader(false)
    }

    const saveResourceValue = (languageId, value, flag) => {
        let newResources = selectedResource;
        if (flag == "RESOURCE_VALUE") {
            newResources[languageId].resource_value = value;
        }

        if (flag == "RESOURCE_PLACEHOLDER") {
            newResources[languageId].place_holder_value = value;
        }

        if (flag == "RESOURCE_INFO_VALUE") {
            newResources[languageId].info_value = value;
        }
        setSelectedResource(newResources);
    }

    return (
        <Modal classNames={{ modal: "modal-lg-full modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={false} >
            <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => ev.preventDefault()}>
                <div className="">
                    <div className="row d-flex justify-content-between pb-3 m-0" >
                        <div className="d-flex align-self-center" >
                            <p className="login-txt mb-0 primary-color"> {props.editMode ? getResourceValue(props.resources, 'EDIT') : getResourceValue(props.resources, 'ADD_NEW_PAGE')}</p>
                        </div>
                        <div className="btn-wrapper">
                            <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, 'CANCEL')}</button>
                            <button type="button" onClick={saveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, 'SAVE')}</button>
                        </div>
                    </div>

                    <div className="content-container form-own add-list-form flex-wrap cpl-10 cpr-10 cpt-10 cpb-10" >
                        {
                            selectedResource && selectedResource.map((resource) => (
                                <div key={resource.language_id}>
                                    <div className="col-md-12 col-12 p-0">
                                        <h2 className="font-16 cpt-10 font-600">{`${resource.language_id} | ${resource.language_name}`}</h2>
                                    </div>

                                    <div className="form-group col-md-6 col-12 p-0">
                                        <h2 className="font-14 font-600 cpt-10">{getResourceValue(props.resources, 'HEADING')}</h2>

                                        <TextField
                                            history={props.history}
                                            onChange={(ev) => saveResourceValue(resource.language_id, ev.target.value, "RESOURCE_PLACEHOLDER")}
                                            label={getResourceValue(props.resources, 'HEADING')}
                                            placeholder={getResourceValue(props.resources, 'HEADING')}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            type="text"
                                            name="name"
                                            defaultValue={resource.place_holder_value}
                                        />
                                        <div className="error-wrapper">{resource.place_holder_error}</div>
                                    </div>

                                    <div className="form-group col-md-12 col-12 p-0">
                                        <h2 className="font-14 cpt-10 font-600">{getResourceValue(props.resources, 'SUBHEADING')}</h2>
                                        <TextField
                                            history={props.history}
                                            data={resource.info_value}
                                            onChange={(ev) => saveResourceValue(resource.language_id, ev.target.value, "RESOURCE_INFO_VALUE")}
                                            label={getResourceValue(props.resources, 'SUBHEADING')}
                                            placeholder={getResourceValue(props.resources, 'SUBHEADING')}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            defaultValue={resource.info_value}
                                            type="text"
                                            name="name"
                                            multiline
                                        />
                                    </div>
                                    <div className="form-group col-md-12 col-12 p-0">
                                        <h2 className="font-14 cpt-10 font-600">{getResourceValue(props.resources, 'CONTENT')}</h2>
                                        <TextEditor
                                            history={props.history}
                                            data={resource.resource_value}
                                            onChange={(value) => saveResourceValue(resource.language_id, value, "RESOURCE_VALUE")}
                                        />
                                        <div className="error-wrapper">{resource.error}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </form>
        </Modal >
    )
})

const mapStateToProps = (state) => ({
    languageList: state.common.languageList,
    languageId: state.common.languageId,
    textEditorImages: state.common.textEditorImages
});

export default connect(mapStateToProps)(withRouter(AddEditStaticPageModal));