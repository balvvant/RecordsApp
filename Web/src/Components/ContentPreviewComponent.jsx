import { format } from 'date-fns';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import 'react-responsive-modal/styles.css';
import { withRouter } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import {
    ControlBar, CurrentTimeDisplay, ForwardControl, PlaybackRateMenuButton, Player, ReplayControl, TimeDivider
} from "video-react";
import "video-react/dist/video-react.css";
import { errorLogger } from '../actions/commonActions';
import { API_METHODS, CONTENT_TYPE, GLOBAL_API, PATIENT_CONTENT_TYPES } from '../Constants/types';
import { DECKIcon, ImageIcon, PDFIcon, URLIcon, VideoIcon } from '../Constants/svgIcons';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
};
class ContentPreviewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            totalDocument: null,
            viewType: PATIENT_CONTENT_TYPES.DECK,
            currentFileUrl: '',
            attachments: [],
            attachment: props.attachment,
            attachmentIndex: 0,
            prevStats: {},
            currentSlide: 1,
            contentFileId: 0,
            contentFiles: props.contentFiles,
            percentage: 0,
            show: [0]
        };
    }

    // renderLinksRow = (linkData, index) => {
    //     if (linkData?.content_file_id == this.state.contentFileId || this.props?.data?.content_type_key == CONTENT_TYPE.VIDEO || (linkData.contentFileId == this.props.contentFileId && this.state.currentSlide == 1)) {
    //         return (
    //             <li key={index} className="d-flex cursor leftAttachColHd cpt-10 cpb-10 cpr-10 align-items-center" onClick={() => window.open(linkData.display_url, '_BLANK')} style={{ alignSelf: 'center' }}  >
    //                 <div>
    //                     <URLIcon width={"30px"} height={"30px"} />
    //                 </div>
    //                 <div>
    //                     <p className="RLink cpl-10 my-0">{linkData.display_text}</p>
    //                     {
    //                         linkData.last_opened &&
    //                         <p className="attchLastOpn cpl-10 mb-0">{getResourceValue(this.props.resources, 'LAST_OPENED')} {format(new Date(linkData.last_opened), "dd-MM-yyyy")}</p>
    //                     }
    //                 </div>
    //             </li>
    //         )

    //     }

    // }
    renderLink = (linkData, index, attachment) => {
        return (
            <li key={index} className="d-flex cursor leftAttachColHd cpt-10 cpb-10 cpr-10 align-items-center" onClick={() => window.open(linkData.display_url, '_BLANK')} style={{ alignSelf: 'center' }}  >
                <div>
                    <URLIcon width={"30px"} height={"30px"} />
                </div>
                <div>
                    <p className="RLink cpl-10 my-0">{linkData.display_text}</p>
                    {
                        linkData.last_opened &&
                        <p className="attchLastOpn cpl-10 mb-0">{getResourceValue(this.props.resources, 'LAST_OPENED')} {format(new Date(linkData.last_opened), "dd-MM-yyyy")}</p>
                    }
                </div>
            </li>
        )
    }
    onSliderChange = (currentSlide) => {
        if (this.props.contentFiles[this.props.languageId][currentSlide]) {
            this.setState({ contentFileId: this.props.contentFiles[this.props.languageId][currentSlide].content_file_id });
        }
        else if (this.props.attachment) {
            let newSlideCount = currentSlide + 1;
            let attachment = this.state.attachment;
            this.setState({ currentSlide: newSlideCount });
            if (newSlideCount == attachment.content_files.length) {
                this.markFullViewed()
            }
            let contentFileId = 0;
            if (attachment.content_files[currentSlide]) {
                contentFileId = attachment.content_files[currentSlide].content_file_id;
            }
            this.setState({ contentFileId: contentFileId });
        }
    }
    beforeSliderChange = () => {
        if (this.props.contentFiles[this.props.languageId][0]) {
            this.setState({ contentFileId: this.props.contentFiles[this.props.languageId][0].content_file_id });
        }
    }
    markFullViewed = () => {
        let prevStats = this.state.prevStats;
        if (prevStats?.isAvailable) {
            prevStats.is_full_viewed = 1;
            this.setState({ prevStats: prevStats });
        }
    }

    getSlides = () => {
        if (!this.props?.data?.languages) {
            return this.props.contentFiles?.length > 0 && this.props.contentFiles.map((deck, index) => (
                <div className="d-flex justify-content-center" key={index}>
                    <div className="inner-img-wrapper">
                        <img src={`${GLOBAL_API}/${deck?.file_path}`} />
                    </div>
                </div>
            ))
        } else {
            if (this.props.contentFiles[this.props.languageId]) {
                return this.props.contentFiles[this.props.languageId]?.length > 0 && this.props.contentFiles[this.props.languageId].map((deck, index) => (

                    <div className="d-flex justify-content-center" key={index}>
                        <div className="inner-img-wrapper">
                            <img src={`${GLOBAL_API}/${deck?.file_path}`} />
                        </div>
                    </div>

                ))

            } else {
                return this.props.contentFiles[this.props?.data?.default_language_id]?.length > 0 && this.props.contentFiles[this.props?.data?.default_language_id].map((deck, index) => (
                    <div key={index} className="d-flex justify-content-center" >
                        <div className="inner-img-wrapper">
                            <img src={`${GLOBAL_API}/${deck?.file_path}`} />
                        </div>
                    </div>
                ))
            }
        }
    }
    renderIcon = (viewType) => {
        if (viewType == PATIENT_CONTENT_TYPES.DECK) {
            return <DECKIcon width={"40"} height={"40"} />;
        } else if (viewType == PATIENT_CONTENT_TYPES.VIDEO) {
            return <VideoIcon width={"40"} height={"40"} />;
        } else if (viewType == PATIENT_CONTENT_TYPES.FILE) {
            return <PDFIcon width={"40"} height={"40"} />
        } else if (viewType == PATIENT_CONTENT_TYPES.IMAGE) {
            return <ImageIcon width={"40"} height={"40"} />
        }
    }
    sendPatientVisit = async (fileData, viewType, linkData = {}, is_full_viewed = 0) => {
        try {
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: `/add-patient-visit`,
                body: this.managePatientVisit(fileData, viewType, linkData, is_full_viewed)
            };
            await CallApiAsync(obj);
            if (!fileData) {
                this.props.onClose();
            }
        } catch (error) {
            let errorObject = {
                method: 'visitRecords/sendPatientVisit',
                errorStake: error.toString(),
                history: this.props.history
            }
            errorLogger(errorObject);
        }
    }
    managePatientVisit = (fileData, viewType, linkData = {}, is_full_viewed = 0) => {
        let lastDetails = {};

        if (this.state.prevStats?.isAvailable) {
            let prevStats = Object.create(this.state.prevStats);
            lastDetails = {
                time_spent: (new Date().getTime() - prevStats.StartTime.getTime()) / 1000,
                is_full_viewed: prevStats.is_full_viewed,
                patient_content_id: prevStats.patient_content_id,
                patient_content_attachment_id: prevStats.patient_content_attachment_id,
                clinician_content_file_id: prevStats.clinician_content_file_id,
            }
            if (prevStats.viewType == PATIENT_CONTENT_TYPES.URL) {
                lastDetails.content_link_id = prevStats.content_link_id;
            }
        }

        if (fileData) {
            let newDetails = {
                isAvailable: true,
                StartTime: new Date(),
                is_full_viewed: viewType == PATIENT_CONTENT_TYPES.IMAGE ? 1 : is_full_viewed,
                patient_content_id: this.props?.content?.patient_content_id,
                patient_content_attachment_id: fileData.patient_content_attachment_id,
                clinician_content_file_id: fileData.clinician_content_file_id,
                viewType: viewType
            };
            if (viewType == PATIENT_CONTENT_TYPES.URL && linkData) {
                newDetails.content_link_id = linkData.content_link_id;
            }
            this.setState({ prevStats: newDetails });
        }
        return lastDetails;
    }
    renderAttachmentRow = (attachment, index) => {
        let fileName = '';

        if (attachment.file_type == PATIENT_CONTENT_TYPES.DECK) {
            fileName = this.props.content.content_title;
        } else {
            if (attachment.content_files.length > 0) {
                fileName = attachment.content_files[0].file_name.split(".")[0]
            }

            //this.sendPatientVisit(attachment, attachment.file_type)
        }
        return (
            <ul className="attch-mod m-0 " key={index}>
                <li className="cursor active" style={this.state.attachmentIndex === index ? { backgroundColor: '#dadada' } : {}} onClick={() => this.setState({ viewType: attachment.file_type, attachmentIndex: index, attachment: attachment }, () => this.sendPatientVisit(attachment, attachment.file_type))} >
                    <div className="downloadCon cpt-16 cpb-16 cpl-10 cpr-10" >
                        <div className="d-flex" >
                            <div style={{ width: 'fit-content' }}>
                                {this.renderIcon(attachment.file_type)}
                            </div>
                            <div className="attchDtlCon cpl-10" style={{ width: 'fit-content' }} >
                                <p className="attchName mb-0 pd-row-title">{fileName}</p>
                                {
                                    attachment.last_opened &&
                                    <p className="attchLastOpn mb-0">{getResourceValue(this.props.resources, 'LAST_OPENED')} {format(new Date(attachment.last_opened), "dd-MM-yyyy")}</p>
                                }
                            </div>
                        </div>
                        <div className="attchDtlCon cpl-10 " style={{ width: 'fit-content' }} >
                            <span onClick={() => this.saveFile(attachment)} className="video-download-wrapper cpt-10">
                                {!this.state.show[index] || (this.state.percentage == 100) ? <i className="fa fa-arrow-circle-o-down cursor" aria-hidden="true"></i> :
                                    <div className='cpb-10' style={{ width: 30, height: 30 }}>
                                        <CircularProgressbar
                                            value={this.state.percentage}
                                            strokeWidth={15}
                                        /></div>}</span>
                        </div>
                    </div>
                </li>

                {/** Content Links */}
                {
                    attachment.links.length > 0 && attachment.links.map((linkData, index) => {
                        if (attachment.file_type == PATIENT_CONTENT_TYPES.DECK) {
                            if (linkData.content_file_id == this.state.contentFileId) {
                                return this.renderLink(linkData, index, attachment);
                            }
                        } else {
                            return this.renderLink(linkData, index, attachment)
                        }
                    })
                }
            </ul>
        )
    }

    saveFile = (attachment, index) => {
        try {
            let fileUrl = '';
            let fileName = '';
            if (attachment.file_type == PATIENT_CONTENT_TYPES.DECK) {
                fileUrl = GLOBAL_API + '/' + attachment.pdf_file;
                fileName = attachment.pdf_file;
            } else {
                fileUrl = GLOBAL_API + '/' + attachment.content_files[0].file_path;
                fileName = attachment.content_files[0].file_name;
            }
            // globalLoader(true);
            this.show(index, 1);
            this.state.percentage = 10;
            let percentage = 0;
            axios.get(`${fileUrl}`, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.setState({ percentage: percentage });
                }
            })
                .then((res) => {
                    this.setState({ percentage: percentage });
                    // this.show(index,0);
                    fileDownload(res.data, fileName);
                    // globalLoader(false);
                })
        } catch (error) {
            let errorObject = {
                methodName: "visitRecords/saveVideo",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }


    }
    show = (index, val) => {
        this.state.show[index] = val;
    }

    render() {
        // let isAddedd = this.props.isAddedInBasket(this.props.data) >= 0 ? true : false;
        return (
            <div className="content-container cpr-10 cpl-10 " >

                <div className="deck-slider-wrapper">
                    <div className="row p-0 m-0">
                        {
                            this.props.attachments ?
                                <>
                                    {
                                        this.props.attachments && this.props.attachments.length > 0 &&
                                        <div style={{ borderRight: '1px solid #dadada' }} className="col-md-3 col-12 p-0 attchLeftScrl">
                                            <div className="col-md-12">
                                                <div className="cpt-20 attch-modLbl cpb-20" >
                                                    <p className="mb-0 pd-row-title">{getResourceValue(this.props.resources, 'ATTACHMENTS')} ({this.props.content.attachments_count})</p>
                                                </div>
                                            </div>

                                            <div className="col-md-12 AttachList p-0">
                                                {
                                                    this.props.attachments.length > 0 && this.props.attachments.map((attachment, index) => (
                                                        this.renderAttachmentRow(attachment, index)
                                                    ))
                                                }
                                            </div>
                                        </div>

                                    }
                                </> :
                                <>
                                    {((this.props?.links[this.props.languageId].length > 0) || (this.props?.data?.content_type_key == CONTENT_TYPE.DECK && this.props?.contentFiles.length > 0))
                                        &&
                                        <div style={{ borderRight: '1px solid #dadada' }} className="col-md-3 col-12 p-0 attchLeftScrl">
                                            <>
                                                <div className='col'>
                                                    {this.props?.data?.content_created_by && <p className="mb-0 cpb-10 cpt-10" ><span className="font-600">{getResourceValue(this.props.resources, "CREATED_BY")}:</span> {this.props?.data?.content_created_by}</p>}
                                                </div>
                                                <div className='col'>
                                                    {this.props?.data?.description && <p className="text-justify paraColLeft"><span className="font-600">{getResourceValue(this.props.resources, "DECK_DESCRIPTION")}:</span>{this.props?.data?.description}</p>}
                                                </div>
                                            </>

                                            {(this.props?.data?.content_type_key == CONTENT_TYPE.DECK && this.props.contentFiles.length > 0) &&
                                                <div className='col'>
                                                    <p className="mb-0 text-left cpt-10"><b> {getResourceValue(this.props.resources, "SLIDES")}</b> {this.state.currentSlide} {getResourceValue(this.props.resources, "OF")} {this.props.contentFiles[this.props.languageId] ? this.props.contentFiles[this.props.languageId].length : this.props.contentFiles[this.props?.data?.default_language_id].length} </p>
                                                </div>}
                                            <div className="col-md-12">
                                                <div className="cpt-20 attch-modLbl cpb-20" >
                                                    <p className="mb-0 pd-row-title">{getResourceValue(this.props.resources, 'RELATED_LINKS')} </p>
                                                </div>
                                            </div>
                                            <div className="col-md-12 AttachList p-0">
                                                {
                                                    this.props.links[this.props.languageId].length > 0 && this.props.links[this.props.languageId].map((link, index) => (
                                                        this.renderLink(link, index)
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    }
                                </>
                        }

                        {
                            this.props.attachments ?
                                <div className="col-md-9 col-12 p-0 m-0 attchRightScrl">
                                    {
                                        this.state.attachment.content_files && this.state.attachment.content_files.length > 0 ?
                                            <>
                                                {this.state.viewType == PATIENT_CONTENT_TYPES.IMAGE &&
                                                    <div className="imgViewType">
                                                        <img src={`${GLOBAL_API}/${this.state.attachment.content_files[0].file_path}`} />
                                                    </div>
                                                }

                                                {this.state.viewType == PATIENT_CONTENT_TYPES.FILE && <iframe src={`${GLOBAL_API}/${this.state.attachment.content_files[0].file_path}`} className="attachIframe"></iframe>}

                                                {this.state.viewType == PATIENT_CONTENT_TYPES.DECK &&
                                                    <>
                                                        <Slider {...settings} afterChange={
                                                            (currentSlide) => {
                                                                this.setState({ currentSlide: currentSlide + 1 });
                                                                this.onSliderChange(currentSlide);
                                                            }
                                                        }>
                                                            {this.getSlides()}
                                                        </Slider>
                                                    </>
                                                }
                                                {this.state.viewType == PATIENT_CONTENT_TYPES.VIDEO &&
                                                    <Player
                                                        playsInline
                                                        onEnded={() => this.markFullViewed()}
                                                    >
                                                        <source src={`${GLOBAL_API}/${this.state.attachment.content_files[0].file_path}`} />
                                                        <ControlBar>
                                                            <ReplayControl seconds={10} order={1.1} />
                                                            <ForwardControl seconds={10} order={1.2} />
                                                            <CurrentTimeDisplay order={4.1} />
                                                            <TimeDivider order={4.2} />
                                                            <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
                                                        </ControlBar>
                                                    </Player>
                                                }
                                            </> : null
                                    }

                                </div>
                                :
                                <div className="col-md-9 col-12 p-0 m-0 attchRightScrl">
                                    {(this.props?.data?.content_type_key == CONTENT_TYPE.DECK && this.props.contentFiles.length > 0) &&
                                        <Slider {...settings} afterChange={
                                            (currentSlide) => {
                                                this.setState({ currentSlide: currentSlide + 1 });
                                                this.onSliderChange(currentSlide);
                                            }
                                        }>
                                            {this.getSlides()}
                                        </Slider>
                                    }

                                    {this.props?.data?.content_type_key == CONTENT_TYPE.VIDEO && (this.props.data.modified || this.props.contentPath) &&
                                        <Player playsInline>
                                            <source src={this.props.data.modified ? URL.createObjectURL(this.props.data.modified_video) : `${GLOBAL_API}/${this.props.contentPath}`} />
                                            <ControlBar>
                                                <ReplayControl seconds={10} order={1.1} />
                                                <ForwardControl seconds={10} order={1.2} />
                                                <CurrentTimeDisplay order={4.1} />
                                                <TimeDivider order={4.2} />
                                                <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
                                            </ControlBar>
                                        </Player>
                                    }
                                    {this.props?.data?.content_type_key == CONTENT_TYPE.FILE &&
                                        <>
                                            <iframe src={`${GLOBAL_API}/${this.props.contentPath}`} style={{
                                                width: "calc(100% - 0px)", height: "700px"
                                            }}
                                            />
                                        </>
                                    }
                                </div>
                        }

                    </div>
                </div>

            </div >
        )
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
})


export default connect(mapStateToProps)(withRouter(ContentPreviewComponent))