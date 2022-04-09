import { FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField } from '@material-ui/core';
import $ from 'jquery';
import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { connect } from 'react-redux';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader, verifyRoute } from '../actions/commonActions';
import { API_METHODS, AttachmentFileTypes, CONTENT_FILE_TYPE, CONTENT_TYPE, GLOBAL_API, ImageFileTypes, resourceFields, resourceGroups, RESOURCE_KEYS,CONSTANTS, VideoFileTypes ,STATUS_CODES} from '../Constants/types';
import { DragIcon, ImageIcon,  PreviewIcon, LockIcon, PDFIcon, PlusIcon, TrashIcon, UnlockIcon, VideoIcon } from '../Constants/svgIcons';
import { CallApiAsync, getDropdownValues, getResourceValue } from '../Functions/CommonFunctions';
import ImgViewerModal from '../Modals/imgViewerModal';
import PdfModal from '../Modals/pdfModal';
import ContentCategoryComponent from './ContentCategoryComponent';
import TagComponent from './TagComponent';
import { Modal } from 'react-responsive-modal';
import {
    ControlBar, CurrentTimeDisplay, ForwardControl, PlaybackRateMenuButton, Player, ReplayControl, TimeDivider
} from "video-react";
import "video-react/dist/video-react.css";

class AddEditContentComponent extends React.PureComponent {

    constructor(props) {
        super(props);
        this.fileRef = React.createRef();
        this.attachmentRef = React.createRef();
        this.formRef = React.createRef();

        this.state = {
            contentTitle: [],
            masterContentTitle: [],
            contentCreator: '',
            startDate: new Date(),
            valueInDate: true,
            files: [],
            masterFiles: [],
            organisation: '',
            adminNote: '',
            reRender: true,
            description: '',
            existingTab: [],
            parentCategory: [],
            secondStepval: {},
            tagData: {},
            renderData: true,
            fileError: [],
            contentTitleErrorMessage: [],
            linksError: [],
            contentCreaterErrorMessage: '',
            organizationErrorMessage: '',
            descriptionErrorMessage: '',
            adminNoteErrorMessage: '',
            dateError: '',
            errorTagMessage: '',
            adminResources: [],
            uploaded_languages: [],
            languageId: props.languageId,
            tabLanguageId: props.languageId,

            links: [],
            masterLinks: [],
            displayTextError: [],
            urlError: [],
            linkFileError: [],
            isFileDropdownDisabled: false,

            contentType: CONTENT_TYPE.DECK,
            contentTypeList: [],
            contentTypeErrorMessage: '',
            imgView: false,
            imgurl: [],
            imgPreview: false,
            videoPreview: false,
            filePreview: false,
            selectedImage: '',
            selectedVideo:'',
            selectedFile:''
        }
    }

    componentDidMount = () => {
        this.basicApiCall();
        this.getAdminResources();
    }

    componentDidUpdate = () => {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources() });
        }
    }


    getAdminResources = async () => {
        try {
            globalLoader(true);
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.COMMON, resourceGroups.UPLOAD_MEDIA, resourceGroups.MANAGE_MEDIA, resourceGroups.FEATURE_MENU, resourceGroups.CONTENT_TYPE],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);
            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                let contentTypeList = getDropdownValues(resourceGroups.CONTENT_TYPE, resources);
                this.setState({ adminResources: resources, contentTypeList: contentTypeList });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }
            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "uploadDeck/getAdminResources",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }


    basicApiCall = async () => {
        try {
            globalLoader(true);
            let obj = {
                method: API_METHODS.GET,
                history: this.props.history,
                api: '/get-parent-categories',
                body: {}
            }
            let searcgTagObj = {
                method: API_METHODS.GET,
                history: this.props.history,
                api: '/view-search-tags',
            }
            let tagsRes = await Promise.all([CallApiAsync(searcgTagObj), CallApiAsync(obj)]);
            if (tagsRes[0].data.status === 200 && tagsRes[1].data.status === 200) {
                let localTag = [];
                tagsRes[0].data.data.searchTags.forEach(element => {
                    localTag.push({ id: `${element.id}`, text: element.tag });
                });
                globalLoader(false);
                this.setState({
                    existingTab: localTag,
                    parentCategory: tagsRes[1].data.data.parentCategories,
                }, () => {
                    if (this.props.editMode) this.setStateFromApi();
                })
            }
            else {
                globalLoader(false)
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, tagsRes[1].data.status.toString()))
            }
        } catch (error) {
            let errorObject = {
                methodName: "uploadDeck/basicApiCall",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    setStateFromApi = () => {
        try {
            const { dataVal } = this.props;
            let contentTitles = [];
            let contentType = dataVal.content_type_key;
            let files = [];
            let langId = "";
            let langauges = [];

            if (dataVal.content_details && dataVal.content_details.length > 0) {
                for (let content of dataVal.content_details) {
                    contentTitles[content.language_id] = content.content_title;
                }
            }


            if (dataVal.content_files && dataVal.content_files.length > 0) {
                for (let file of dataVal.content_files) {
                    // take first language
                    let languageId = file.language_id;
                    if (!langId) {
                        langId = languageId;
                    }

                    if (!langauges.includes(languageId)) {
                        langauges.push(languageId);
                    }

                    if (contentType == CONTENT_TYPE.DECK) {
                        if (!files[languageId]) {
                            files[languageId] = [];
                        }

                        files[languageId].push({ ...file, file_path: `${GLOBAL_API}/${file.file_path}`, ViewMode: true });
                    } else {
                        files[languageId] = { ...file, file_path: `${GLOBAL_API}/${file.file_path}`, ViewMode: true };
                    }
                }
            }

            let links = [];
            if (dataVal.content_links && dataVal.content_links.length > 0) {
                for (let link of dataVal.content_links) {
                    let file = {};
                    if (contentType == CONTENT_TYPE.DECK) {
                        file = files[link.language_id]?.find(e => e.content_file_id == link.content_file_id);
                    } else {
                        file = files[link.language_id];
                    }
                    if (file) {
                        link.file_name = file.file_name;
                    } else {
                        link.file_name = '';
                    }
                    if (!links[link.language_id]) {
                        links[link.language_id] = [];
                    }
                    links[link.language_id].push(link);
                }
            }

            let masterFiles = [...files];
            let masterLinks = [...links];
            this.setState({
                contentTitle: contentTitles,
                masterContentTitle: contentTitles,
                contentCreator: dataVal.content_created_by ? dataVal.content_created_by : '',
                contentType: contentType,
                links: links ? links : [],
                masterLinks: masterLinks ? masterLinks : [],
                organisation: dataVal.organization ? dataVal.organization : '',
                startDate: dataVal.deck_created ? new Date(dataVal.deck_created) : new Date(),
                description: dataVal.description ? dataVal.description : '',
                files: files ? files : [],
                masterFiles: masterFiles ? masterFiles : [],
                tabLanguageId: langId,
                uploaded_languages: langauges,
                adminNote: dataVal?.admin_notes ? dataVal?.admin_notes : '',

            }, () => this.setState({ reRender: !this.state.reRender }));
        } catch (error) {
            let errorObject = {
                methodName: "uploadDeck/setStateFromApi",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }

    }

    tagChange = () => {
        try {
            setTimeout(() => {
                let searchTagwrapper = $('body .own-tag-wrapper .ReactTags__suggestions');
                if (searchTagwrapper && searchTagwrapper.length > 0) {
                    let suggestionsHeight = (searchTagwrapper)[0].clientHeight;
                    let suggestionsOffsetHeight = (searchTagwrapper)[0].getBoundingClientRect().top + window.scrollY;
                    let documentHeight = $(document).height();
                    if (documentHeight < (suggestionsHeight + suggestionsOffsetHeight + 20)) {
                        $('body .own-tag-wrapper').addClass('move-top')
                    }
                }


            }, 100);
        } catch (error) {
            let errorObject = {
                methodName: "uploadDeck/tagChange",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    handleDelete = (i) => {
        const { tags } = this.state;
        this.setState({
            tags: tags.filter((tag, index) => index !== i),
        });
    }

    handleAddition = (tag) => {
        this.setState(state => ({ tags: [...state.tags, tag] }));
    }

    dateChange = date => {
        this.setState({
            startDate: date,
            valueInDate: true
        });
    };

    changeValue = (ev) => {
        let name = ev.target.name;
        let value = ev.target.value;
        if (!value) {
            this.setState({
                [name]: value,
            })
        } else {
            this.setState({
                [name]: value,
            })
        }

    }

    changeFile = (ev, language_id) => {
        try {
            let contentType = this.state.contentType;
            if (ev.target.files && ev.target.files.length > 0) {
                if (contentType == CONTENT_TYPE.DECK) {
                    let allValidFile = true;
                    for (let i = 0; i < ev.target.files.length; i++) {
                        let fileType = ev.target.files[i].type.split("/");
                        if (ImageFileTypes.includes(fileType[1].toLowerCase())) {
                            if (ev.target.files[i].size / 1024 == 0) {
                                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, "FILE_SIZE_LIMIT"));
                                allValidFile = false;
                                break
                            }
                        }
                        else {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, "IMAGE_FILES_VALIDATION"));
                            allValidFile = false;
                            break
                        }
                    }
                    if (allValidFile) {
                        let files = this.state.files;
                        let oldFiles = [];
                        if (typeof files[language_id] !== "undefined") {
                            oldFiles = files[language_id];
                        }
                        files[language_id] = [...oldFiles, ...ev.target.files];
                        this.setState({ files: files, reRender: !this.state.reRender, });

                        let tempImgUrl = [];
                        files[language_id].forEach((val) => {
                            var reader = new FileReader();
                            reader.readAsDataURL(val);
                            reader.onloadend = () => {
                                tempImgUrl.push(reader.result)
                            }
                        })

                        this.setState({ imgurl: tempImgUrl });

                    }
                } else if (contentType == CONTENT_TYPE.VIDEO) {
                    let fileType = ev.target.files[0].name.split(".").pop();
                    if (VideoFileTypes.includes(fileType.toLowerCase())) {
                        if (ev.target.files[0].size / 1024 == 0) {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, "FILE_SIZE_LIMIT"));
                        } else {
                            let files = this.state.files;
                            files[language_id] = ev.target.files[0];
                            this.updateLinkFileName(files[language_id].name);
                            this.setState({ files: files, reRender: !this.state.reRender });
                        }
                    } else {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, "VIDEO_FILE_LIMIT"));
                    }
                } else if (contentType == CONTENT_TYPE.FILE) {
                    let fileType = ev.target.files[0].type.split("/");
                    if (AttachmentFileTypes.includes(fileType[1].toLowerCase())) {
                        if (ev.target.files[0].size / 1024 == 0) {
                            globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, "FILE_SIZE_LIMIT"));
                        } else {
                            let files = this.state.files;
                            files[language_id] = ev.target.files[0];
                            this.updateLinkFileName(files[language_id].name);
                            this.setState({ files: files, reRender: !this.state.reRender });
                        }
                    }
                    else {
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, "INVALID_FILE"));
                    }
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "uploadDeck/changeFile",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }

    }

    userPostData = (ev) => {
        ev.preventDefault();

        try {
            this.formValidation().then((value) => {

                if (value) {
                    globalLoader(true)

                    const formData = new FormData();
                    formData.append('titles', this.state.contentTitle.toString());
                    formData.append('content_type_key', this.state.contentType);
                    formData.append('category_id', this.state.secondStepval.subCategory.toString());
                    formData.append('featured', this.state.secondStepval.featured ? "1" : "0");
                    formData.append('is_guidance_info', this.state.secondStepval.isGuidanceInfo ? "1" : "0");
                    formData.append('links', JSON.stringify(this.state.links));
                    formData.append('creator', this.state.contentCreator);
                    formData.append('description', this.state.description);
                    formData.append('organization', this.state.organisation);

                    formData.append('created_on', this.state.startDate);
                    formData.append('admin_notes', this.state.adminNote);

                    let lock = this.state.secondStepval.lockContent ? "1" : "0";

                    if (this.props.editMode) {
                        if (lock == this.props.dataVal.is_locked) {
                            formData.append('locked', "0");
                        } else {
                            formData.append('locked', lock);
                        }

                        if (this.props.dataVal.is_locked == "1" && lock == "0") {
                            formData.append('lock_code', this.props.dataVal.locked_code);
                        } else {
                            if (this.state.secondStepval.securityCode != this.props.dataVal.locked_code) {
                                formData.append('lock_code', this.state.secondStepval.securityCode);
                            }
                        }

                    } else {
                        formData.append('locked', lock);
                        if (this.state.secondStepval.lockContent) {
                            formData.append('lock_code', this.state.secondStepval.securityCode);
                        }
                    }

                    let files = [...this.state.files];
                    let filesInfo = [];
                    let contentType = this.state.contentType;
                    for (let language of this.props.languageList) {
                        let languageId = language.language_id;
                        if (contentType == CONTENT_TYPE.DECK) {
                            if (files[languageId] && files[languageId].length > 0) {
                                if (!filesInfo[languageId]) {
                                    filesInfo[languageId] = [];
                                }
                                let langSlide = files[languageId];
                                for (let i = 0; i < langSlide.length; i++) {
                                    if (langSlide[i].ViewMode) {
                                        filesInfo[languageId].push({ view_order: i + 1, is_locked: langSlide[i].is_locked ? 1 : 0, file_name: langSlide[i].file_name, file_type: CONTENT_FILE_TYPE.IMAGE })
                                    }
                                    else {
                                        filesInfo[languageId].push({ view_order: i + 1, is_locked: langSlide[i].is_locked ? 1 : 0, file_name: langSlide[i].name, file_type: CONTENT_FILE_TYPE.IMAGE })
                                        formData.append(`content_files_${languageId}`, langSlide[i])
                                    }
                                }
                            }
                        } else {
                            let fileContentType = '';
                            if (contentType == CONTENT_TYPE.VIDEO) {
                                fileContentType = CONTENT_FILE_TYPE.VIDEO;
                            } else {
                                fileContentType = CONTENT_FILE_TYPE.PDF;
                            }
                            if (files[languageId]) {
                                if (!filesInfo[languageId]) {
                                    filesInfo[languageId] = [];
                                }
                                if (!files[languageId]?.ViewMode) {
                                    filesInfo[languageId].push({ view_order: 0, is_locked: 0, file_name: files[languageId].name, file_type: fileContentType })
                                    formData.append(`content_files_${languageId}`, files[languageId])
                                } else {
                                    filesInfo[languageId].push({ view_order: 0, is_locked: 0, file_name: files[languageId].file_name, file_type: fileContentType })
                                }
                            }
                        }
                    }

                    formData.append('files_info', JSON.stringify(filesInfo));

                    if (this.state.tagData.oldTag.length > 0) {
                        formData.append('tags', this.state.tagData.oldTag.toString());

                    }
                    if (this.state.tagData.newTag.length > 0) {
                        formData.append('new_tags', this.state.tagData.newTag.toString());
                    }


                    if (this.props.editMode) {
                        formData.append('content_id', this.props.dataVal.content_id);
                    }
                    let obj={
                        method:API_METHODS.POST,
                        history:this.props.history,
                        api:'/save-media-content',
                        body:formData
                    }
                    CallApiAsync(obj).then(data => {
                        if (data.data.status === 200) {
                            if (this.props.editMode) {
                                globalLoader(false);
                                this.props.onCloseModal(true)
                            } else {
                                $("html, body").animate({ scrollTop: 0 });
                                this.setState({
                                    contentTitle: [],
                                    contentCreator: '',
                                    organisation: '',
                                    contentCreator: '',
                                    files: [],
                                    links: [],
                                    renderData: false,
                                    adminNote: '',
                                    description: '',

                                }, () => {
                                    this.setState({
                                        renderData: true,
                                        reRender: !this.state.reRender
                                    })
                                    globalLoader(false);

                                });

                                verifyRoute(this.props.history, '/contents');
                            }

                            globalAlert('success', getResourceValue(this.state.adminResources, this.props.editMode ? "RECORD_UPDATED" : "SUCCESS_DECK"));
                        } else {

                            if (data?.data?.data?.errors) {

                                let contentTitleminLength = getResourceValue(this.state.adminResources, "CONTENT_TITLE", resourceFields.Min_Length);
                                let contentTitlemaxLength = getResourceValue(this.state.adminResources, "CONTENT_TITLE", resourceFields.Max_Length);
                                let creatorMinLength = getResourceValue(this.state.adminResources, "CONTENT_CREATOR", resourceFields.Min_Length);
                                let creatorMaxLength = getResourceValue(this.state.adminResources, "CONTENT_CREATOR", resourceFields.Max_Length);
                                let organizationMaxLength = getResourceValue(this.state.adminResources, "ORGAINZATION", resourceFields.Max_Length);
                                let descriptionMaxLength = getResourceValue(this.state.adminResources, "CONTENT_DESCRIPTION", resourceFields.Max_Length);
                                let adminNoteMaxLength = getResourceValue(this.state.adminResources, "ADMIN_NOTE", resourceFields.Max_Length);
                                let tagMaxLength = getResourceValue(this.state.adminResources, "NEW_SERCH_TAG", resourceFields.Max_Length);

                                if (data?.data?.data?.errors?.titles) {
                                    let contentTitleErrorMessage = [];
                                    let nameLangId = data?.data?.data?.errors?.titles_language;
                                    if (nameLangId) {
                                        this.setState({ tabLanguageId: nameLangId });
                                        contentTitleErrorMessage[nameLangId] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.titles).replace('{min_length}', contentTitleminLength).replace('{max_length}', contentTitlemaxLength)
                                    } else {
                                        contentTitleErrorMessage[this.state.tabLanguageId] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.titles).replace('{min_length}', contentTitleminLength).replace('{max_length}', contentTitlemaxLength)
                                    }

                                    this.setState({ contentTitleErrorMessage: contentTitleErrorMessage, reRender: !this.state.reRender });
                                }

                                if (data?.data?.data?.errors?.links) {
                                    let displayTextError = [];
                                    let urlTextError = [];
                                    let linkFileError = [];

                                    let linksLanguage = data?.data?.data?.errors?.links_language;
                                    if (data?.data?.data?.errors?.links?.display_text) {
                                        if (linksLanguage) {
                                            this.setState({ tabLanguageId: linksLanguage });
                                            displayTextError[linksLanguage] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.links?.display_text);
                                        } else {
                                            displayTextError[this.state.tabLanguageId] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.links?.display_text)
                                        }
                                    }

                                    if (data?.data?.data?.errors?.links?.display_url) {
                                        if (linksLanguage) {
                                            this.setState({ tabLanguageId: linksLanguage });
                                            urlTextError[linksLanguage] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.links?.display_url);
                                        } else {
                                            urlTextError[this.state.tabLanguageId] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.links?.display_url)
                                        }
                                    }

                                    if (data?.data?.data?.errors?.links?.file_name) {
                                        if (linksLanguage) {
                                            this.setState({ tabLanguageId: linksLanguage });
                                            linkFileError[linksLanguage] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.links?.file_name);
                                        } else {
                                            linkFileError[this.state.tabLanguageId] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.links?.file_name)
                                        }
                                    }

                                    this.setState({ displayTextError: displayTextError, urlError: urlTextError, linkFileError: linkFileError, reRender: !this.state.reRender });
                                }

                                if (data?.data?.data?.errors?.content_files) {
                                    let fileError = [];
                                    let fileLangId = data?.data?.data?.errors?.files_language;
                                    if (fileLangId) {
                                        this.setState({ tabLanguageId: fileLangId });
                                        fileError[fileLangId] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.content_files)
                                    } else {
                                        fileError[this.state.tabLanguageId] = getResourceValue(this.state.adminResources, data?.data?.data?.errors?.content_files)
                                    }
                                    this.setState({ fileError: fileError, reRender: !this.state.reRender });
                                }

                                this.setState({
                                    contentTypeErrorMessage: getResourceValue(this.state.adminResources, data?.data?.data?.errors?.content_type_key).replace('{min_length}', creatorMinLength).replace('{max_length}', creatorMaxLength),
                                    contentCreaterErrorMessage: getResourceValue(this.state.adminResources, data?.data?.data?.errors?.creator).replace('{min_length}', creatorMinLength).replace('{max_length}', creatorMaxLength),
                                    organizationErrorMessage: getResourceValue(this.state.adminResources, data?.data?.data?.errors?.organization).replace('{max_length}', organizationMaxLength),
                                    adminNoteErrorMessage: getResourceValue(this.state.adminResources, data?.data?.data?.errors?.admin_notes).replace('{max_length}', adminNoteMaxLength),
                                    descriptionErrorMessage: getResourceValue(this.state.adminResources, data?.data?.data?.errors?.description).replace('{max_length}', descriptionMaxLength),
                                    dateError: getResourceValue(this.state.adminResources, data?.data?.data?.errors?.created_on),
                                    errorTagMessage: getResourceValue(this.state.adminResources, data?.data?.data?.errors?.deckTags).replace('{max_length}', tagMaxLength),
                                });
                            }

                            globalLoader(false)
                            globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, data.data.status.toString()));
                        }
                    })
                        .catch(err => {
                            console.log(err)
                        })
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, RESOURCE_KEYS.ERROR_CODES.VALIDATION_ERROR));
                }
            }).catch(err => {
                console.log(err)
            })
        } catch (error) {
            let errorObject = {
                methodName: "uploadDeck/userPostData",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    formValidation = async () => {
        this.setState({
            fileError: [],
            contentTitleErrorMessage: [],
            contentCreaterErrorMessage: '',
            organizationErrorMessage: '',
            adminNoteErrorMessage: '',
            descriptionErrorMessage: '',
            contentTypeErrorMessage: '',
            dateError: '',
            errorTagMessage: '',
            reRender: !this.state.reRender
        }, () => this.setState({ reRender: !this.state.reRender }));

        let formValidation = true;
        let defaultLanguageId = this.state.tabLanguageId;
        let contentType = this.state.contentType;
        let contentTitleminLength = getResourceValue(this.state.adminResources, "CONTENT_TITLE", resourceFields.Min_Length);
        let contentTitlemaxLength = getResourceValue(this.state.adminResources, "CONTENT_TITLE", resourceFields.Max_Length);
        let creatorMinLength = getResourceValue(this.state.adminResources, "CONTENT_CREATOR", resourceFields.Min_Length);
        let creatorMaxLength = getResourceValue(this.state.adminResources, "CONTENT_CREATOR", resourceFields.Max_Length);
        let organizationMaxLength = getResourceValue(this.state.adminResources, "ORGAINZATION", resourceFields.Max_Length);
        let descriptionMaxLength = getResourceValue(this.state.adminResources, "CONTENT_DESCRIPTION", resourceFields.Max_Length);
        let adminNoteMaxLength = getResourceValue(this.state.adminResources, "ADMIN_NOTE", resourceFields.Max_Length);
        let displayMaxLength = getResourceValue(this.state.adminResources, "DISPLAY_TEXT", resourceFields.Max_Length);
        let urlMaxLength = getResourceValue(this.state.adminResources, "DISPLAY_URL", resourceFields.Max_Length);

        /**
         * store all validate feild langauge id
         */
        let langauges = [];
        let contentTitleFieldRequired = true;
        let filesRequired = true;
        for (let langauge of this.props.languageList) {
            let language_id = langauge.language_id;
            let validateLanguage = false;

            if (this.state.contentTitle.length > 0 && this.state.contentTitle[language_id] && this.state.contentTitle[language_id].length > 0) {
                validateLanguage = true;
            }

            if (contentType == CONTENT_TYPE.DECK) {
                if (this.state.files.length > 0 && this.state.files[language_id] && this.state.files[language_id].length > 0) {
                    validateLanguage = true;
                }
            } else {
                if (this.state.files.length > 0 && this.state.files[language_id]) {
                    validateLanguage = true;
                }
            }

            if (this.state.links.length > 0 && this.state.links[language_id] && this.state.links[language_id].length > 0) {
                validateLanguage = true;
            }

            if (validateLanguage && !langauges.includes(language_id)) {
                langauges.push(language_id);
            }
        }

        if (langauges.length > 0) {
            for (let language_id of langauges) {

                contentTitleFieldRequired = false;
                filesRequired = false;
                // show content title errors
                if (!this.state.contentTitle[language_id]) {
                    formValidation = false;
                    let contentTitleError = this.state.contentTitleErrorMessage;
                    contentTitleError[language_id] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
                    this.setState({
                        contentTitleErrorMessage: contentTitleError, reRender: !this.state.reRender, tabLanguageId: language_id
                    })
                } else if (this.state.contentTitle[language_id].length < contentTitleminLength && this.state.contentTitle[language_id].length > contentTitlemaxLength) {
                    let contentTitleError = this.state.contentTitleErrorMessage;
                    contentTitleError[language_id] = getResourceValue(this.state.adminResources, 'FIELD_LIMIT').replace('{min_length}', contentTitleminLength).replace('{max_length}', contentTitlemaxLength);
                    this.setState({
                        contentTitleErrorMessage: contentTitleError, reRender: !this.state.reRender, tabLanguageId: language_id
                    });
                    formValidation = false;
                }

                // show files error

                if (!this.state.files[language_id]) {
                    filesRequired = false;
                    formValidation = false;
                    let fileError = this.state.fileError;
                    fileError[language_id] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
                    this.setState({
                        fileError: fileError, reRender: !this.state.reRender, tabLanguageId: language_id
                    })
                }


                if (this.state.links[language_id] && this.state.links[language_id].length > 0) {
                    let links = this.state.links[language_id];
                    let displayTextError = [];
                    let urlTextError = [];
                    let linkFileError = [];
                    for (let i = 0; i < links.length; i++) {
                        if (links[i].display_text) {
                            displayTextError[language_id] = '';
                            if (links[i].display_text.length > displayMaxLength) {
                                formValidation = false;
                                displayTextError[language_id] = getResourceValue(this.state.adminResources, 'FIELD_LENGTH').replace('{max_length}', displayMaxLength);
                            }
                        } else {
                            formValidation = false;
                            displayTextError[language_id] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
                        }
                        if (links[i].display_url) {
                            urlTextError[language_id] = '';
                            if (links[i].display_url.length > urlMaxLength) {
                                formValidation = false;
                                urlTextError[language_id] = getResourceValue(this.state.adminResources, 'FIELD_LENGTH').replace('{max_length}', urlMaxLength);
                            }
                        } else {
                            formValidation = false;
                            urlTextError[language_id] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
                        }

                        if (links[i].file_name) {
                            linkFileError[language_id] = '';
                        } else {
                            formValidation = false;
                            linkFileError[language_id] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
                        }


                    }
                    this.setState({ displayTextError: displayTextError, urlError: urlTextError, linkFileError: linkFileError, reRender: !this.state.reRender });
                }
            }
        } else {
            formValidation = false;
            contentTitleFieldRequired = true;
            filesRequired = true;
        }

        if (contentTitleFieldRequired) {
            formValidation = false;
            let contentTitleError = this.state.contentTitleErrorMessage;
            contentTitleError[defaultLanguageId] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
            this.setState({
                contentTitleErrorMessage: contentTitleError, reRender: !this.state.reRender, tabLanguageId: defaultLanguageId
            })
        }

        if (filesRequired) {
            formValidation = false;
            let fileError = this.state.fileError;
            fileError[defaultLanguageId] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
            this.setState({
                fileError: fileError, reRender: !this.state.reRender, tabLanguageId: defaultLanguageId
            })
        }

        if (!this.state.contentCreator) {
            formValidation = false;
            this.setState({
                contentCreaterErrorMessage: getResourceValue(this.state.adminResources, 'FIELD_REQUIRED'),
            })
        } else if (this.state.contentCreator.length > 0 && this.state.contentCreator.length < creatorMinLength) {
            formValidation = false;
            this.setState({
                contentCreaterErrorMessage: getResourceValue(this.state.adminResources, 'FIELD_LIMIT').replace('{min_length}', creatorMinLength).replace('{max_length}', creatorMaxLength),
            })
        } else if (this.state.contentCreator.length > creatorMaxLength) {
            formValidation = false;
            this.setState({
                contentCreaterErrorMessage: getResourceValue(this.state.adminResources, 'FIELD_LIMIT').replace('{min_length}', creatorMinLength).replace('{max_length}', creatorMaxLength),
            })
        } else {
            this.setState({
                contentCreaterErrorMessage: '',
            })
        }

        if (!this.state.contentType) {
            formValidation = false;
            this.setState({
                contentTypeErrorMessage: getResourceValue(this.state.adminResources, 'FIELD_REQUIRED'),
            })
        } else {
            this.setState({
                contentTypeErrorMessage: '',
            })
        }

        if (this.state.organisation.length > organizationMaxLength) {
            formValidation = false;
            this.setState({
                organizationErrorMessage: getResourceValue(this.state.adminResources, 'FIELD_LENGTH').replace('{max_length}', organizationMaxLength),
            })
        } else {
            this.setState({
                organizationErrorMessage: '',
            })
        }

        if (this.state.description.length > descriptionMaxLength) {
            formValidation = false;
            this.setState({
                descriptionErrorMessage: getResourceValue(this.state.adminResources, 'FIELD_LENGTH').replace('{max_length}', descriptionMaxLength),
            })
        } else {
            this.setState({
                descriptionErrorMessage: '',
            })
        }

        if (this.state.adminNote.length > adminNoteMaxLength) {
            formValidation = false;
            this.setState({
                adminNoteErrorMessage: getResourceValue(this.state.adminResources, 'FIELD_LENGTH').replace('{max_length}', adminNoteMaxLength),
            });
        } else {
            this.setState({
                adminNoteErrorMessage: '',
            });
        }

        let date1 = new Date()
        let date2 = new Date(this.state.startDate)
        let dateValid = date1 > date2
        if (!dateValid) {
            this.setState({ dateError: getResourceValue(this.state.adminResources, 'FUTURE_DATE') })
        } else {
            this.setState({ dateError: '' })
        }

        let secondFormStepRes = await this.secondFormStep.formValidation();
        if (!secondFormStepRes.formValidation) {
            formValidation = false
        }
        else {
            this.setState({
                secondStepval: { ...secondFormStepRes.data }
            })
        }
        let tagResult = await this.refs.tagComp.formValidation();
        if (tagResult.formValidation) {
            this.setState({
                tagData: tagResult.data,
            })
        }
        else {
            formValidation = false
        }

        return formValidation
    }

    deleteFile = (fileIndex = null) => {
        let files = this.state.files;
        let languageId = this.state.tabLanguageId;
        if (this.state.contentType == CONTENT_TYPE.DECK) {
            let localArray = [...files[languageId]];

            let fileName = '';
            if (files[languageId][fileIndex].ViewMode) {
                fileName = files[languageId][fileIndex].file_name;
            } else {
                fileName = files[languageId][fileIndex].name;
            }
            this.deleteLinkByFile(fileName);

            localArray.splice(fileIndex, 1);
            files[languageId] = localArray;
        } else {
            let fileName = '';
            if (files[languageId].ViewMode) {
                fileName = files[languageId].file_name;
            } else {
                fileName = files[languageId].name;
            }
            this.deleteLinkByFile(fileName);
            delete files[languageId];
        }
        this.setState({ files: files, reRender: !this.state.reRender });
    }

    deleteLinkByFile = (fileName) => {
        let links = this.state.links;
        let languageId = this.state.tabLanguageId;
        if (links && links[this.state.tabLanguageId] && links[this.state.tabLanguageId].length > 0) {
            let localArray = [...links[this.state.tabLanguageId]];
            localArray = localArray.filter(link => link.file_name != fileName);
            links[languageId] = localArray;
            this.setState({ displayTextError: [], urlError: [], linkFileError: [], links: links, reRender: !this.state.reRender });
        }
    }

    updateLinkFileName = (fileName) => {
        let links = this.state.links;
        let languageId = this.state.tabLanguageId;
        if (links.length > 0 && links[this.state.tabLanguageId] && links[this.state.tabLanguageId].length > 0) {
            let localArray = [...links[this.state.tabLanguageId]];
            for (let link of localArray) {
                link.file_name = fileName;
            }
            links[languageId] = localArray;
            this.setState({ displayTextError: [], urlError: [], linkFileError: [], links: links, reRender: !this.state.reRender });
        }
    }

    lockUnlockFile = (index, val) => {
        let localArray = [...this.state.files];
        for (let langauge of this.props.languageList) {
            let languageId = langauge.language_id;
            if (localArray[languageId] && localArray[languageId].length) {
                localArray[languageId][index].is_locked = val;
            }

        }
        this.setState({
            files: localArray,
            reRender: !this.state.reRender
        })
    }
    previewImage = (index) => {
        let localArray = [...this.state.files];
        this.setState({  imgPreview: true, selectedImage: localArray[this.props.languageId][index].file_path});
        
    }

    previewVideo = (filePath) => {
        this.setState({  videoPreview: true, selectedVideo: filePath  });        
    }

    previewFile = (filePath) => {
        this.setState({  filePreview: true, selectedFile: filePath  });        
    }
    saveContentTitle = (value) => {
        let newcontentTitle = this.state.contentTitle;

        newcontentTitle[this.state.tabLanguageId] = value;

        this.setState({ contentTitle: newcontentTitle, reRender: !this.state.reRender });

    }

    openPdfFiles = (path) => {
        this.setState({
            pdfurl: `${GLOBAL_API}/${path}`,
        }, () => {
            this.setState({
                pdfView: true,
            })
        })
    }

    handleDisplayText = (text, index) => {
        let links = this.state.links;
        links[this.state.tabLanguageId][index].display_text = text;
        this.setState({ links: links, reRender: !this.state.reRender });
    }

    handleUrl = (text, index) => {
        let links = this.state.links;
        links[this.state.tabLanguageId][index].display_url = text;
        this.setState({ links: links, reRender: !this.state.reRender });
    }

    handleFileLink = (file, index) => {
        let links = this.state.links;
        links[this.state.tabLanguageId][index].file_name = file;
        this.setState({ links: links, reRender: !this.state.reRender });
    }

    handleRemoveLink = (index) => {
        let links = this.state.links;
        let languageId = this.state.tabLanguageId;
        let localArray = [...links[languageId]];
        localArray.splice(index, 1);
        links[languageId] = localArray;
        this.setState({ displayTextError: [], urlError: [], linkFileError: [], links: links, reRender: !this.state.reRender });
    }

    handleContentType = (ev) => {
        let contentType = ev.target.value;
        this.setState({ contentType: contentType });
        if (this.props.editMode && this.props.dataVal.content_type_key == contentType) {
            let files = [...this.state.masterFiles];
            this.setState({ files: files, contentTitle: this.state.masterContentTitle });
        } else {
            this.setState({ files: [], contentTitle: [] });
        }

        if (contentType == CONTENT_TYPE.DECK) {
            this.setState({ isFileDropdownDisabled: false });
        } else {
            this.setState({ isFileDropdownDisabled: true });
        }
    }

    handleAddLink = () => {
        let languageId = this.state.tabLanguageId;
        let displayMaxLength = getResourceValue(this.state.adminResources, "DISPLAY_TEXT", resourceFields.Max_Length);
        let urlMaxLength = getResourceValue(this.state.adminResources, "DISPLAY_URL", resourceFields.Max_Length);
        let links = this.state.links;
        if (!this.state.links[languageId]) {
            links[languageId] = [];
        }
        let displayTextError = [];
        let urlTextError = [];
        let linkFileError = [];
        let addNew = true;
        let langLinks = links[languageId];
        if (langLinks.length > 0) {
            for (let i = 0; i < langLinks.length; i++) {
                if (langLinks[i].display_text) {
                    displayTextError[languageId] = '';
                    if (langLinks[i].display_text.length > displayMaxLength) {
                        addNew = false;
                        displayTextError[languageId] = getResourceValue(this.state.adminResources, 'FIELD_LENGTH').replace('{max_length}', displayMaxLength);
                    }
                } else {
                    addNew = false;
                    displayTextError[languageId] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
                }
                if (langLinks[i].display_url) {
                    urlTextError[languageId] = '';
                    if (langLinks[i].display_url.length > urlMaxLength) {
                        addNew = false;
                        urlTextError[languageId] = getResourceValue(this.state.adminResources, 'FIELD_LENGTH').replace('{max_length}', urlMaxLength);
                    }
                } else {
                    addNew = false;
                    urlTextError[languageId] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
                }
                if (langLinks[i].file_name) {
                    linkFileError[languageId] = '';
                } else {
                    addNew = false;
                    linkFileError[languageId] = getResourceValue(this.state.adminResources, 'FIELD_REQUIRED');
                }
            }
        }
        if (addNew) {
            let fileName = '';
            if (this.state.contentType != CONTENT_TYPE.DECK && this.state.files.length > 0 && this.state.files[languageId]) {
                if (this.state.files[languageId].ViewMode) {
                    fileName = this.state.files[languageId].file_name;
                } else {
                    fileName = this.state.files[languageId].name;
                }
            }
            links[languageId].push({ display_text: '', display_url: '', file_name: fileName });
        }

        this.setState({ links: links, displayTextError: displayTextError, urlError: urlTextError, linkFileError: linkFileError, reRender: !this.state.reRender }, () => {

            window.scroll({
                top: document.body.offsetHeight,
                left: 0,
                behavior: 'smooth',
            });
        });

    }


    handleOnDragEnd = (result) => {
        if (!result.destination) return;
        let files = this.state.files;
        const items = Array.from(files[this.state.tabLanguageId]);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        files[this.state.tabLanguageId] = items;
        this.setState({ files: files });
    }

    renderVideoList = () => {
        let languageId = this.state.tabLanguageId;
        let file = this.state.files[languageId];
        return (
            <div className="upload-file-container">
                <div onClick={() => file.ViewMode && {}} className='filename-container'>
                    <div className="pdf-box-container" ><VideoIcon /></div>
                    <div>
                        <div className='image-header'>{file.name}</div>
                    </div>
                </div>
                <div className='file-icon-container'>
                {this.props.editMode && 
                <div className='p-2 cursor' onClick={() => this.previewVideo(file.file_path)}>
                        <PreviewIcon/>
                    </div>}
                    <div className='p-2 cursor' onClick={() => this.deleteFile()}>
                        <TrashIcon />
                    </div>
                </div>
            </div>
        )
    }

    renderAttachment = () => {
        let languageId = this.state.tabLanguageId;
        let file = this.state.files[languageId];
        return (
            <div className="upload-file-container">
                <div className='filename-container'>
                    <div className="pdf-box-container" ><PDFIcon /></div>
                    <div>
                        <div className='image-header'>{file.name}</div>
                    </div>
                </div>
                <div className='file-icon-container'>
                {this.props.editMode && 
                <div className='p-2 cursor' onClick={() => this.previewFile(file.file_path)}>
                        <PreviewIcon/>
                    </div>}
                    <div className='p-2 cursor' onClick={() => this.deleteFile()}>
                        <TrashIcon />
                    </div>
                </div>
            </div>
        )
    }


    render() {
        const { editMode, dataVal } = this.props;
        let fileExtension = '';
        if (this.state.contentType == CONTENT_TYPE.DECK) {
            fileExtension = ".png,.jpeg,.jpg";
        } else if (this.state.contentType == CONTENT_TYPE.VIDEO) {
            fileExtension = ".mp4,.mov";
        } else if (this.state.contentType == CONTENT_TYPE.FILE) {
            fileExtension = "application/pdf";
        }
        return (
            <div>
                <div className="row  d-flex justify-content-between m-0 cpb-10">
                    <div className="d-flex">
                        <p className="login-txt mb-0 d-flex align-self-center font-20 primary-color">{editMode ? this.props.editDeck : getResourceValue(this.state.adminResources, 'UPLOAD_MEDIA')}</p>
                    </div>
                    <div className=" ">
                        <div className="header-button-container">
                            <button type="button" onClick={() => this.props.editMode ? this.props.onCloseModal(null) : verifyRoute(this.props.history, '/contents')} className="btn btn-own btn-own-grey min-height-btn form-header-button ml-20 mw-100">{getResourceValue(this.state.adminResources, 'CANCEL')}</button>
                            <button onClick={() => this.formRef.current.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))} className="btn btn-own btn-own-primary min-height-btn form-header-button ml-20 mw-100">{editMode ? getResourceValue(this.state.adminResources, 'UPDATE_BUTTON') : getResourceValue(this.state.adminResources, 'SAVE')}</button>
                        </div>
                    </div>
                </div>

                <section className="content-container cmb-10">
                    <form className="form-own " ref={this.formRef} noValidate autoComplete="off" onSubmit={(ev) => this.userPostData(ev)}>
                        <input type="file" ref={this.fileRef} onClick={e => (e.target.value = null)} multiple={this.state.contentType == CONTENT_TYPE.DECK ? true : false} accept={fileExtension} style={{ display: 'none' }} onChange={(ev) => this.changeFile(ev, this.state.tabLanguageId)} />
                        <p className="form-sub-header mb-0 pb-0 cpl-10 cpr-10">{getResourceValue(this.state.adminResources, 'INFO_DESCRIPTION')}</p>


                        <div className="row p-0 m-0">
                            <div className="col-12 p-0 m-0">
                                <p className="font-12 m-0 cpl-10 cpr-10 cpt-10">{getResourceValue(this.state.adminResources, 'CONTENT_TYPE')}</p>
                                <RadioGroup name="contentType" className="flex-row">
                                    {this.state.contentTypeList && this.state.contentTypeList.length > 0 && this.state.contentTypeList.map(content => (
                                        <div className="font-14" key={content.label}>
                                            <FormControlLabel className='m-0' value={content.value} control={<Radio onChange={(ev) => this.handleContentType(ev)} checked={content.value === this.state.contentType} />} label={content.label} />
                                        </div>
                                    ))}
                                </RadioGroup>
                                <div className="error-wrapper ml-10">
                                    {<span >{this.state.contentTypeErrorMessage}</span>}
                                </div>
                            </div>
                            <div className=" position-relative col-md-6 col-12 cpl-10 cpr-10">
                                <TextField
                                    label={getResourceValue(this.state.adminResources, 'CONTENT_CREATOR')}
                                    placeholder={getResourceValue(this.state.adminResources, 'CONTENT_CREATOR')}
                                    className='mt-0 mb-0 d-flex'
                                    margin="normal"
                                    variant="outlined"
                                    name="contentCreator"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.contentCreator}
                                />

                                <div className="error-wrapper">
                                    {this.state.contentCreaterErrorMessage}
                                </div>
                            </div>

                            <div className=" col-md-6 col-12 media-datepicker cpr-10 cpl-10">
                                <div className="datepicker-form-group position-relative">
                                    <div className={`own-custom-label ${this.state.valueInDate ? "active" : ''}`} style={{ top: -13, left: -9 }}>
                                        {getResourceValue(this.state.adminResources, 'CONTENT_CREATED')}
                                    </div>
                                    <div>
                                        <div onClick={this.datePickerClicked}>
                                            <DatePicker
                                                selected={this.state.startDate}
                                                onChange={this.dateChange}
                                                onClickOutside={this.datePickerValue}
                                                scrollableYearDropdown={true}
                                                yearDropdownItemNumber={100}
                                                maxDate={new Date()}
                                                dateFormat='dd-MM-yyyy'
                                                showYearDropdown
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
                                                showMonthDropdown
                                                onChangeRaw={(ev) => ev.preventDefault()}
                                            />
                                            <div className="error-wrapper">
                                                {this.state.dateError}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className=" position-relative col-md-6 col-12 cpl-10 cpr-10 cpt-10">
                                <TextField
                                    multiline
                                    label={getResourceValue(this.state.adminResources, 'CONTENT_DESCRIPTION')}
                                    placeholder={getResourceValue(this.state.adminResources, 'CONTENT_DESCRIPTION')}
                                    className='mt-0 mb-0 d-flex'
                                    margin="normal"
                                    variant="outlined"
                                    name="description"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.description}
                                    rowsMax={4}
                                />

                                <div className="error-wrapper">
                                    {this.state.descriptionErrorMessage}
                                </div>
                            </div>
                            <div className=" position-relative col-md-6 col-12 cpt-10 cpl-10 cpr-10">
                                <TextField
                                    multiline
                                    label={getResourceValue(this.state.adminResources, 'ADMIN_NOTE')}
                                    placeholder={getResourceValue(this.state.adminResources, 'ADMIN_NOTE')}
                                    className='mt-0 mb-0 d-flex'
                                    margin="normal"
                                    variant="outlined"
                                    name="adminNote"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.adminNote}
                                    rowsMax={4}
                                />
                                <div className="error-wrapper">
                                    {this.state.adminNoteErrorMessage}
                                </div>
                            </div>
                            <div className=" position-relative col-md-6 col-12 cpt-10 cpl-10 cpr-10">
                                <TextField
                                    label={getResourceValue(this.state.adminResources, 'ORGAINZATION')}
                                    placeholder={getResourceValue(this.state.adminResources, 'ORGAINZATION')}
                                    className='mt-0 mb-0 d-flex'
                                    margin="normal"
                                    variant="outlined"
                                    name="organisation"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.organisation}
                                />
                                <div className="error-wrapper">
                                    {this.state.organizationErrorMessage}
                                </div>
                            </div>
                        </div>


                        {this.state.renderData &&
                            <>
                                <ContentCategoryComponent docType="deck" parentCategory={this.state.parentCategory} childRef={ref => (this.secondFormStep = ref)} editMode={editMode} dataVal={dataVal} />

                                <TagComponent resources={this.state.adminResources} formNumber="07" ref="tagComp" existingTab={this.state.existingTab} from={resourceGroups.UPLOAD_MEDIA} editMode={editMode} errorTag={this.state.errorTagMessage} dataVal={dataVal} tagLABEL={getResourceValue(this.state.adminResources, 'SEARCH_TAG_LABEL')} />
                            </>}
                        <p className="form-sub-header mb-0  cpt-10 cpb-10 cpl-10"> {getResourceValue(this.state.adminResources, 'UPLOAD_FILES')}</p>

                        <div className="row col-12 m-0 cpl-10 cpb-10">
                            {
                                this.props.languageList && this.props.languageList.length > 0 && this.props.languageList.map((item) => {
                                    return (
                                        <div className='mr-40' ><span onClick={() => this.setState({ tabLanguageId: item.language_id })} className={this.state.tabLanguageId == item.language_id ? 'select-language-tab' : 'language-tab'}>{item.language_name}</span></div>
                                    )
                                })
                            }
                        </div>
                        <div className="row m-0 p-0">
                            <div className="col-md-6 col-12 cpt-10  cpl-10 cpr-10">
                                <TextField
                                    label={getResourceValue(this.state.adminResources, 'CONTENT_TITLE')}
                                    placeholder={getResourceValue(this.state.adminResources, 'CONTENT_TITLE')}
                                    className='mt-0 mb-0 d-flex'
                                    margin="normal"
                                    variant="outlined"
                                    name="contentTitle"
                                    multiline={true}
                                    rowsMax={3}
                                    onChange={(ev) => this.saveContentTitle(ev.target.value)}
                                    value={this.state.contentTitle[this.state.tabLanguageId] ? this.state.contentTitle[this.state.tabLanguageId] : ''}
                                />
                                <div className="error-wrapper">
                                    {this.state.contentTitleErrorMessage[this.state.tabLanguageId]}
                                </div>
                            </div>
                        </div>
                        {this.state.contentType == CONTENT_TYPE.DECK &&
                            <>
                                <p className="font-12 mb-10 cpl-10 cpl-10 cpr-10 cpt-10">{getResourceValue(this.state.adminResources, 'UPLOAD_IMAGES')}</p>
                                <div className="upload-list-container cml-10 cmr-10 mb-20">
                                    <div>
                                        {
                                            this.state.files.length > 0 && this.state.files[this.state.tabLanguageId] && this.state.files[this.state.tabLanguageId].length > 0 &&
                                            <DragDropContext onDragEnd={this.handleOnDragEnd}>
                                                <Droppable droppableId="characters">
                                                    {(provided) => (
                                                        <ul className="characters" {...provided.droppableProps} ref={provided.innerRef}>
                                                            {this.state.files[this.state.tabLanguageId].map((file, index) => {
                                                                let lastIndex = this.state.files[this.state.tabLanguageId].length - 1;
                                                                return (
                                                                    <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                                                                        {(provided) => (
                                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={lastIndex != index ? 'border-bottom-grey' : ''} >
                                                                                <div className="upload-file-container">
                                                                                    <div className='filename-container'>
                                                                                        <div className="pdf-box-container" ><ImageIcon /></div>
                                                                                        <div>
                                                                                            <div className='image-header'>{file.name}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='file-icon-container'>
                                                                                        {/* <div className="p-2 cursor" onClick={() => this.setState({ imgView: true })} >
                                                                                            <ImageIcon />
                                                                                        </div> */}
                                                                                         {this.props.editMode && <div className='p-2 cursor' onClick={() => this.previewImage(index)}>
                                                                                            <PreviewIcon/>
                                                                                        </div>}
                                                                                        <div className='p-2 cursor' >
                                                                                            <DragIcon />
                                                                                        </div>
                                                                                        <div className='p-2 cursor' onClick={() => this.lockUnlockFile(index, file.is_locked ? 0 : 1)} >
                                                                                            {
                                                                                                file.is_locked ? <LockIcon /> : <UnlockIcon />
                                                                                            }
                                                                                        </div>

                                                                                        <div className='p-2 cursor' onClick={() => this.deleteFile(index)} >
                                                                                            <TrashIcon />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                        }
                                                                    </Draggable>
                                                                );
                                                            })}
                                                            {provided.placeholder}
                                                        </ul>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>}

                                    </div>
                                    <div onClick={() => this.fileRef.current.click()} className="upload-area-container cursor mt-20">
                                        <div className="upload-container mb-20 mt-20">
                                            <div className="upload-add-container" >
                                                <PlusIcon />
                                            </div>
                                            <div>
                                                <div className='upload-header'>{getResourceValue(this.state.adminResources, 'DECK_HEADER_DESCRIPTION')}</div>
                                                <div className='upload-sub-header' >{getResourceValue(this.state.adminResources, 'UPLOAD_DECK_FILENAME_NOTE')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="error-wrapper">
                                        {this.state.fileError[this.state.tabLanguageId]}
                                    </div>
                                </div>
                            </>
                        }
                        {this.state.contentType == CONTENT_TYPE.VIDEO &&
                            <>
                                <p className="font-12 mb-10 cpl-10 cpr-10 cpt-10">{getResourceValue(this.state.adminResources, 'VIDEO_HEADER')}</p>
                                <div className="upload-list-container cml-10 cmr-10 mb-20">
                                    <div>
                                        {
                                            this.state.files.length > 0 && this.state.files[this.state.tabLanguageId] && this.renderVideoList()
                                        }
                                    </div>
                                    {
                                        !this.state.files[this.state.tabLanguageId] && <div onClick={() => this.fileRef.current.click()} className="upload-area-container cursor">
                                            <div className="upload-container mb-20 mt-20">
                                                <div className="upload-add-container" >
                                                    <PlusIcon />
                                                </div>
                                                <div>
                                                    <div className='upload-header'>{getResourceValue(this.state.adminResources, "VIDEO_HEADER")}</div>
                                                    <div className='upload-sub-header' >{getResourceValue(this.state.adminResources, 'UPLOAD_VIDEO_FILENAME_NOTE')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className="error-wrapper">
                                    {this.state.fileError[this.state.tabLanguageId]}
                                </div>
                            </>
                        }
                        {this.state.contentType == CONTENT_TYPE.FILE &&
                            <div className='cpl-10 cpr-10'>
                                <p className="font-12 mb-10 cpl-1 cpr-10 cpt-10">{getResourceValue(this.state.adminResources, 'UPLOAD_FILE')}</p>
                                <div className="upload-list-container mb-20">
                                    <div>
                                        {
                                            this.state.files.length > 0 && this.state.files[this.state.tabLanguageId] && this.renderAttachment()
                                        }
                                    </div>
                                    {
                                        !this.state.files[this.state.tabLanguageId] && <div onClick={() => this.fileRef.current.click()} className="upload-area-container cursor">
                                            <div className="upload-container mb-20 mt-20">
                                                <div className="upload-add-container" >
                                                    <PlusIcon />
                                                </div>
                                                <div>
                                                    <div className='upload-header'>{getResourceValue(this.state.adminResources, "UPLOAD_FILE")}</div>
                                                    <div className='upload-sub-header' >{getResourceValue(this.state.adminResources, 'UPLOAD_ATTACHMENT_FILENAME_NOTE')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className="error-wrapper">
                                    {this.state.fileError[this.state.tabLanguageId]}
                                </div>
                            </div>
                        }
                        <div className="row form-header-container ml-0 mr-0">
                            <div className="col-md-3 col-3">
                                <p className="form-sub-header cpl-10 cpr-10">{getResourceValue(this.state.adminResources, 'ADD_LINKS')}</p>
                            </div>
                            <div className="col-md-9 col-9 ">
                                <div className="header-button-container cpl-10 cpr-10">
                                    <button type="button" onClick={() => this.handleAddLink()} className="btn btn-own btn-own-primary min-height-btn ml-20 mw-100">{'+ '}{getResourceValue(this.state.adminResources, 'ADD')}</button>
                                </div>
                            </div>
                        </div>
                        {
                            this.state.links.length > 0 && this.state.links[this.state.tabLanguageId] && this.state.links[this.state.tabLanguageId].length > 0 && this.state.links[this.state.tabLanguageId].map((link, index) => {
                                return (
                                    <div className="row m-0" key={index.toString()}>
                                        <div className="position-relative col-md-6 col-12 cpb-10 cpl-10 cpr-10">
                                            <TextField
                                                label={getResourceValue(this.state.adminResources, 'DISPLAY_TEXT')}
                                                placeholder={getResourceValue(this.state.adminResources, 'DISPLAY_TEXT', resourceFields.Placeholder)}
                                                className='mt-0 mb-0 d-flex'
                                                margin="normal"
                                                variant="outlined"
                                                name="display_text"
                                                onChange={(ev) => this.handleDisplayText(ev.target.value, index)}
                                                value={link.display_text}
                                            />
                                            {
                                                this.state.links[this.state.tabLanguageId].length == (index + 1) && <div className="error-wrapper">
                                                    {this.state.displayTextError[this.state.tabLanguageId] && this.state.displayTextError[this.state.tabLanguageId]}
                                                </div>
                                            }
                                        </div>
                                        <div className="position-relative col-md-6 col-12 cpb-10 cpl-10 cpr-10">
                                            <div className='row m-0' >
                                                <div className="col-7 p-0 m-0">
                                                    <TextField
                                                        label={getResourceValue(this.state.adminResources, 'DISPLAY_URL')}
                                                        placeholder={getResourceValue(this.state.adminResources, 'DISPLAY_URL')}
                                                        className='mt-0 mb-0 d-flex'
                                                        margin="normal"
                                                        variant="outlined"
                                                        name="organisation"
                                                        onChange={(ev) => this.handleUrl(ev.target.value, index)}
                                                        value={link.display_url}
                                                    />
                                                    {
                                                        this.state.links[this.state.tabLanguageId].length == (index + 1) && <div className="error-wrapper">
                                                            {this.state.urlError[this.state.tabLanguageId] && this.state.urlError[this.state.tabLanguageId]}
                                                        </div>
                                                    }
                                                </div>
                                                <div className={`col-3 p-0 ml-15 ${this.state.isFileDropdownDisabled ? 'disabled' : ''}`}>
                                                    <FormControl variant="outlined">
                                                        <InputLabel id="SELECT_FILE">{getResourceValue(this.state.adminResources, "SELECT_FILE")}</InputLabel>
                                                        <Select
                                                            labelId="SELECT_FILE"
                                                            id="demo-simple-select-outlined"
                                                            value={link.file_name ? link.file_name : null}
                                                            onChange={(ev) => this.handleFileLink(ev.target.value, index)}
                                                            label={getResourceValue(this.state.adminResources, "SELECT_FILE")}
                                                            name="pageSize"
                                                            disabled={this.state.isFileDropdownDisabled}
                                                            style={{ width: '120px' }}
                                                        >
                                                            {this.state.contentType == CONTENT_TYPE.DECK && this.state.files.length > 0 && this.state.files[this.state.tabLanguageId] && this.state.files[this.state.tabLanguageId].length > 0 && this.state.files[this.state.tabLanguageId].map((data, index) => (
                                                                <MenuItem value={data.ViewMode ? data.file_name : data.name} key={index}>{data.name}</MenuItem>
                                                            ))}
                                                            {this.state.contentType != CONTENT_TYPE.DECK && this.state.files.length > 0 && this.state.files[this.state.tabLanguageId] && (
                                                                <MenuItem value={this.state.files[this.state.tabLanguageId].ViewMode ? this.state.files[this.state.tabLanguageId].file_name : this.state.files[this.state.tabLanguageId].name} key={index}>{this.state.files[this.state.tabLanguageId].name}</MenuItem>
                                                            )}
                                                        </Select>
                                                    </FormControl>
                                                    {
                                                        this.state.links[this.state.tabLanguageId].length == (index + 1) && <div className="error-wrapper">
                                                            {this.state.linkFileError[this.state.tabLanguageId] && this.state.linkFileError[this.state.tabLanguageId]}
                                                        </div>
                                                    }
                                                </div>
                                                <div className="col-1 p-0 ml-15 position-relative justify-content-end">
                                                    <div className='p-2 cursor' onClick={() => this.handleRemoveLink(index)} >
                                                        <TrashIcon />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }

                    </form>

                </section>

                
                {this.state.filePreview && 
                <PdfModal open={this.state.filePreview} url={this.state.selectedFile} onCloseModal={() => this.setState({filePreview:false})} 
                    />}
                {

                    this.props.imgurl && this.props.imgurl.length > 0 && this.props.imgurl.map((item) => {
                        return (
                            <ImgViewerModal open={this.state.imgView} url={item} onCloseModal={() => this.setState({ imgView: false })
                            } />)
                    })
                }
                {this.state.imgPreview &&
                    <Modal classNames={{ modal: "modal-lg-full  modal-own p-0 modal-patient modalPad" }} open={this.state.imgPreview} onClose={() => this.setState({ imgPreview: false })} center showCloseIcon={true} closeOnOverlayClick={true}>
                        <ContentPreviewComponent
                            imgPrevPath={this.state.selectedImage}
                            imgPrevFile={this.state.imgPrevFile}
                            singleImgView={true}
                        />
                    </Modal>}
                {this.state.videoPreview &&
                    <Modal classNames={{ modal: "modal-lg modal-own" }} open={this.state.videoPreview} onClose={() => this.setState({ videoPreview: false })} center showCloseIcon={true} closeOnOverlayClick={true}>
                        <div className='d-flex flex-wrap align-items-center justify-content-center preview-margin'>
                            <Player playsInline >
                                <source src={this.state.selectedVideo} />
                                <ControlBar>
                                    <ReplayControl seconds={10} order={1.1} />
                                    <ForwardControl seconds={10} order={1.2} />
                                    <CurrentTimeDisplay order={4.1} />
                                    <TimeDivider order={4.2} />
                                    <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
                                </ControlBar>
                            </Player>
                        </div>
                    </Modal>
                    }
            </div >

        );
    }
}


const mapStateToProps = state => ({
    userData: state.user.userData,
    languageId: state.common.languageId,
    languageList: state.common.languageList,
})


export default connect(mapStateToProps)(withRouter(AddEditContentComponent));
