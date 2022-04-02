import { FormControl, InputLabel, MenuItem, Select, TextField } from "@material-ui/core";
import { format } from "date-fns";
import React, { Component } from "react";
import ReactExport from "react-data-export";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { changeOrgId, changeRoleKey, errorLogger, globalAlert, globalLoader } from "../actions/commonActions";
import { API_METHODS, resourceFields, resourceGroups,CONSTANTS, ROLES } from "../Constants/types";
import ChartDashboard from '../Components/ChartDashboardComponent';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from "../Functions/CommonFunctions";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
class SuperAdminDashboard extends Component {
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
      searchContent: "",
      filterFlag: false,
      sortName: "",
      is_sort: false,
      pageSize: 5,
      currentPage: 1,
      totalDocument: null,
      adminResources: [],
      languageId: props.languageId,
      columnArraySuper: [],
    };
  }
  componentDidMount = () => {
    try {
      globalLoader(true);
      changeRoleKey(ROLES.SUPER_ADMIN);
      this.getAdminResources();
      this.viewUserApi();
      this.getSuperadminUsageDetails();
    } catch (error) {
      let errorObject = {
        methodName: "SuperAdminDashboard/componentDidMount",
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
      }  else {
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
        methodName: "SuperAdminDashboard/viewUserApi",
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
  getSuperadminUsageDetails = async () => {
    try {
      globalLoader(true);
      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/superadmin-view-data-usage',
        body: {}
      }
      let superadminDataUsageResult = await CallApiAsync(obj);

      if (superadminDataUsageResult.data.status === 200) {
        this.setState(
          {
            dataUsageDetails: superadminDataUsageResult.data.data.usageDetails,
            totalDocument:
              superadminDataUsageResult?.data?.data?.usageDetails.length,
          },
          () => {
            this.filterSuperadminUsageDetails();
          }
        );
      }else {
        globalAlert(
          CONSTANTS.ERROR,
          getResourceValue(
            this.state.adminResources,
            superadminDataUsageResult.data.status.toString()
          )
        )}
    } catch (error) {
      let errorObject = {
        methodName: "SuperAdminDashboard/getSuperadminUsageDetails",
        errorStake: error.toString(),
        history:this.props.history
      };

      errorLogger(errorObject);
    }
  };
  filterSuperadminUsageDetails = async (searchVisit = 0) => {
    try {
      globalLoader(true);
      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/superadmin-view-data-usage',
        body: {}
      }
      let usageData = this.state.dataUsageDetails.map((item) => {
        return Object.assign({}, item);
      });
      let searchFlag = 0;
      if (this.state.formattedStartDate || this.state.formattedEndDate) {
        obj.body.start_date = this.state.formattedStartDate;
        obj.body.end_date = this.state.formattedEndDate;
        searchFlag += 1;

        let superadminDataUsageResult = await CallApiAsync(obj);

        if (superadminDataUsageResult.data.status === 200) {
          let dataResult = superadminDataUsageResult?.data?.data?.usageDetails;
          usageData = dataResult.map((item) => {
            return Object.assign({}, item);
          });
        } else  {
          usageData = [];
        }
      }
      let filteredData = usageData;
      if (this.state.searchContent) {
        searchFlag += 1;
        filteredData = filteredData.filter((e) =>
          e.content_title
            .toLowerCase()
            .includes(this.state.searchContent.toLowerCase())
        );
      }
      if (this.state.searchOrg) {
        searchFlag += 1;
        filteredData = filteredData.filter((e) => {
          return e.organization_name
            .toLowerCase()
            .includes(this.state.searchOrg.toLowerCase());
        });
      }
      this.setState({ filteredDataUsage: filteredData });

      if (searchVisit == 1) {
        this.setState({ filterFlag: true });
      }
      globalLoader(false);
    } catch (error) {
      let errorObject = {
        methodName: "SuperAdminDashboard/filterSuperadminUsageDetails",
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
      let resourcesResult = await CallApiAsync(obj)
      if (resourcesResult.data.status === 200) {
        let adminResources = resourcesResult.data.data.resources;
        this.setState({ adminResources });
      } else {
        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
      }
      let columnArraySuper = [
        {
          databaseColumn: "content_title",
          columnName: getResourceValue(
            this.state.adminResources,
            "CONTENT_TITLE"
          ),
          isSort: true,
          width: "20%",
        },
        {
          databaseColumn: "organization_name",
          columnName: getResourceValue(
            this.state.adminResources,
            "ORGANIZATION"
          ),
          isSort: true,
          width: "20%",
        },
        {
          databaseColumn: "sent_to_count",
          columnName: getResourceValue(
            this.state.adminResources,
            "USERS_SENT_TO"
          ),
          isSort: true,
          width: "15%",
        },
        {
          databaseColumn: "read_count",
          columnName: getResourceValue(
            this.state.adminResources,
            "USERS_READ_IT"
          ),
          isSort: true,
          width: "15%",
        },
      ];
      this.setState({
        columnArraySuper: columnArraySuper,
      });
      globalLoader(false);
    } catch (error) {
      let errorObject = {
        methodName: "SuperAdminDashboard/getAdminResources",
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
          <p className="font-20 primary-color">
            {getResourceValue(this.state.adminResources, "INFO_LABEL")}
          </p>
          <div className="form-group-icon form-group">
            <div className="row m-0">
              <FormControl
                variant="outlined"
                className="col-6 cpr-10"
              >
                <InputLabel id="organisation-label">
                  {getResourceValue(this.state.adminResources, "ORGANIZATIONS")}
                </InputLabel>

                <Select
                  labelId="organisation-label"
                  value={this.state.selectedOrg}
                  onChange={(ev) => this.changeOrganisation(ev.target.value)}
                  label={getResourceValue(
                    this.state.adminResources,
                    "ORGANIZATIONS"
                  )}
                  name="organization"
                >
                  <MenuItem value={0} key={"nil"}>
                    {getResourceValue(this.state.adminResources, "ALL")}
                  </MenuItem>

                  {this.state.organisations &&
                    this.state.organisations.length > 0 &&
                    this.state.organisations.map((org, index) => (
                      <MenuItem value={org.organization_id} key={index}>
                        {org.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <ul className="row list-unstyled dashboard-box-list m-0 cpb-20">
            <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
              <div className="box-wrapper primary-box-light d-flex flex-wrap cmr-10">
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
            <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
              <div className="box-wrapper purple-box-light d-flex flex-wrap cmr-10">
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
            <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
              <div className="box-wrapper green-box-light d-flex flex-wrap cmr-10">
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
            <li className="col-md-3 col-sm-6 col-12 m-0 p-0">
              <div className="box-wrapper blue-box-light d-flex flex-wrap cmr-10">
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
          <p className="font-20 primary-color">
            {getResourceValue(this.state.adminResources, "USAGE_LABEL")}
          </p>
          {this.state.filteredDataUsage.length < 1 &&
            this.state.filterFlag == false ? (
            <div className="no-table-data cmt-10">
              {getResourceValue(this.state.adminResources, "NO_RECORDS")}
            </div>
          ) : (
            <>
              <form className="form-own mb-10" noValidate autoComplete="off">
                <div className="row dashUserInoFields m-0 p-0">
                  <div className="col-md-10 m-0 p-0">
                    <div className="row m-0 p-0">
                      <div className="col-12 col-md-3 m-0 p-0">
                        <div className="position-relative">
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
                            name="contentName"
                            onChange={(ev) =>
                              this.setState({
                                searchContent: ev.target.value,
                              })
                            }
                            value={this.state.searchContent}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-3 m-0 p-0">
                        <div className="position-relative cml-10">
                          <TextField
                            label={getResourceValue(
                              this.state.adminResources,
                              "ORGANIZATION"
                            )}
                            placeholder={getResourceValue(
                              this.state.adminResources,
                              "ORGANIZATION",
                              resourceFields.Placeholder
                            )}
                            className="mt-0 mb-0 d-flex"
                            margin="normal"
                            variant="outlined"
                            name="organization"
                            onChange={(ev) =>
                              this.setState({
                                searchOrg: ev.target.value,
                              })
                            }
                            value={this.state.searchOrg}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-3 m-0 p-0 media-datepicker">
                        <div className="position-relative datepicker-form-group cml-10">
                          <div
                            className={`own-custom-label ${this.state.valueInStartDate ? "active" : ""
                              }`}
                            style={{ top: 11 }}
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
                        <div className="position-relative datepicker-form-group cml-10">
                          <div
                            className={`own-custom-label ${this.state.valueInEndDate ? "active" : ""
                              }`}
                            style={{ top: 11 }}
                          >
                            {" "}
                            {getResourceValue(
                              this.state.adminResources,
                              "TO_DATE"
                            )}{" "}
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
                      <div className="position-relative cml-10 cmr-10">
                        <button
                          type="button"
                          onClick={() => this.filterSuperadminUsageDetails(1)}
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
              <div className="cmt-10 dashboard-table">
                <CustomTableComponent
                  resources={this.state.adminResources}
                  dataArray={this.state.filteredDataUsage}
                  showFilter={false}
                  showCheckbox={false}
                  showTitle={false}
                  showSearchBar={false}
                  showNavigation={false}
                  columnArray={this.state.columnArraySuper}
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
                            className="btn btn-own btn-own-primary w-100"
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
                          name="SuperadmnUsage"
                        >
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
                              "ORGANIZATION"
                            )}
                            value={(col) =>
                              col.organization_name
                                ? col.organization_name
                                : getResourceValue(
                                  this.state.adminResources,
                                  "NA"
                                )
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "USERS_SENT_TO"
                            )}
                            value={(col) =>
                              col.sent_to_count ? col.sent_to_count : 0
                            }
                          />
                          <ExcelColumn
                            label={getResourceValue(
                              this.state.adminResources,
                              "USERS_READ_IT"
                            )}
                            value={(col) =>
                              col.read_count ? col.read_count : 0
                            }
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

export default connect(mapStateToProps)(withRouter(SuperAdminDashboard));
