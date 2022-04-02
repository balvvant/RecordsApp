import { TextField } from "@material-ui/core";
import { format } from "date-fns";
import React, { Component } from "react";
import ReactExport from "react-data-export";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { changeOrgId, changeRoleKey, errorLogger, globalAlert, globalLoader } from "../actions/commonActions";
import { API_METHODS, CONSTANTS, resourceFields, resourceGroups, ROLES } from "../Constants/types";
import ChartDashboard from "../Components/ChartDashboardComponent";
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, formatNHSNumber, getResourceValue } from "../Functions/CommonFunctions";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: 0,
      admin: 0,
      doctor: 0,
      patient: 0,
      inactiveUsers: 0,
      organisations: [],
      selectedOrg: 0,
      valueInStartDate: false,
      valueInEndDate: false,
      startDate: null,
      formattedStartDate: null,
      formattedEndDate: null,
      endDate: null,
      dataUsageDetails: [],
      filteredDataUsage: [],
      searchPatient: "",
      searchContent: "",
      filterFlag: false,
      sortName: "",
      is_sort: false,
      pageSize: 5,
      currentPage: 1,
      totalDocument: null,
      adminResources: [],
      languageId: props.languageId,
      columnArrayAdmin: [],
    };
  }
  componentDidMount = () => {
    try {
      globalLoader(true);
      changeRoleKey(ROLES.ADMIN);
      let orgId = 0;
      this.getAdminResources();
      this.setState({ selectedOrg: orgId }, () => {
        this.viewUserApi();
        this.getAdminUsagesDetails();
      });
    } catch (error) {
      let errorObject = {
        methodName: "AdminDashboard/componentDidMount",
        errorStake: error.toString(),
        history:this.props.history
      };
      errorLogger(errorObject);
    }
  };
  componentDidUpdate = () => {
    const { languageId } = this.props;
    if (languageId !== this.state.languageId) {
      this.setState({ languageId: languageId }, () => {
        this.getAdminResources();
      });
    }
  };
  viewUserApi = async () => {
    try {
      globalLoader(true);
      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/view-dashboard',
        body: {
          orgId: this.state.selectedOrg,
        }
      }
      let dashboardStatsResult = await CallApiAsync(obj);
      if (dashboardStatsResult.data.status === 200) {
        if (dashboardStatsResult.data.data.user_organization) {
          changeOrgId(dashboardStatsResult.data.data.user_organization);
          localStorage.setItem(
            "org",
            JSON.stringify(dashboardStatsResult.data.data.user_organization)
          );
        }
        if (dashboardStatsResult.data.data.organizations.length > 0) {
          this.setState({
            organisations: dashboardStatsResult.data.data.organizations,
          });
        }
        this.setState(
          {
            users: dashboardStatsResult.data.data.users.total,
            admin: dashboardStatsResult.data.data.users.admins,
            doctor: dashboardStatsResult.data.data.users.docs,
            patient: dashboardStatsResult.data.data.users.patients,
            inactiveUsers: dashboardStatsResult.data.data.users.inactiveUsers,
          },
          () => {
            globalLoader(false);
          }
        );
      } else {
        globalAlert(
          CONSTANTS.ERROR,
          getResourceValue(
            this.state.adminResources,
            dashboardStatsResult.data.status.toString()
          )
        );
        this.setState(
          {
            users: 0,
            admin: 0,
            doctor: 0,
            patient: 0,
            inactiveUsers: 0,
          },
          () => {
            globalLoader(false);
          }
        );
      }
    } catch (error) {
      let errorObject = {
        methodName: "AdminDashboard/viewUserApi",
        errorStake: error.toString(),
        history:this.props.history
      };
      errorLogger(errorObject);
    }
  };
  changeOrganisation = (orgId) => {
    this.setState({ selectedOrg: orgId }, () => {
      this.viewUserApi();
    });
  };
  datePickerClicked = () => {
    if (this.props.currentAction !== "manageUser") {
      this.setState({
        valueInDate: true,
      });
    }
  };
  datePickerValue = () => {
    if (!this.state.startDate) {
      this.setState({
        valueInDate: false,
      });
    }
  };
  dateChange = (date) => {
    this.setState({
      startDate: date,
    });
  };
  getAdminUsagesDetails = async () => {
    try {
      globalLoader(true);
      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/admin-view-data-usage',
        body: {
          orgId: this.state.selectedOrg,
        }
      }
      let adminDataUsageResult = await CallApiAsync(obj);
      if (adminDataUsageResult.data.status === 200) {
        this.setState(
          {
            dataUsageDetails: adminDataUsageResult?.data?.data?.usageDetails,
            totalDocument:
              adminDataUsageResult?.data?.data?.usageDetails.length,
          },
          () => {
            this.filterAdminUsagesDetails();
          }
        );
      }else{
        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, adminDataUsageResult.data.status.toString()));

      }
    } catch (error) {
      let errorObject = {
        methodName: "AdminDashboard/getAdminUsagesDetails",
        errorStake: error.toString(),
        history:this.props.history
      };
      errorLogger(errorObject);
    }
  };
  filterAdminUsagesDetails = (searchVisit = 0) => {
    try {
      globalLoader(true);
      let usageData = this.state.dataUsageDetails.map((item) => {
        return Object.assign({}, item);
      });
      let searchFlag = 0;
      let filteredData = usageData;
      if (this.state.searchPatient) {
        searchFlag += 1;
        filteredData = filteredData.filter((e) => {
          return e.patient_name
            .toLowerCase()
            .includes(this.state.searchPatient.toLowerCase());
        });
      }
      if (this.state.searchContent) {
        searchFlag += 1;
        filteredData = filteredData.filter((e) =>
          e.content_title
            .toLowerCase()
            .includes(this.state.searchContent.toLowerCase())
        );
      }
      if (this.state.startDate) {
        searchFlag += 1;
        filteredData = filteredData.filter((e) => {
          var date = new Date(e.sent_time);
          var day = ("0" + date.getDate()).slice(-2);
          var month = ("0" + (date.getMonth() + 1)).slice(-2);
          var year = date.getFullYear();
          let sentTimeDate = year + "-" + month + "-" + day;
          return sentTimeDate >= this.state.formattedStartDate;
        });
      }
      if (this.state.endDate) {
        searchFlag += 1;
        filteredData = filteredData.filter((e) => {
          var date = new Date(e.sent_time);
          var day = ("0" + date.getDate()).slice(-2);
          var month = ("0" + (date.getMonth() + 1)).slice(-2);
          var year = date.getFullYear();
          let sentTimeDate = year + "-" + month + "-" + day;
          return sentTimeDate <= this.state.formattedEndDate;
        });
      }
      let tempArray = [];
      if (filteredData) {
        for (let data of filteredData) {
          let newData = data;
          newData.sent_time = this.getLocalTime(data.sent_time);
          newData.first_time_opened = this.getLocalTime(data.first_time_opened);
          newData.time_spent = data.time_spent
            ? new Date(1000 * data.time_spent).toISOString().substr(11, 8)
            : "00:00:00";
          newData.nhs_number = formatNHSNumber(data.nhs_number);
          tempArray.push(newData);
        }
      }
      this.setState({ filteredDataUsage: tempArray });
      if (searchVisit == 1) {
        this.setState({ filterFlag: true });
      }
      globalLoader(false);
    } catch (error) {
      let errorObject = {
        methodName: "AdminDashboard/filterAdminUsagesDetails",
        errorStake: error.toString(),
        history:this.props.history
      };
      errorLogger(errorObject);
    }
  };
  checkSort = (val) => {
    this.setState({
      sortName: val,
      is_sort: !this.state.is_sort,
    });
  };
  compare = (a, b) => {
    let sortName = this.state.sortName;
    if (a[sortName] == undefined || b[sortName] == undefined) {
      return a[sortName] == undefined
        ? this.state.is_sort
          ? -1
          : 1
        : this.state.is_sort
          ? 1
          : -1;
    } else {
      return a[sortName] < b[sortName]
        ? !this.state.is_sort
          ? 1
          : -1
        : !this.state.is_sort
          ? -1
          : 1;
    }
  };
  handleDateChangeRaw = (e) => {
    e.preventDefault();
  };
  getLocalTime = (utcDate) => {
    let result = getResourceValue(this.state.adminResources, "NA");

    if (utcDate) {
      let localDate = utcDate.slice(0, 16).replace("T", " ");
      //format the date
      let dateTimeArray = localDate.split(" ");
      let dateArray = dateTimeArray[0].split("-");
      result =
        dateArray[2] +
        "-" +
        dateArray[1] +
        "-" +
        dateArray[0] +
        " " +
        dateTimeArray[1];
    }
    return result;
  };
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
          group_id: [
            resourceGroups.ADMIN_DASHBOARD,
            resourceGroups.FEATURE_MENU,
            resourceGroups.UPLOAD_MEDIA,
          ],
          common: true,
        }
      };
      let resourcesResult = await CallApiAsync(obj);
      if (resourcesResult.data.status === 200) {
        let adminResources = resourcesResult.data.data.resources;

        this.setState({ adminResources });
      } else {
        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
      }
      let columnArrayAdmin = [
        {
          databaseColumn: "patient_name",
          columnName: getResourceValue(this.state.adminResources, "PATIENT"),
          isSort: true,
        },
        {
          databaseColumn: "nhs_number",
          columnName: getResourceValue(this.state.adminResources, "NHS_NUMBER"),
          isSort: true,
        },
        {
          databaseColumn: "content_title",
          columnName: getResourceValue(
            this.state.adminResources,
            "CONTENT_TITLE"
          ),
          isSort: true,
        },
        {
          databaseColumn: "sent_time",
          columnName: getResourceValue(this.state.adminResources, "DATE_SENT"),
          isSort: true,
        },
        {
          databaseColumn: "first_time_opened",
          columnName: getResourceValue(
            this.state.adminResources,
            "DATE_FIRST_OPENED"
          ),
          isSort: true,
        },
        {
          databaseColumn: "clinician_name",
          columnName: getResourceValue(this.state.adminResources, "SENT_BY"),
          isSort: true,
        },
        {
          databaseColumn: "total_visited_count",
          columnName: getResourceValue(
            this.state.adminResources,
            "NO_OF_TIMES_OPENED"
          ),
          isSort: true,
          width: "10%",
        },
        {
          databaseColumn: "completed_count",
          tooltip: getResourceValue(this.state.adminResources, "COMPLETED"),
          columnName: getResourceValue(
            this.state.adminResources,
            "NO_OF_TIMES_COMPLETED"
          ),
          isSort: true,
          width: "20%",
        },
        {
          databaseColumn: "time_spent",
          tooltip: getResourceValue(this.state.adminResources, "TOTAL_TIME"),
          columnName: getResourceValue(
            this.state.adminResources,
            "TOTAL_TIME_VIEWED"
          ),
          isSort: true,
          width: "30%",
        },
      ];
      this.setState({
        columnArrayAdmin: columnArrayAdmin,
      });
      globalLoader(false);
    } catch (error) {
      let errorObject = {
        methodName: "AdminDashboard/getAdminResources",
        errorStake: error.toString(),
        history:this.props.history
      };
      errorLogger(errorObject);
    }
  };
  render() {
    return (
      <div>
        <div className="content-container cmb-10 cpb-10 cpl-10 cpt-10">
          <h2 className="font-20 pb-3 primary-color">
            {getResourceValue(this.state.adminResources, "INFO_LABEL")}
          </h2>
          <ul className="row list-unstyled dashboard-box-list mb-0 cpr-10">
            <li className="col-md-3 col-sm-6 col-12 mb-3">
              <div className="box-wrapper primary-box-light d-flex flex-wrap">
                <div className="icon-wrapper primary-box-dark justify-content-center d-flex flex-wrap align-items-center">
                  <img src="/assets/img/user.png" alt="icon" />
                </div>
                <div className="txt-info-wrapper color-white flex-1">
                  <h3 className="box-heading">{this.state.users}</h3>
                  <p className="box-txt font-14 mb-0">
                    {getResourceValue(this.state.adminResources, "TOTAL")}
                  </p>
                </div>
              </div>
            </li>
            <li className="col-md-3 col-sm-6 col-12 mb-3">
              <div className="box-wrapper purple-box-light d-flex flex-wrap">
                <div className="icon-wrapper purple-box-dark justify-content-center d-flex flex-wrap align-items-center">
                  <img src="/assets/img/user.png" alt="icon" />
                </div>
                <div className="txt-info-wrapper color-white flex-1">
                  <h3 className="box-heading">{this.state.admin}</h3>
                  <p className="box-txt font-14 mb-0">
                    {getResourceValue(this.state.adminResources, "ADMIN")}
                  </p>
                </div>
              </div>
            </li>
            <li className="col-md-3 col-sm-6 col-12 mb-3">
              <div className="box-wrapper green-box-light d-flex flex-wrap">
                <div className="icon-wrapper green-box-dark justify-content-center d-flex flex-wrap align-items-center">
                  <img src="/assets/img/user.png" alt="icon" />
                </div>
                <div className="txt-info-wrapper color-white flex-1">
                  <h3 className="box-heading">{this.state.doctor}</h3>
                  <p className="box-txt font-14 mb-0">
                    {getResourceValue(this.state.adminResources, "DOCTOR")}
                  </p>
                </div>
              </div>
            </li>
            <li className="col-md-3 col-sm-6 col-12 mb-3">
              <div className="box-wrapper blue-box-light d-flex flex-wrap">
                <div className="icon-wrapper blue-box-dark justify-content-center d-flex flex-wrap align-items-center">
                  <img src="/assets/img/user.png" alt="icon" />
                </div>
                <div className="txt-info-wrapper color-white flex-1">
                  <h3 className="box-heading">{this.state.patient}</h3>
                  <p className="box-txt font-14 mb-0">
                    {getResourceValue(this.state.adminResources, "PATIENT")}
                  </p>
                </div>
              </div>
            </li>
          </ul>
          <ChartDashboard chartData={{ adminResources: this.state.adminResources, admin: this.state.admin, doctor: this.state.doctor, patient: this.state.patient, users: this.state.users, inactiveUsers: this.state.inactiveUsers }} />
        </div>
        <div className="content-container cpl-10 cpt-10 cmb-10 cpb-10 cpr-10">
          <h2 className="font-20 mb-10 primary-color">
            {getResourceValue(this.state.adminResources, "USAGE_LABEL")}
          </h2>
          {this.state.filteredDataUsage.length < 1 &&
            this.state.filterFlag == false ? (
            <div className="no-table-data">
              {getResourceValue(this.state.adminResources, "NO_RECORDS")}
            </div>
          ) : (
            <>
              <form className="form-own mb-10" noValidate autoComplete="off">
                <div className="row m-0 p-0">
                  <div className="col-md-10 m-0 p-0">
                    <div className="row m-0 p-0">
                      <div className="col-12 col-md-3 m-0 p-0">
                        <div className="position-relative">
                          <TextField
                            label={getResourceValue(
                              this.state.adminResources,
                              "PATIENT"
                            )}
                            placeholder={getResourceValue(
                              this.state.adminResources,
                              "PATIENT",
                              resourceFields.Placeholder
                            )}
                            className="mt-0 mb-0 d-flex"
                            margin="normal"
                            variant="outlined"
                            name="patientName"
                            onChange={(ev) =>
                              this.setState({ searchPatient: ev.target.value })
                            }
                            value={this.state.searchPatient}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-3 m-0 p-0">
                        <div className="position-relative ml-10">
                          <TextField
                            label={getResourceValue(
                              this.state.adminResources,
                              "CONTENT_TITLE"
                            )}
                            placeholder={getResourceValue(
                              this.state.adminResources,
                              "CONTENT_TITLE",
                              resourceFields.Placeholder
                            )}
                            className="mt-0 mb-0 d-flex"
                            margin="normal"
                            variant="outlined"
                            name="ContentName"
                            onChange={(ev) =>
                              this.setState({ searchContent: ev.target.value })
                            }
                            value={this.state.searchContent}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-3 m-0 p-0 media-datepicker">
                        <div className="position-relative datepicker-form-group ml-10">
                          <div
                            className={`own-custom-label ${this.state.valueInStartDate ? "active" : ""
                              }`}
                          >
                            {getResourceValue(
                              this.state.adminResources,
                              "FROM_DATE"
                            )}
                          </div>
                          <div
                            onClick={() =>
                              this.setState({ valueInStartDate: true })
                            }
                          >
                            <DatePicker
                              selected={this.state.startDate}
                              onChange={(date) =>
                                this.setState({
                                  startDate: date,
                                  formattedStartDate: format(
                                    date,
                                    "yyyy-MM-dd"
                                  ),
                                })
                              }
                              onClickOutside={this.datePickerValue}
                              dateFormat="dd-MM-yyyy"
                              maxDate={
                                this.state.endDate
                                  ? new Date(this.state.endDate)
                                  : new Date()
                              }
                              onChangeRaw={this.handleDateChangeRaw}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-3 m-0 p-0 media-datepicker">
                        <div className="position-relative datepicker-form-group ml-10">
                          <div
                            className={`own-custom-label ${this.state.valueInEndDate ? "active" : ""
                              }`}
                          >
                            {getResourceValue(
                              this.state.adminResources,
                              "TO_DATE"
                            )}
                          </div>
                          <div
                            onClick={() =>
                              this.setState({ valueInEndDate: true })
                            }
                          >
                            <DatePicker
                              selected={this.state.endDate}
                              onChange={(date) =>
                                this.setState({
                                  endDate: date,
                                  formattedEndDate: format(date, "yyyy-MM-dd"),
                                })
                              }
                              onClickOutside={this.datePickerValue}
                              dateFormat="dd-MM-yyyy"
                              minDate={
                                this.state.startDate
                                  ? new Date(this.state.startDate)
                                  : null
                              }
                              maxDate={new Date()}
                              onChangeRaw={this.handleDateChangeRaw}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2 m-0 p-0">
                    <div className="col-md-12 m-0 p-0">
                      <div className="position-relative ml-10 mr-10">
                        <button
                          type="button"
                          onClick={() => this.filterAdminUsagesDetails(1)}
                          className="btn btn-own btn-own-primary min-height-btn mw-100"
                        >
                          {getResourceValue(
                            this.state.adminResources,
                            "SEARCH"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div className="dashboard-table mb-10">
                <CustomTableComponent
                  resources={this.state.adminResources}
                  dataArray={this.state.filteredDataUsage}
                  showFilter={false}
                  showCheckbox={false}
                  showTitle={false}
                  showSearchBar={false}
                  showNavigation={false}
                  columnArray={this.state.columnArrayAdmin}
                  sortObj={{
                    sortVal: this.state.sortName,
                    sortType: this.state.is_sort,
                  }}
                  sortingTable={this.checkSort}
                />
                <div className="col-md-12">
                  <div className="row justify-content-end cpt-10">
                    <div className="form-group-icon position-relative form-group mb-0">
                      <ExcelFile
                        filename={"UsageInformation"}
                        element={
                          <button
                            type="button"
                            className="btn btn-own btn-own-primary mw-100"
                          >
                            {getResourceValue(
                              this.state.adminResources,
                              "EXPORT"
                            )}
                          </button>
                        }
                      >
                        <ExcelSheet
                          data={this.state.filteredDataUsage}
                          name="AdmnUsage"
                        >
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "PATIENT"
                            )}
                            value={(col) =>
                              col.patient_name
                                ? col.patient_name
                                : getResourceValue(
                                  this.state.adminResources,
                                  "NA"
                                )
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "NHS_NUMBER"
                            )}
                            value={(col) =>
                              col.nhs_number
                                ? col.nhs_number
                                : getResourceValue(
                                  this.state.adminResources,
                                  "NA"
                                )
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "CONTENT_TITLE"
                            )}
                            value={(col) =>
                              col.content_title
                                ? col.content_title
                                : getResourceValue(
                                  this.state.adminResources,
                                  "NA"
                                )
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "DATE_SENT"
                            )}
                            value={(col) =>
                              col.sent_time
                                ? col.sent_time
                                : getResourceValue(
                                  this.state.adminResources,
                                  "NA"
                                )
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "DATE_FIRST_OPENED"
                            )}
                            value={(col) =>
                              col.first_time_opened
                                ? col.first_time_opened
                                : getResourceValue(
                                  this.state.adminResources,
                                  "NA"
                                )
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "SENT_BY"
                            )}
                            value={(col) =>
                              col.clinician_name
                                ? col.clinician_name
                                : getResourceValue(
                                  this.state.adminResources,
                                  "NA"
                                )
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "NO_OF_TIMES_OPENED"
                            )}
                            value={(col) =>
                              col.opened_count ? col.opened_count : 0
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "NO_OF_TIMES_COMPLETED"
                            )}
                            value={(col) =>
                              col.completed_count ? col.completed_count : 0
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "TOTAL_TIME_VIEWED"
                            )}
                            value={(col) => col.total_time_viewed}
                          />
                        </ExcelSheet>
                      </ExcelFile>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  userData: state.user.userData,
  orgId: state.user.orgId,
  languageId: state.common.languageId,
});
export default connect(mapStateToProps)(withRouter(AdminDashboard));
