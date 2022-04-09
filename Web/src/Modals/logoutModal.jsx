import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
// import {logIn} from './_actions/authActions';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { CallApiAsync, getResourceValue, logOut } from '../Functions/CommonFunctions';
import { API_METHODS,CONSTANTS,STATUS_CODES, resourceGroups } from '../Constants/types';

class logoutModal extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            languageId: props.languageId,
        }
    }

    componentDidMount() {
        this.getResources();
    }


    componentDidUpdate(prevProps) {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getResources() });
        }
    }

    getResources = async () => {
        try {

            globalLoader(true);
            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.COMMON],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);
            if (resourcesResult.data.status === STATUS_CODES.OK) {
                let resources = resourcesResult.data.data.resources;

                this.setState({ resources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, resourcesResult.dadata.status.toString()));
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "logoutModal/getResources",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    logoutUser = async () => {
        this.props.onCloseLogoutModal();
        logOut(this.props.history, '/')
    }


    render() {

        return (
            <div>
                <Modal classNames={{ modal: "modal-lg-fulll modal-own" }} open={this.props.open} onClose={() => this.props.onCloseLogoutModal()} center showCloseIcon={false} closeOnOverlayClick={false} closeIcon={''}>
                    <div className="">
                        <p className="login-txt mb-3 primary-color">{getResourceValue(this.state.resources, "LOGOUT_MSG")}</p>
                    </div>
                    {/* <div className="border-bottom-own col-12 mb-3"></div> */}
                    <div className="btn-wrapper">
                        <button type="button" className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn mr-3 mw-100" onClick={() => this.props.onCloseLogoutModal()}>{getResourceValue(this.state.resources, "CANCEL")}</button>
                        <button type="submit" className="btn full-width-xs btn-own btn-own-primary min-height-btn mw-100" onClick={() => this.logoutUser()}>{getResourceValue(this.state.resources, "LOGOUT").toUpperCase()}</button>
                    </div>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    userDetail: state.user.userDetail,
    orgId: state.user.orgId,
    languageId: state.common.languageId
})

export default connect(mapStateToProps)(withRouter(logoutModal));
