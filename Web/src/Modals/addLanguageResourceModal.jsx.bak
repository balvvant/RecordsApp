import { TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, CONSTANTS,resourceFields } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';


const AddLanguageResourceModal = React.memo((props) => {
    const [groupId, setGroupId] = useState('');
    const [groupName, setGroupName] = useState('');
    const [resourceKeyId, setResourceKeyId] = useState('');
    const [resourceKey, setResourceKey] = useState('');
    const [language, setLanguage] = useState('');
    const [resourceValue, setResourceValue] = useState('');
    const [resourceId, setResourceId] = useState('');
    const [placeHolderValue, setPlaceHolderValue] = useState('');
    const [resources, setResources] = useState([]);
    const [resourceError, setResourceError] = useState([]);
    const [masterResource, setMasterrResource] = useState([]);

    const [resourceValueError, setResourceValueError] = useState("");
    const [placeHolderValueError, setPlaceHolderValueError] = useState("");

    useEffect(() => {
        setPropsToState();
    }, []);

    const setPropsToState = () => {

        try {

            globalLoader(true);

            setGroupId(props.currentData.group_id ? props.currentData.group_id : '');
            setGroupName(props.currentData.group_name ? props.currentData.group_name : '');
            setResourceKeyId(props.currentData.resource_key_id ? props.currentData.resource_key_id : '');
            setResourceKey(props.currentData.resource_key ? props.currentData.resource_key : '');

            getSingleResource(props.currentData.resource_key_id ? props.currentData.resource_key_id : '');

        } catch (error) {
            let errorObject = {
                methodName: "AddLanguageResourceModal/setPropsToState",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const getSingleResource = async (resource_key_id) => {

        let obj = {
            method: API_METHODS.POST,
            history: props.history,
            api: '/view-single-resource',
            body: {
                resource_key_id: resource_key_id
            }
        }

        let result = await CallApiAsync(obj);

        if (result.data.status === 200) {
            // setResource

            let resources = [];
            let resourceErrors = [];
            if (result.data.data.resources) {
                let languageResources = result.data.data.resources;
                for (let language of props.languageList) {

                    let resourceValue = "";
                    let placeHolderValue = "";
                    let index = languageResources.findIndex(e => e.language_id == language.language_id);
                    if (!(index < 0)) {
                        resourceValue = languageResources[index].resource_value;
                        placeHolderValue = languageResources[index].place_holder_value;

                    }

                    resources[language.language_id] = {
                        resource_value: resourceValue,
                        place_holder_value: placeHolderValue,
                        language_id: language.language_id,
                        language_name: language.language_name,
                        error: ""
                    }

                    resourceErrors[language.language_id] = "";
                }
                setResourceError(resourceErrors);
                setResources(resources);
                setMasterrResource(languageResources);
            }

        } else {
            globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()))
        }

        globalLoader(false)
    }


    const saveData = async (ev) => {
        ev.preventDefault();
        try {
            let formValidateVal = await formValidate();
            if (formValidateVal) {


                let resourceData = [];
                resources.forEach((element, index) => {
                    if (element) {
                        resourceData[index] = {
                            resource_value: element.resource_value,
                            place_holder_value: element.place_holder_value
                        }
                    }
                });
                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/edit-resources',
                    body: {
                        resource_key_id: resourceKeyId,
                        resource_data: resourceData
                    }
                }
                let result = await CallApiAsync(obj);

                if (result.data.status === 200) {
                    props.onCloseModal('success')
                    globalAlert('success', getResourceValue(props.resources, 'RESOURCE_UPDATED'));
                } else {

                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()))
                }

                globalLoader(false)
            }
        } catch (error) {
            let errorObject = {
                methodName: "addEditLanguage/saveData",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const formValidate = async () => {
        let formValid = true;

        let newResources = resources;
        resources.forEach((element, index) => {
            if (element) {
                if (!element.resource_value) {
                    formValid = false;
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "RESOURCES_VALIDATION"))
                    newResources[index].error = getResourceValue(props.resources, "FIELD_REQUIRED");
                } else {
                    newResources[index].error = "";
                }
            }
        });
        setResources(newResources);

        return formValid
    }

    const saveResourceValue = async (languageId, value, flag) => {
        let newResources = resources;
        if (flag == "RESOURCE_VALUE") {
            newResources[languageId].resource_value = value;
        }

        if (flag == "PLACEHOLDER_VALUE") {
            newResources[languageId].place_holder_value = value;
        }

        setResources(newResources);
    }


    const renderContent = () => {
        return (
            <form className="form-own px-md-0 " noValidate autoComplete="off">

                <div className="row d-flex justify-content-between  cpl-10 cpr-10" >
                    <div className="d-flex align-self-center" >
                        <p className="login-txt mb-0 primary-color">{getResourceValue(props.resources, 'EDIT')} {getResourceValue(props.resources, 'RESOURCE')}</p>

                    </div>
                    <div className="btn-wrapper">
                        <button type="button" className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, 'CANCEL')}</button>
                        <button type="button" className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100" onClick={(ev) => saveData(ev)}  >{getResourceValue(props.resources, 'SAVE')}</button>
                    </div>
                </div>

                <div className="row d-flex justify-content-between p-0   " >
                    {/* Group */}
                    <div className="col-md-6 col-12  cpt-10 cpb-10 cpl-10 cpr-10">
                        <div className="form-group-icon form-group" style={{ display: 'contents' }}>
                            <TextField
                                label={getResourceValue(props.resources, 'GROUP')}
                                placeholder={getResourceValue(props.resources, 'GROUP', resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex nonEditable'
                                margin="normal"
                                variant="outlined"
                                name="group"
                                disabled
                                value={groupName}
                            />
                        </div>
                    </div>
                    {/* Resource Key */}
                    <div className="col-md-6 col-12 cpt-10 cpb-10 cpl-10 cpr-10">
                        <div className="form-group-icon form-group" style={{ display: 'contents' }}>
                            <TextField
                                label={getResourceValue(props.resources, 'RESOURCE_KEY')}
                                placeholder={getResourceValue(props.resources, 'RESOURCE_KEY', resourceFields.Placeholder)}
                                className='mt-0 mb-0 d-flex nonEditable'
                                margin="normal"
                                variant="outlined"
                                name="resourceKey"
                                disabled
                                value={resourceKey}
                            />
                        </div>
                    </div>
                </div>
                {
                    resources && resources.map((resource) => (
                        <div className="row d-flex justify-content-between p-0  " key={resource.language_id}>
                            <div className="col-md-12 col-12 px-2">
                                <h2 className="font-16 cpt-10 font-600">{`${resource.language_id} | ${resource.language_name}`}</h2>
                            </div>
                            {/* Resource value */}
                            <div className="col-md-6 col-12 cpt-10 cpb-10 cpl-10 cpr-10">
                                <div className="form-group-icon form-group" style={{ display: 'contents' }}>
                                    <TextField
                                        label={getResourceValue(props.resources, 'RESOURCE_VALUE')}
                                        placeholder={getResourceValue(props.resources, 'RESOURCE_VALUE', resourceFields.Placeholder)}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="resource_value"
                                        onChange={(ev) => saveResourceValue(resource.language_id, ev.target.value, "RESOURCE_VALUE")}
                                        defaultValue={resource.resource_value}
                                    />

                                    <div className="error-wrapper">{resource.error}</div>
                                </div>
                            </div>

                            <div className="col-md-6 col-12 cpt-10 cpb-10 cpl-10 cpr-10">
                                <div className="form-group-icon form-group" style={{ display: 'contents' }}>
                                    <TextField
                                        label={getResourceValue(props.resources, 'RESOURCE_PLACEHOLDER')}
                                        placeholder={getResourceValue(props.resources, 'RESOURCE_PLACEHOLDER', resourceFields.Placeholder)}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        name="resource_value"
                                        onChange={(ev) => saveResourceValue(resource.language_id, ev.target.value, "PLACEHOLDER_VALUE")}
                                        defaultValue={resource.place_holder_value}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                }

            </form >
        )
    };

    return (
        <div>
            <Modal classNames={{ modal: "modal-lg-full modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={false} >
                {renderContent()}
            </Modal>
        </div>
    )
})


const mapStateToProps = (state) => ({
    languageList: state.common.languageList,
});

export default connect(mapStateToProps)(withRouter(AddLanguageResourceModal));