import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from "react-responsive-modal";
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, BUTTON_TYPES, CONSTANTS, STATUS_CODES, GLOBAL_API, resourceGroups , RESOURCE_KEYS } from "../Constants/types";
import AddEditTicket from '../Modals/AddEditSupportTicketModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            records: [],
            resources: [],
        }
    }

    componentDidMount = () => {
        this.ViewRecordsAsync();
    }

    ViewRecordsAsync = async () => {
        try {
            globalLoader(true)
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-user-dashboard',
                body: {
                    groupIds: this.state.resources.length == 0 ? `${resourceGroups.COMMON_GROUP},${resourceGroups.DASHOBOARD_GROUP}` : ``,
                    searchString: "",
                }
            }
            let recordsResult = await CallApiAsync(obj);
            if (recordsResult.data.status === STATUS_CODES.OK) {
                if (recordsResult.data.data?.PageResources && recordsResult.data.data?.PageResources.length > 0 && this.state.resources.length == 0) {
                    let resources = recordsResult.data.data.PageResources;
                    localStorage.setItem("resources", JSON.stringify(resources));
                    this.setState({resources: resources});
                }
                if (recordsResult.data.data) {
                    this.setState({ records: recordsResult.data.data});
                } else {
                    this.setState({records: []});
                }
                globalLoader(false);
            } else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, recordsResult.data.status.toString()));
                globalLoader(false);
            }
        } catch (error) {
            let errorObject = {
                methodName: "Dashboard/ViewRecordsAsync",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    render() {
        return (
          <div>
            <div className="content-container cmb-10 cpb-10 cpl-10 cpt-10">
              <p className="font-20 primary-color">
                {getResourceValue(this.state.resources, "DASHBOARD_HEADER_KEY")}
              </p>
              <ul className="row list-unstyled dashboard-box-list m-0 cpb-20">
                <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
                  <div className="box-wrapper primary-box-light d-flex flex-wrap cmr-10">
                    <div className="icon-wrapper primary-box-dark justify-content-center d-flex flex-wrap align-items-center">
                      <img src="/assets/img/user.png" alt="icon" />
                    </div>
                    <div className="txt-info-wrapper color-white flex-1">
                        <p className="box-txt font-14 mb-0">
                            {this.state.records.Result1Label}
                        </p>
                        <h3 className="box-heading">{this.state.records.Result1}</h3>  
                    </div>
                  </div>
                </li>
                <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
                  <div className="box-wrapper purple-box-light d-flex flex-wrap cmr-10">
                    <div className="icon-wrapper purple-box-dark justify-content-center d-flex flex-wrap align-items-center">
                      <img src="/assets/img/user.png" alt="icon" />
                    </div>
                    <div className="txt-info-wrapper color-white flex-1">
                        <p className="box-txt font-14 mb-0">
                            {this.state.records.Result2Label}
                        </p>
                        <h3 className="box-heading">{this.state.records.Result2}</h3>
                    </div>
                  </div>
                </li>
                <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
                  <div className="box-wrapper green-box-light d-flex flex-wrap cmr-10">
                    <div className="icon-wrapper green-box-dark justify-content-center d-flex flex-wrap align-items-center">
                      <img src="/assets/img/user.png" alt="icon" />
                    </div>
                    <div className="txt-info-wrapper color-white flex-1">
                        <p className="box-txt font-14 mb-0">
                            {this.state.records.Result3Label}
                        </p>
                        <h3 className="box-heading">{this.state.records.Result3}</h3>  
                    </div>
                  </div>
                </li>
                <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
                  <div className="box-wrapper blue-box-light d-flex flex-wrap cmr-10">
                    <div className="icon-wrapper blue-box-dark justify-content-center d-flex flex-wrap align-items-center">
                      <img src="/assets/img/user.png" alt="icon" />
                    </div>
                    <div className="txt-info-wrapper color-white flex-1">
                        <p className="box-txt font-14 mb-0">
                            {this.state.records.Result4Label}
                        </p>
                        <h3 className="box-heading">{this.state.records.Result4}</h3>  
                    </div>
                  </div>
                </li>
                <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
                  <div className="box-wrapper blue-box-light d-flex flex-wrap cmr-10">
                    <div className="icon-wrapper blue-box-dark justify-content-center d-flex flex-wrap align-items-center">
                      <img src="/assets/img/user.png" alt="icon" />
                    </div>
                    <div className="txt-info-wrapper color-white flex-1">
                        <p className="box-txt font-14 mb-0">
                            {this.state.records.Result5Label}
                        </p>
                        <h3 className="box-heading">{this.state.records.Result5}</h3>  
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        );
    };
}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(Dashboard));