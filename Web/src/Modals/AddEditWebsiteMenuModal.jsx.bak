import { FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, GLOBAL_API, ImageFileTypes, resourceFields, CONSTANTS, resourceGroups } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';
import ImgViewerModal from '../Modals/imgViewerModal';

const AddEditWebsiteMenuModal = React.memo((props) => {
    const [menuId, setMenuId] = useState(0);
    const [menuType, setMenuType] = useState(0);
    const [footerHeaderMenu, setFooterHeaderMenu] = useState(null);
    const [menuTypeResources, setMenuTypeResources] = useState([]);
    const [menuResources, setMenuResources] = useState([]);
    const [parentMenus, setParentMenus] = useState([]);
    const [footerHeaderResources, setFooterHeaderResources] = useState([]);
    const [isFooterSelected, setIsFooterSelected] = useState(false);
    const [isHeaderSelected, setIsHeaderSelected] = useState(false);
    const [footerResourceKeyId, setFooterResourceKeyId] = useState(0);
    const [sliderResourceKeyId, setSliderResourceKeyId] = useState(0);
    const [headerResourceKeyId, setHeaderResourceKeyId] = useState(0);
    const [menuResourcekeyId, setMenuResourcekeyId] = useState(null);
    const [parentMenu, setParentMenu] = useState(null);
    const [sequenceNo, setSequenceNo] = useState(null);
    const [menuTypeErrorMessage, setMenuTypeErrorMessage] = useState('');
    const [resourceKeyErrorMessage, setResourceKeyErrorMessage] = useState('');
    const [sequenceNoErrorMessage, setSequenceNoErrorMessage] = useState('');
    const [footerHeaderMenuErrorMessage, setFooterHeaderMenuErrorMessage] = useState('');
    const [isSliderSelected, setIsSliderSelected] = useState(false);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [imageFileErrorMessage, setImageFileErrorMessage] = useState('');
    const [imgView, setImgView] = useState(false);

    useEffect(() => {
        createParentDropdown();
        let menuTypeResources = props.resources.filter((e) => e.group_id == resourceGroups.MENU_GROUPS);
        setMenuTypeResources(menuTypeResources);
        let menuResources = props.resources.filter((e) => e.group_id == resourceGroups.MENUS);
        setMenuResources(menuResources);
        let footerHeaderResources = props.resources.filter((e) => e.group_id == resourceGroups.FOOTER_MENU_HEADER_GROUPS);
        setFooterHeaderResources(footerHeaderResources);
        let footerResourceKeyId = getResourceValue(props.resources, 'FOOTER', resourceFields.Key_Id);
        setFooterResourceKeyId(footerResourceKeyId);

        let sliderResourceKeyId = getResourceValue(props.resources, 'SLIDER', resourceFields.Key_Id);
        setSliderResourceKeyId(sliderResourceKeyId);

        let headerResourceKeyId = getResourceValue(props.resources, 'HEADER', resourceFields.Key_Id);
        setHeaderResourceKeyId(headerResourceKeyId);

        if (props.currentData && props.editMode) {
            setMenuId(props.currentData.website_menu_id)
            setMenuType(props.currentData.menu_type)
            if (props.currentData.menu_type == footerResourceKeyId) {
                setIsFooterSelected(true);
            }
            if (props.currentData.menu_type == sliderResourceKeyId) {
                setIsSliderSelected(true)
            }
            if (props.currentData.menu_type == headerResourceKeyId) {
                setIsHeaderSelected(true)
            }

            setFooterHeaderMenu(props.currentData.menu_group_id ? props.currentData.menu_group_id : null)
            setSequenceNo(props.currentData.sequence_no)
            setParentMenu(props.currentData.parent_menu_id)
            setMenuResourcekeyId(props.currentData.menu_resourcekey_id)
            if (props.currentData.image_name) {
                setImageFileName(props.currentData.image_name);
                setImgSrc(`${GLOBAL_API}/${props.currentData.image_name}`);
            }

        }
    }, []);

    const createParentDropdown = () => {
        let parentMenusList = [];
        if (props.menus && props.menus.length > 0) {
            props.menus.map(menu => {
                if (menu.parent_menu_id > 0) {
                    if (parentMenusList.findIndex(e => e.id == menu.parent_menu_id) < 0) {
                        if (menu.place_holder_value) {
                            parentMenusList.push({
                                id: menu.parent_menu_id,
                                value: menu.parent_menu
                            });
                        }
                    }
                }
                if (menu.place_holder_value) {
                    parentMenusList.push({
                        id: menu.website_menu_id,
                        value: menu.place_holder_value
                    });
                }
            });
        }
        setParentMenus(parentMenusList);
    }

    const changeFile = (ev) => {
        try {
            if (ev.target.files && ev.target.files.length > 0) {
                let allValidFile = true;
                let fileType = ev.target.files[0].name.split('.').pop();
                let file_name = ev.target.files[0].name;

                if (ImageFileTypes.includes(fileType.toLowerCase())) {
                    if (ev.target.files[0].size / 1024 == 0) {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "FILE_SIZE_LIMIT"));
                    } else {
                        if (allValidFile) {
                            let file = ev.target.files[0];
                            setImageFileName(file_name);
                            setImageFile(file);

                            var reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onloadend = () => {
                                setImgSrc(reader.result);
                            }
                        }
                    }
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, "IMAGE_FILES_VALIDATION"));
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "addEditwebsite/changeFile",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const saveData = async (ev) => {
        ev.preventDefault();
        try {

            let formValidateVal = await formValidate();
            if (formValidateVal) {
                globalLoader(true);

                const formData = new FormData();
                formData.append('menu_type', menuType);
                formData.append('menu_group_id', footerHeaderMenu);
                formData.append('menu_resourcekey_id', menuResourcekeyId);
                formData.append('parent_menu', parentMenu);
                formData.append('sequence_no', sequenceNo);
                formData.append('image_name', imageFileName);

                if (props.editMode) {
                    formData.append('menu_id', menuId);
                }
                if (imageFile) {
                    formData.append('image_file', imageFile);
                }

                let obj = {
                    method: API_METHODS.POST,
                    history: props.history,
                    api: '/save-website-menu',
                    body: formData
                }
                let result = await CallApiAsync(obj);
                if (result.data.status === 200) {
                    props.onCloseModal('success')
                    globalAlert('success', getResourceValue(props.resources, props.editMode ? 'MENU_UPDATED' : 'MENU_ADDED'))
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()));

                    if (result.data?.data?.errors) {
                        setMenuTypeErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.menu_type));
                        setResourceKeyErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.menu_resourcekey_id));
                        setFooterHeaderMenuErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.menu_group_id));
                        setSequenceNoErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.sequence_no));
                        setImageFileErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.image_name));
                    }
                }

                globalLoader(false)
            }
        } catch (error) {
            console.log('error: ', error);
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
        if (!menuType) {
            formValid = false;
            setMenuTypeErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        } else {
            if (menuType == footerResourceKeyId) {
                if (!footerHeaderMenu) {
                    formValid = false;
                    setFooterHeaderMenuErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
                } else {
                    setFooterHeaderMenuErrorMessage("");
                }
            } else {
                setFooterHeaderMenuErrorMessage("");
            }

            if (menuType == sliderResourceKeyId) {
                if (!imageFileName) {
                    formValid = false;
                    setImageFileErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
                } else {
                    setImageFileErrorMessage('')
                }
            } else {
                setImageFileErrorMessage('')
            }
            if (menuType == headerResourceKeyId || menuType == footerResourceKeyId) {
                if (menuResourcekeyId <= 0) {
                    setResourceKeyErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
                } else {
                    setResourceKeyErrorMessage();
                }
            } else {
                setResourceKeyErrorMessage();
            }

            setMenuTypeErrorMessage("");
        }
        if (sequenceNo == null || sequenceNo === '') {
            formValid = false;
            setSequenceNoErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        } else if (sequenceNo < 0 || isNaN(sequenceNo)) {
            formValid = false;
            setSequenceNoErrorMessage(getResourceValue(props.resources, "FIELD_INVALID"));
        } else {
            setSequenceNoErrorMessage("");
        }

        return formValid;
    }

    const selectMenutype = async (menuTypeId) => {
        if (menuTypeId == footerResourceKeyId) {
            setIsFooterSelected(true);
        } else {
            setIsFooterSelected(false);
        }
        if (menuTypeId == sliderResourceKeyId) {
            setIsSliderSelected(true)
        } else {
            setIsSliderSelected(false)
        }
        if (menuTypeId == headerResourceKeyId) {
            setIsHeaderSelected(true)
        } else {
            setIsHeaderSelected(false)
        }
        setMenuType(menuTypeId);
    }

    return (
        <>
            <Modal classNames={{ modal: "modal-md modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false}>
                <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => ev.preventDefault()}>
                    <div className="">
                        <div className="row d-flex justify-content-between cpb-10 m-0" >
                            <div className="d-flex align-self-center" >
                                <p className="login-txt mb-0 primary-color"> {props.editMode ? getResourceValue(props.resources, 'EDIT') : getResourceValue(props.resources, 'ADD_NEW_MENU')}</p>
                            </div>
                            <div className="btn-wrapper">
                                <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => props.onCloseModal()}>{getResourceValue(props.resources, 'CANCEL')}</button>
                                <button type="button" onClick={saveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, 'SAVE')}</button>
                            </div>
                        </div>

                        <div className="content-container form-own add-list-form flex-wrap cpl-10 cpr-10 cpt-10 cpb-10" >
                            <div className="form-group pb-1 flex-1">
                                <h2 className="font-16 font-600">{getResourceValue(props.resources, 'MENU_TYPE')}</h2>
                                {menuTypeResources.length > 0 && <RadioGroup name="is_defualt" className="row px-2 flex-row">

                                    {menuTypeResources.map((resource) => {
                                        return <div key={resource.resource_key_id} className="col-md-2 col-12 px-2">
                                            <FormControlLabel value={resource.resource_key_id} control={<Radio onChange={(ev) => selectMenutype(resource.resource_key_id)} checked={menuType == resource.resource_key_id} />} label={resource.resource_value} />
                                        </div>
                                    })}
                                </RadioGroup>}
                                <div className="error-wrapper">
                                    {menuTypeErrorMessage}
                                </div>
                            </div>
                            {/* FOOTER_HEADER Key_Id*/}
                            {isFooterSelected &&
                                <>
                                    <div className="form-group row pb-2 flex-1 px-2">
                                        <div className="col-md-12 col-12 px-2">
                                            <h2 className="font-16 font-600">{getResourceValue(props.resources, 'FOOTER_HEADER')}</h2>
                                            <FormControl variant="outlined">
                                                <InputLabel id="country-label">{getResourceValue(props.resources, 'FOOTER_HEADER')}</InputLabel>
                                                <Select
                                                    labelId="country-label"
                                                    id="demo-simple-select-outlined"
                                                    value={footerHeaderMenu}
                                                    onChange={(ev) => setFooterHeaderMenu(ev.target.value)}
                                                    label={getResourceValue(props.resources, 'FOOTER_HEADER')}
                                                    name={getResourceValue(props.resources, 'FOOTER_HEADER')}
                                                >
                                                    {footerHeaderResources && footerHeaderResources.length > 0 && footerHeaderResources.map((menu, index) => (
                                                        <MenuItem value={menu.resource_key_id} key={index}>{menu.resource_value}</MenuItem>
                                                    ))}

                                                </Select>
                                            </FormControl>
                                            <div className="error-wrapper">
                                                {footerHeaderMenuErrorMessage}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }

                            {isSliderSelected && <>
                                <h5 className="font-16 pb-1">{getResourceValue(props.resources, 'UPLOAD_IMAGE')}</h5>
                                <div className="">
                                    <div className='row col-12'>
                                        <div className="upload-btn">
                                            <div className="upload-btn-txt mr-3 btn">
                                                {imageFileName ? <>+ {getResourceValue(props.resources, 'CHANGE_FILE')}</> : <>{getResourceValue(props.resources, 'ADD_FILE')}</>}
                                            </div>
                                            <input type="file" accept=".png,.jpg,.jpeg" onClick={(event) => { event.target.value = null }} style={{ width: 200 }} className="upload-input cursor" onChange={(ev) => changeFile(ev)} title={imageFileName ? imageFileName : getResourceValue(props.resources, 'NO_FILE')} />
                                        </div>
                                        {imageFileName && <div className='row col-4 cursor' style={{ alignItems: "center" }} onClick={() => setImgView(true)}>
                                            <i className="fa fa-file-image-o" aria-hidden="true" style={{ paddingRight: 10, fontSize: "30px" }}></i>
                                        </div>}
                                    </div>
                                    <div className="error-wrapper pt-2">
                                        {imageFileErrorMessage}
                                    </div>
                                </div>
                            </>}

                            {
                                isHeaderSelected &&
                                <>
                                    <div className="form-group row pb-2 flex-1 px-2">
                                        <div className="col-md-12 col-12 px-2">
                                            <h2 className="font-16 font-600">{getResourceValue(props.resources, 'PARENT_MENU')}</h2>
                                            <FormControl variant="outlined">
                                                <InputLabel id="country-label">{getResourceValue(props.resources, 'PARENT_MENU')}</InputLabel>
                                                <Select
                                                    labelId="country-label"
                                                    id="demo-simple-select-outlined"
                                                    value={parentMenu}
                                                    onChange={(ev) => setParentMenu(ev.target.value)}
                                                    label={getResourceValue(props.resources, 'PARENT_MENU')}
                                                    name={getResourceValue(props.resources, 'PARENT_MENU')}
                                                >
                                                    {parentMenus && parentMenus.length > 0 && parentMenus.map((menu, index) => (
                                                        <MenuItem value={menu.id} key={index}>{menu.value}</MenuItem>
                                                    ))}

                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                </>
                            }
                            <div className="form-group row pb-2 flex-1 px-2">
                                <div className="col-md-12 col-12 px-2">
                                    <h2 className="font-16 font-600">{getResourceValue(props.resources, 'SEQUENCE_NO')}</h2>
                                    <h6 className="font-14 pb-2"> {getResourceValue(props.resources, 'SEQUENCE_NO_HELP_TEXT')}</h6>
                                    <TextField
                                        label={getResourceValue(props.resources, 'SEQUENCE_NO')}
                                        placeholder={getResourceValue(props.resources, 'SEQUENCE_NO')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        type="number"
                                        name="name"
                                        onChange={(ev) => setSequenceNo(ev.target.value)}
                                        value={sequenceNo}
                                    />
                                    <div className="error-wrapper">
                                        {sequenceNoErrorMessage}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group row pb-2 flex-1 px-2">
                                <div className="col-md-12 col-12 px-2">
                                    <h2 className="font-16 pb-2 font-600">{getResourceValue(props.resources, 'MENU')}</h2>
                                    <FormControl variant="outlined">
                                        <InputLabel id="country-label">{getResourceValue(props.resources, 'MENU')}</InputLabel>
                                        <Select
                                            labelId="country-label"
                                            id="demo-simple-select-outlined"
                                            value={menuResourcekeyId}
                                            onChange={(ev) => setMenuResourcekeyId(ev.target.value)}
                                            label={getResourceValue(props.resources, 'MENU')}
                                            name={getResourceValue(props.resources, 'MENU')}
                                        >
                                            {menuResources && menuResources.length > 0 && menuResources.map((menu, index) => (
                                                <MenuItem value={menu.resource_key_id} key={index}>{menu.place_holder_value}</MenuItem>
                                            ))}

                                        </Select>
                                    </FormControl>
                                    <div className="error-wrapper">
                                        {resourceKeyErrorMessage}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal >
            {imgView && <ImgViewerModal download={false} open={imgView} url={imgSrc} onCloseModal={() => setImgView(false)} />}
        </>
    )
})

const mapStateToProps = (state) => ({
    languageList: state.common.languageList,
    languageId: state.common.languageId,
    textEditorImages: state.common.textEditorImages
});

export default connect(mapStateToProps)(withRouter(AddEditWebsiteMenuModal));