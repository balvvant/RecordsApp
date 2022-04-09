import axios from 'axios';
import { format } from 'date-fns';
import fileDownload from 'js-file-download';
import React from "react";
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import { withRouter } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { ControlBar, CurrentTimeDisplay, ForwardControl, PlaybackRateMenuButton, Player, ReplayControl, TimeDivider } from "video-react";
import "video-react/dist/video-react.css";
import { errorLogger, globalAlert, globalLoader } from "../actions/commonActions";
import { API_METHODS, GLOBAL_API, CONSTANTS, PATIENT_CONTENT_TYPES } from "../Constants/types";
import { ImageIcon, PDFIcon, DECKIcon, URLIcon, VideoIcon } from "../Constants/svgIcons";
import ContentPreviewComponent from '../Components/ContentPreviewComponent';
import { CallApiAsync, getResourceValue } from "../Functions/CommonFunctions";
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

class PatientRecords extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            totalDocument: null,
            viewType: PATIENT_CONTENT_TYPES.DECK,
            currentFileUrl: '',
            attachments: [],
            attachment: {},
            attachmentIndex: 0,
            prevStats: {},
            currentSlide: 1,
            contentFileId: 0,
            isLoaded: false,
            percentage:0,
            show:[0]
        };
    }
    componentDidMount = () => {
        this.viewBasicApi();
    };

    viewBasicApi = async () => {
        try {
            globalLoader(true);
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: `/get-patient-attachments`,
                body: {
                    patient_content_id: this.props.content.patient_content_id,
                    language_id: this.props.languageId
                }
            };
            let apiRes = await CallApiAsync(obj);

            if (apiRes && apiRes.data.status === 200) {
                if (apiRes.data.data?.attachments.length > 0) {
                    let attachment = apiRes.data.data?.attachments[0];
                    let viewType = attachment.file_type;
                    let contentFileId = 0;
                    if (viewType == PATIENT_CONTENT_TYPES.DECK && attachment.content_files.length > 0) {
                        contentFileId = attachment.content_files[0].content_file_id;
                    }
                    this.setState({ ...this.state, isLoaded: true, viewType: viewType, contentFileId: contentFileId, attachmentIndex: 0, attachment: attachment, prevStats: {} });
                    this.managePatientVisit(attachment, viewType);
                }
                this.setState({ ...this.state, isLoaded: true, attachments: apiRes.data.data.attachments }, () => {
                    globalLoader(false);
                });
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.patientResources, apiRes.data.status.toString()));
                this.setState({ dataArray: [], totalDocument: null }, () => globalLoader(false));
            }
        } catch (error) {
            let errorObject = {
                methodName: "visitRecords/postData",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    };

    saveFile = (attachment,index) => {
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
            this.show(index,1);
            this.state.percentage=10;
            let percentage =0;
            axios.get(`${fileUrl}`, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                     percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                     this.setState({percentage:percentage});
                     console.log(this.state.percentage)
                }
            })
                .then((res) => {
                   this.setState({percentage:percentage});
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

    markFullViewed = () => {
        let prevStats = this.state.prevStats;
        if (prevStats?.isAvailable) {
            prevStats.is_full_viewed = 1;
            this.setState({ prevStats: prevStats });
        }
    }

    getSlides = () => {
        return this.state.attachment.content_files.length > 0 && this.state.attachment.content_files.map((deck, index) => (
            <div className="d-flex justify-content-center" key={index}>
                <div className="inner-img-wrapper justify-content-center align-tems-center">
                    <img src={`${GLOBAL_API}/${deck?.file_path}`} />
                </div>
            </div>
        ))
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
    
    show =(index,val) =>
    {
            this.state.show[index]=val;
    }

    renderAttachmentRow = (attachment, index) => {
        let fileName = '';
        if (attachment.file_type == PATIENT_CONTENT_TYPES.DECK) {
            fileName = this.props.content.content_title;
        } else {
            if (attachment.content_files.length > 0) {
                fileName = attachment.content_files[0].file_name.split(".")[0]
            }
        }
        return (
            <ul className="attch-mod m-0 " key={index}>
                <li className="cursor active" style={this.state.attachmentIndex === index ? { backgroundColor: '#dadada' } : {}} 
                onClick={() => this.setState({ viewType: attachment.file_type, attachmentIndex: index, attachment: attachment }, () => this.sendPatientVisit(attachment, attachment.file_type))} >
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
                        <span onClick={() => this.saveFile(attachment,index) } className="video-download-wrapper cpt-10">
                                 {!this.state.show[index]||(this.state.percentage==100)?<i className="fa fa-arrow-circle-o-down cursor" aria-hidden="true"></i>:
                                 <div className='cpb-10' style={{ width: 30, height: 30 }}>
                                    <CircularProgressbar
                                value={this.state.percentage}
                                strokeWidth={15}
                                /></div>}
                                 </span>      
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

    onSliderChange = (currentSlide) => {
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

    render() {
        const { attachments, attachment, isLoaded } = this.state;
        return (
            <Modal classNames={{ modal: "modal-lg-full  modal-own p-0 modal-patient" }} onClose={() => this.sendPatientVisit(null, null)} open={this.props.openEditUserModal}
                center closeOnOverlayClick={false}>
                <>
                    <div className="row d-flex justify-content-between cpl-10 cpr-10 cpb-10 cpt-10 m-0 attach-mod-hd" >
                        <div className="d-flex w-100">
                            <div >
                                <p className="login-txt mb-0 d-flex align-self-center font-20 primary-color">{this.props.content.content_title}</p>
                                <p className="font-14 m-0 cpb-10 pb-0">{this.props.content.clinician_name} | {this.props.content.organization_name}</p>
                            </div>
                            {this.state.attachment.content_files && this.state.attachment.content_files.length > 0 ?
                                <>
                                    {
                                        this.state.viewType == PATIENT_CONTENT_TYPES.DECK &&
                                        <p className="mb-0 text-right ml-auto" style={{ marginRight: 40, marginTop: 6 }}>{getResourceValue(this.props.resources, "SLIDES")} {this.state.currentSlide} {getResourceValue(this.props.resources, "OF")} {this.state.attachment.content_files.length} </p>
                                    }
                                </> : null
                            }
                        </div>

                    </div>
                    {isLoaded &&
                        <ContentPreviewComponent
                            contentFileId={this.state.contentFileId}
                            contentFiles={attachment.content_files}
                            attachments={attachments}
                            attachment={attachment}
                            {...this.props} />
                    }

                </>
            </Modal>
        );
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(PatientRecords));
