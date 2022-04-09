import { TextField } from '@material-ui/core';
import { Editor } from '@tinymce/tinymce-react';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, GLOBAL_API, CONSTANTS,ImageFileTypes, TEXT_EDITOR_CONSTANTS, TINYMCE_API_KEY ,STATUS_CODES} from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';
import ImgViewerModal from '../Modals/imgViewerModal';

const AddEditArticleModal = React.memo((props) => {
    const [blogId, setBlogId] = useState(0);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [imageFileErrorMessage, setImageFileErrorMessage] = useState('');
    const [imgView, setImgView] = useState(false);
    const [placeHolderValue, setPlaceHolderValue] = useState("");
    const [placeHolderValueErrorMessage, setPlaceHolderValueErrorMessage] = useState('');
    const [infoValue, setInfoValue] = useState("");
    const [infoValueErrorMessage, setInfoValueErrorMessage] = useState('');
    const [resourceValue, setResourceValue] = useState("");
    const [resourceValueErrorMessage, setResourceValueErrorMessage] = useState('');
    const [author, setAuthor] = useState("");
    const [authorErrorMessage, setAuthorErrorMessage] = useState('');

    useEffect(() => {

        if (props.currentData && props.editMode) {
            setBlogId(props.currentData.blog_id)
            setPlaceHolderValue(props.currentData.place_holder_value);
            setInfoValue(props.currentData.info_value);
            setResourceValue(props.currentData.resource_value);
            setAuthor(props.currentData.author_name && props.currentData.author_name != "null" ? props.currentData.author_name : "");
            if (props.currentData.image_name) {
                setImageFileName(props.currentData.image_name);
                setImgSrc(`${GLOBAL_API}/${props.currentData.image_name}`);
            }
        }
    }, []);

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
                methodName: "addEditArticle/changeFile",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const closeModal = async () => {
        props.onCloseModal();
    }


    const saveData = async (ev) => {
        ev.preventDefault();
        try {
            let validate = await formValidate();
            if (validate) {
                globalLoader(true);
                const formData = new FormData();
                if (props.editMode) {
                    formData.append('blog_id', blogId);
                }
                formData.append('author', author);
                formData.append('place_holder_value', placeHolderValue);
                formData.append('info_value', infoValue);
                formData.append('resource_value', resourceValue);
                formData.append('image_name', imageFileName);
                if (imageFile) {
                    formData.append('image_file', imageFile);
                }
                let obj={
                    method:API_METHODS.POST,
                    history:props.history,
                    api:'/save-article',
                    body:formData
                }
                let result = await CallApiAsync(obj);
                if (result.data.status === STATUS_CODES.OK) {
                    props.onCloseModal('success')
                    globalAlert('success', getResourceValue(props.resources, props.editMode ? "MENU_UPDATED" : "MENU_ADDED"))
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(props.resources, result.data.status.toString()));

                    if (result.data?.data?.errors) {
                        setPlaceHolderValueErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.place_holder_value));
                        setAuthorErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.author));
                        setInfoValueErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.info_value));
                        setResourceValueErrorMessage(getResourceValue(props.resources, result.data?.data?.errors?.resource_value));
                    }
                }
                

                globalLoader(false)
            }

        } catch (error) {
            let errorObject = {
                methodName: "addEditArticle/saveData",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }

    }

    const formValidate = async () => {
        let formValid = true;
        if (placeHolderValue) {
            setPlaceHolderValueErrorMessage('');
        } else {
            formValid = false;
            setPlaceHolderValueErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        }
        if (infoValue) {
            setInfoValueErrorMessage('');
        } else {
            formValid = false;
            setInfoValueErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        }
        if (resourceValue) {
            setResourceValueErrorMessage('');
        } else {
            formValid = false;
            setResourceValueErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        }
        // if (author) {
        //     setAuthorErrorMessage('');
        // } else {
        //     formValid = false;
        //     setAuthorErrorMessage(getResourceValue(props.resources, "FIELD_REQUIRED"));
        // }
        return formValid;
    }

    return (
        <>
            <Modal classNames={{ modal: "content-modal-lg modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={false} showCloseIcon={false} >
                <form className="form-own" noValidate autoComplete="off" onSubmit={(ev) => ev.preventDefault()}>
                    <div className="">
                        <div className="row d-flex justify-content-between pb-2 m-0 contentHeadSec" >
                            <div className="d-flex align-self-center" >
                                <p className="login-txt mb-0 primary-color"> {props.editMode ? getResourceValue(props.resources, 'EDIT') : getResourceValue(props.resources, 'ADD_NEW')} {getResourceValue(props.resources, 'ARTCILE')}</p>
                            </div> 
                        </div>

                        <div className="content-container form-own add-list-form flex-wrap cpl-10 cpr-10 cpt-10 cpb-10" >
                            {/* FOOTER_HEADER Key_Id*/}
                            <div>
                                <div className="form-group col-md-12 col-12 p-0">
                                    <h5 className="font-14">{getResourceValue(props.resources, 'UPLOAD_IMAGE')}</h5>
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
                                </div>
                                <div className="form-group col-md-6 col-12 p-0">
                                    <h2 className="font-14 font-600 cpt-10">{getResourceValue(props.resources, 'HEADING')}</h2>
                                    <TextField
                                        history={props.history}
                                        onChange={(ev) => setPlaceHolderValue(ev.target.value)}
                                        label={getResourceValue(props.resources, 'HEADING')}
                                        placeholder={getResourceValue(props.resources, 'HEADING')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        type="text"
                                        name="name"
                                        value={placeHolderValue}
                                    />
                                    <div className="error-wrapper">{placeHolderValueErrorMessage}</div>
                                </div>

                                <div className="form-group col-md-12 col-12 p-0">
                                    <h2 className="font-14 font-600 cpt-10">{getResourceValue(props.resources, 'SUBHEADING')}</h2>
                                    <TextField
                                        history={props.history}
                                        onChange={(ev) => setInfoValue(ev.target.value)}
                                        label={getResourceValue(props.resources, 'SUBHEADING')}
                                        placeholder={getResourceValue(props.resources, 'SUBHEADING')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        value={infoValue}
                                        type="text"
                                        name="name"
                                        multiline
                                    />
                                    <div className="error-wrapper">{infoValueErrorMessage}</div>
                                </div>
                                <div className="form-group col-md-12 col-12 p-0">
                                    <h2 className="font-14 font-600 cpt-10">{getResourceValue(props.resources, 'CONTENT')}</h2>
                                    <Editor
                                        apiKey={TINYMCE_API_KEY}
                                        onEditorChange={(value) => setResourceValue(value)}
                                        value={resourceValue}
                                        init={{
                                            icons: "jam",
                                            skin: "fabric",
                                            content_css: "document",
                                            height: "350",
                                            resize: true,
                                            plugins: TEXT_EDITOR_CONSTANTS.PLUGINS,
                                            toolbar: TEXT_EDITOR_CONSTANTS.TOOLBAR,
                                            images_upload_handler: async function (blobInfo, success, failure) {
                                                const formData = new FormData();
                                                formData.append('file', blobInfo.blob(), blobInfo.filename());
                                                let obj = {
                                                    method: API_METHODS.POST,
                                                    history: props.history,
                                                    api: '/upload-static-page-image',
                                                    body: formData
                                                }
                                                let res = await CallApiAsync(obj);
                                                if (res.data.status == STATUS_CODES.OK) {
                                                    if (res.data.data.data) {
                                                        let images = props.textEditorImages;
                                                        images.push({ Key: res.data.data.data });
                                                        success(`${GLOBAL_API}/${res.data.data.data}`)
                                                    } else {
                                                        failure(res.data.status.toString());
                                                    }
                                                } else {
                                                    failure(res.data.status.toString());
                                                }
                                            }
                                        }}
                                    />
                                    <div className="error-wrapper">{resourceValueErrorMessage}</div>
                                </div>
                                <div className="form-group col-md-6 col-12  p-0">
                                    <h2 className="font-14 font-600 cpt-10">{getResourceValue(props.resources, 'AUTHOR')}</h2>

                                    <TextField
                                        history={props.history}
                                        onChange={(ev) => setAuthor(ev.target.value)}
                                        label={getResourceValue(props.resources, 'AUTHOR')}
                                        placeholder={getResourceValue(props.resources, 'AUTHOR')}
                                        className='mt-0 mb-0 d-flex'
                                        margin="normal"
                                        variant="outlined"
                                        type="text"
                                        name="name"
                                        value={author ? author : ''}
                                    />
                                    <div className="error-wrapper">{authorErrorMessage}</div>
                                </div>
                            </div>
                        </div>
                        <div className="btn-wrapper d-flex justify-content-end cpt-10">
                                <button type="button" className="btn btn-own full-width-xs-mb btn-own-grey min-height-btn min-width-btn-md mr-3 mw-100" onClick={() => closeModal()}>{getResourceValue(props.resources, 'CANCEL')}</button>
                                <button type="button" onClick={saveData} className="btn full-width-xs btn-own btn-own-primary min-width-btn-md min-height-btn mw-100">{getResourceValue(props.resources, 'SAVE')}</button>
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

export default connect(mapStateToProps)(withRouter(AddEditArticleModal));