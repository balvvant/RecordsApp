import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select } from '@material-ui/core';
import { format } from 'date-fns';
import $ from 'jquery';
import React from 'react';
import { connect } from 'react-redux';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, GLOBAL_API,CONSTANTS, resourceGroups } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';
import ImgViewerModal from '../Modals/imgViewerModal';
import PdfModal from '../Modals/pdfModal';

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class ContentCategoryComponent extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            conditionSel: '',
            emptyConditionSel: false,
            emptyMedicationSel: false,
            medicationSel: '',
            emptyPartnerSel: false,
            emptyCategory: false,
            partnerSel: '',
            category: '',
            addAttachment: '',
            emptyAttachments: false,
            usecase: '',
            emptyUsecase: false,
            lockContent: "no",
            emptyLockContent: false,
            featured: '',
            emptyFeatured: false,
            securityCode: null,
            subCategoryList: [],
            parentCategoryName: '',
            imgView: false,
            pdfView: false,
            pdfurl: '',
            imgurl: '',
            deckAttachmentsError: props.deckAttachmentsError,
            adminResources: [],
            languageId: props.languageId,
            isGuidanceInfo: false,
        }
    }

    componentDidMount() {
        const { childRef } = this.props;
        childRef(this);
        if (this.props.editMode) this.setStateFromApi();
        this.getAdminResources();
    }


    componentDidUpdate(prevProps) {
        if (prevProps.deckAttachmentsError !== this.props.deckAttachmentsError) {
            this.setState({ deckAttachmentsError: this.props.deckAttachmentsError });
        }
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources() });
        }
    }


    getAdminResources = async () => {
        try {

            globalLoader(true);
            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.MANAGE_MEDIA, resourceGroups.COMMON, resourceGroups.UPLOAD_MEDIA],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "secondUploadFormStep/getAdminResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }


    setStateFromApi = async () => {
        try {
            const { dataVal } = this.props;
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-categories',
                body: {
                    parent_category_id: dataVal.parent_category_id
                }
            }
            let chaildCategory = await CallApiAsync(obj);
            if (chaildCategory.data.status === 200) {
                let allCategories = chaildCategory.data.data.categories;

                //remove 'All' category from the list
                let categories = allCategories.filter(e => e.all == 0);

                globalLoader(false);
                this.setState({
                    category: dataVal.parent_category_id.toString(),
                    parentCategoryName: dataVal.parent_category_name,
                    subCategoryList: categories,
                }, () => {
                    this.setState({
                        featured: dataVal.is_featured ? "yes" : "no",
                        lockContent: dataVal.is_locked ? "yes" : "no",
                        securityCode: dataVal.locked_code ? dataVal.locked_code : '',
                        conditionSel: dataVal.category_id.toString(),
                        isGuidanceInfo: dataVal.is_guidance_info ? true : false,
                        // attachmentFile:dataVal.deck_attachments && dataVal.deck_attachments.length>0 && dataVal.deck_attachments[0],
                        // addAttachment:dataVal.deck_attachments && dataVal.deck_attachments.length>0?"yes":"no",  
                        // attachmentFileName:dataVal.deck_attachments && dataVal.deck_attachments.length>0 &&dataVal.deck_attachments[0].name,

                    })
                })
            }
            else {
                globalLoader(false);
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, chaildCategory.data.status.toString()))
            }
        } catch (error) {
            let errorObject = {
                methodName: "secondUploadFormStep/setStateFromApi",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }

    }
    componentWillUnmount() {
        const { childRef } = this.props;
        childRef(undefined);
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
                methodName: "secondUploadFormStep/tagChange",
                errorStake: error.toString(),
                history:this.props.history
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
            formattedDate: format(date, 'dd-MM-yyyy'),
        });
    };

    changeValue = async (ev, empty) => {
        try {
            let name = ev.target.name;
            let value = ev.target.value;
            if (empty) {

                if (empty === "emptyCategory") {


                    let labelName = ev.target.labels[0].innerText;
                    this.setState({
                        conditionSel: "",
                        parentCategoryName: '',
                    })
                    globalLoader(true);
                    let obj = {
                        method: API_METHODS.POST,
                        history: this.props.history,
                        api: '/view-categories',
                        body: {
                            parent_category_id: ev.target.value
                        }
                    }
                    let chaildCategory = await CallApiAsync(obj);
                    if (chaildCategory.data.status === 200) {
                        let allCategories = chaildCategory.data.data.categories;

                        //remove 'All' category from the list
                        let categories = allCategories.filter(e => e.all == 0);

                        globalLoader(false);
                        this.setState({
                            [name]: value,
                            [empty]: false,
                            parentCategoryName: labelName,
                            subCategoryList: categories,
                        })

                    }
                    else {
                        globalLoader(false);
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, chaildCategory.data.status.toString()))
                    }
                }

                else {
                    this.setState({
                        [name]: value,
                        [empty]: false,
                    })
                }

            }
            else {
                this.setState({
                    [name]: value,
                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "secondUploadFormStep/changeValue",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    genToken = () => {
        let length = 6
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        this.setState({
            securityCode: result
        })
    }

    formValidation = async () => {
        this.setState({
            emptyAttachments: false,
            emptyLockContent: false,
            emptyConditionSel: false,
            emptyCategory: false,
            emptyFeatured: false,
            emptyMedicationSel: false,
            emptyPartnerSel: false,
            emptySecurityCode: false,
        })
        let formValidation = true;
        if (!this.state.category) {
            formValidation = false;
            this.setState({
                emptyCategory: true,
            })
        }
        else {

            if (!this.state.conditionSel) {
                formValidation = false;
                this.setState({
                    emptyConditionSel: true,
                })
            }


        }
        if (!this.state.featured) {
            formValidation = false;
            this.setState({
                emptyFeatured: true,
            })
        }
        // if (!this.state.usecase) {
        //     formValidation = false;
        //     this.setState({
        //         emptyUsecase: true,
        //     })
        // } 


        if (!this.state.lockContent) {
            formValidation = false;
            this.setState({
                emptyLockContent: true,
            })
        }
        else {
            if (this.state.lockContent === "yes" && !this.state.securityCode) {
                formValidation = false;
                this.setState({
                    emptySecurityCode: true,
                })
            }

        }
        return {
            formValidation: formValidation,
            data: {
                category: this.state.category,
                subCategory: this.state.conditionSel,
                featured: this.state.featured === "yes" ? true : false,
                lockContent: this.state.lockContent === "yes" ? true : false,
                securityCode: this.state.lockContent === "yes" && this.state.securityCode,
                isGuidanceInfo: this.state.isGuidanceInfo,
            }
        }
    }

    // openPdfFiles =(path)=>{
    //     window.open(`${GLOBAL_API}/${path.path}`)
    // }

    openPdfFiles = (path) => {

        try {
            let fileExtension = path?.path?.split('.').pop();
            if (fileExtension.toLowerCase() === 'pdf') {
                this.setState({
                    pdfurl: `${GLOBAL_API}/${path?.path}`
                }, () => {
                    this.setState({
                        pdfView: true
                    })
                })

            }
            else {
                this.setState({
                    imgurl: `${GLOBAL_API}/${path?.path}`
                }, () => {
                    this.setState({
                        imgView: true
                    })
                })

            }
            // window.open(`${GLOBAL_API}/${path}`)
        } catch (error) {
            let errorObject = {
                methodName: "secondUploadFormStep/openPdfFiles",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    render() {

        return (
            <>
                {/* <p className="form-sub-header cpt-10 pb-0">{getResourceValue(this.state.adminResources, 'CATEGORY')}</p> */}
                <p className="font-12 m-0 cpt-10 cpl-10">{getResourceValue(this.state.adminResources, 'CATEGORY_LABEL')}</p>
                <div className="row p-0 m-0">
                    <div className="col-md-6 col-12 cpl-0">
                        <RadioGroup name="category" className="flex-row">
                            {this.props.parentCategory && this.props.parentCategory.length > 0 && this.props.parentCategory.map(category => (
                                <div className="font-14" key={category.parent_category_id}>
                                    <FormControlLabel className='m-0' value={`${category.parent_category_id}`} control={<Radio onChange={(ev) => this.changeValue(ev, 'emptyCategory')} checked={`${category.parent_category_id}` === this.state.category} />} label={category.parent_category_name} />
                                </div>
                            ))}
                        </RadioGroup>

                        <div className="error-wrapper ml-10">
                            {this.state.emptyCategory && <span >{getResourceValue(this.state.adminResources, 'FIELD_REQUIRED')}</span>}
                        </div>
                        <div className="col-12 guidance-checkbox cpl-10">
                            <div>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.state.isGuidanceInfo}
                                            onChange={() => this.setState({
                                                isGuidanceInfo: !this.state.isGuidanceInfo
                                            })}
                                            name="guidanceInfo"
                                            iconStyle={{ fill: '#894' }}
                                        />
                                    }
                                    label={getResourceValue(this.state.adminResources, 'HCP_GUIDANCE_INFO')}
                                />
                            </div>
                        </div>
                    </div>
                    {this.state.parentCategoryName &&
                        <div className="col-md-6 col-12">
                            <div className='mb-10'>
                                <FormControl variant="outlined">
                                    <InputLabel id="condition-label" className="text-capitalize">{this.state.parentCategoryName}</InputLabel>
                                    <Select
                                        labelId="condition-label"
                                        value={this.state.conditionSel}
                                        onChange={(ev) => this.changeValue(ev, null)}
                                        label={this.state.parentCategoryName}
                                        name="conditionSel"
                                    >
                                        {this.state.subCategoryList && this.state.subCategoryList.length > 0 && this.state.subCategoryList.map((subCategory, index) => (
                                            <MenuItem value={subCategory.category_id} key={subCategory.category_id}>{subCategory.category_name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <div className="error-wrapper">
                                    {this.state.emptyConditionSel && <span >{getResourceValue(this.state.adminResources, 'FIELD_REQUIRED')}</span>}
                                </div>
                            </div>

                        </div>}


                </div>
                <div className="row m-0 p-0">
                    <div className="col-md-6 cpl-10 cpr-10">
                        <p className="font-12 m-0">{getResourceValue(this.state.adminResources, 'FEATURED_LABEL')}</p>
                        <div className="col-12 p-0">
                            <RadioGroup name="featured" className="flex-row" value={this.state.featured} onChange={(ev) => this.changeValue(ev, 'emptyFeatured')}>
                                <div>
                                    <FormControlLabel value="yes" control={<Radio />} label={getResourceValue(this.state.adminResources, 'YES')} />
                                </div>
                                <div>
                                    <FormControlLabel value="no" control={<Radio />} label={getResourceValue(this.state.adminResources, 'NO')} />
                                </div>
                            </RadioGroup>
                            <div className="error-wrapper">
                                {this.state.emptyFeatured && <span >{getResourceValue(this.state.adminResources, 'FIELD_REQUIRED')}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 cpl-10 cpr-10">
                        <div>
                            <p className="font-12 m-0 ">{getResourceValue(this.state.adminResources, 'LOCK_LABEL')}</p>
                        </div>
                        <div className="row p-0 m-0" >
                            <div className="col-md-4 p-0 m-0 ">
                                <RadioGroup name="lockContent" className="flex-row" value={this.state.lockContent} onChange={(ev) => this.changeValue(ev, 'emptyLockContent')}>
                                    <div>
                                        <FormControlLabel value="yes" control={<Radio />} label={getResourceValue(this.state.adminResources, 'YES')} />
                                    </div>
                                    <div>
                                        <FormControlLabel value="no" control={<Radio />} label={getResourceValue(this.state.adminResources, 'NO')} />
                                    </div>
                                </RadioGroup>
                                <div className="error-wrapper ml-10">
                                    {this.state.emptyLockContent && <span >{getResourceValue(this.state.adminResources, 'FIELD_REQUIRED')}</span>}
                                </div>
                                <div className="error-wrapper ml-10">
                                    {this.state.emptySecurityCode && !this.state.securityCode && this.state.lockContent === "yes" && <span >{getResourceValue(this.state.adminResources, 'FIELD_REQUIRED')}</span>}
                                </div>
                            </div>
                            <div className="col-md-8 p-0 m-0 d-flex align-items-center">
                                {this.state.lockContent === "yes" &&
                                    <div className='ml-10' >
                                        {!this.state.securityCode ? <button className="btn btn-own btn-primary-own mw-100" onClick={this.genToken}>{getResourceValue(this.state.adminResources, 'ACCESS_CODE')}</button> :
                                            <span><span>{getResourceValue(this.state.adminResources, 'ACCESS_CODE')} : </span><span className="primary-color font-600">{this.state.securityCode}</span></span>}
                                    </div>}
                            </div>
                        </div>
                    </div>
                </div>

                {this.state.pdfView &&
                    <PdfModal open={this.state.pdfView} url={this.state.pdfurl} onCloseModal={() => this.setState({
                        pdfView: false
                    })
                    } />}

                {this.state.imgView &&
                    <ImgViewerModal open={this.state.imgView} url={this.state.imgurl} onCloseModal={() => this.setState({ imgView: false })
                    } />

                }
            </>
        );
    }
}

const mapStateToProps = state => ({
    userData: state.user.userData,
    languageId: state.common.languageId
})

export default connect(mapStateToProps)(withRouter(ContentCategoryComponent));
