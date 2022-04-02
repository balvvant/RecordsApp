import { FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select } from "@material-ui/core";
import format from 'date-fns/format';
import React from "react";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { changeRoleKey, errorLogger, globalAlert, globalLoader, updateOptOut } from "../actions/commonActions";
import { API_METHODS, OptOutStatus, PAGE_ENTRY_SIZE, resourceGroups,  CONSTANTS ,ROLES } from "../Constants/types";
import { CallApiAsync, getResourceValue } from "../Functions/CommonFunctions";
import PatientRecords from "../Components/PatientRecordsComponent";

class PatientDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageSize: 25,
      currentPage: 1,
      searchVal: "",
      sortColName: "",
      sortType: false,
      dataArray: [],
      totalUserId: [],
      allChecked: false,
      currentUserId: null,
      checkedUserInfo: false,
      totalDocument: 0,
      visitTitle: "",
      url: null,
      videoModalOpen: false,
      deleteModalOpen: false,
      currentTabActive: "visit-records",
      tabArray: [{ name: "VISIT_RECORDS", val: "dashboard" }],
      viewStartTime: null,
      patientDeckId: null,
      isFullViewed: 0,
      languageId: props.languageId,
      patientResources: [],
      userOptOut: null,
      optOutDate: null,
      unreadFlag: false,
      unreadCheckbox: false,
      openEditUserModal: false,
      cureentUserId: null,
      content: {}
    };
  }
  componentDidMount = () => {
    // this.viewBasicApi();
    changeRoleKey(ROLES.PATIENT)
    this.getDashboardResources();
  };

  componentDidUpdate = () => {
    const { languageId } = this.props;
    if (languageId !== this.state.languageId) {
      this.setState({ languageId: languageId }, () => { this.getDashboardResources() });
    }
  }

  getDashboardResources = async () => {
    try {
      globalLoader(true);
      //get language data
      let languageId = this.state.languageId;

      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/get-page-resources',
        body: {
          group_id: [resourceGroups.PATIENT_DASHBOARD, resourceGroups.COMMON]
        }
      }
      let resourcesResult = await CallApiAsync(obj);

      if (resourcesResult.data.status === 200) {
        let patientResources = resourcesResult.data.data.resources;

        this.setState({ patientResources });

      }
      else {
        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.patientResources, resourcesResult.data.status.toString()));
      }

      this.viewBasicApi();
    }
    catch (error) {
      let errorObject = {
        methodName: "patient/PatientDashboard/getDashboardResources",
        errorStake: error.toString(),
        history:this.props.history
      };
      errorLogger(errorObject);
    }
  }

  setcurrentTabActive = (tab) => {
    this.props.history.push(`/${tab}`);
    this.setState({
      currentTabActive: tab,
    });
  };

  viewBasicApi = async () => {
    try {
      globalLoader(true);
      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/view-patient-records',
        body: {
          view_records: this.state.pageSize,
          view_page: this.state.currentPage,
          search_string: this.state.searchVal && this.state.searchVal,
          sort_col_name: this.state.sortColName && this.state.sortColName,
          sort_col_type: this.state.sortType ? "ASC" : "DESC",
          language_id: this.state.languageId
        }
      };
      let apiRes = await CallApiAsync(obj);

      if (apiRes && apiRes.data?.data) {
        updateOptOut(apiRes.data.data.optOutStatus);
        localStorage.setItem('optOutStatus', apiRes.data.data.optOutStatus);

        this.setState({
          userOptOut: apiRes.data.data.optOutStatus,
          optOutDate: apiRes.data.data.optOutDate,
        })
      }

      if (apiRes && apiRes.data?.status === 200) {
        let patientRecords = apiRes.data.data.patient_records ? apiRes.data.data.patient_records : [];
        this.checkForUnread(patientRecords);
        this.setState({ dataArray: patientRecords, totalDocument: apiRes.data.data.totalCount }, () => { globalLoader(false) });
      } else {
        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.patientResources, apiRes.data.status.toString()));
        this.setState({ dataArray: [], totalDocument: 0 }, () => { globalLoader(false) });
      }
      globalLoader(false);
    } catch (error) {
      let errorObject = {
        methodName: "patient/PatientDashboard/viewBasicApi",
        errorStake: error.toString(),
        history:this.props.history
      };

      errorLogger(errorObject);
    }
  };

  reloadData = () => {
    this.viewBasicApi();
  }

  checkForUnread = (patientRecords) => {
    if (patientRecords.length > 0) {
      let unreadItems = 0;

      patientRecords.map(data => {

        data.received_items && data.received_items.length > 0 && data.received_items.map(record => {
          if (!record.last_opened) {
            unreadItems += 1;
          }
        });
      });

      if (unreadItems > 0) {
        this.setState({ unreadCheckbox: true });
      }
    }
  }

  sortingTable = (val) => {
    if (val === this.state.sortColName) {
      this.setState(
        (prevState) => ({
          sortType: !prevState.sortType,
          currentPage: 1,
        }),
        () => {
          this.viewBasicApi();
        }
      );
    } else {
      this.setState(
        {
          sortColName: val,
          sortType: true,
          currentPage: 1,
        },
        () => {
          this.viewBasicApi();
        }
      );
    }
  };

  changePageSize = (ev) => {
    this.setState(
      {
        [ev.target.name]: ev.target.value,
        currentPage: 1,
      },
      () => {
        this.viewBasicApi();
      }
    );
  };

  resetApiVal = () => {
    this.setState(
      {
        pageSize: 25,
        currentPage: 1,
        searchVal: "",
        sortColName: "",
        sortType: true,
      },
      () => {
        this.viewBasicApi();
      }
    );
  };

  goToPage = (ev, val) => {
    try {
      if (ev) {
        this.setState(
          {
            currentPage: ev.target.value,
          },
          () => {
            this.viewBasicApi();
          }
        );
      } else {
        if (val === "next") {
          this.setState(
            (prevState) => ({
              currentPage: prevState.currentPage + 1,
            }),
            () => {
              this.viewBasicApi();
            }
          );
        } else if (val === "prev") {
          this.setState(
            (prevState) => ({
              currentPage: prevState.currentPage - 1,
            }),
            () => {
              this.viewBasicApi();
            }
          );
        }
      }
    } catch (error) {
      let errorObject = {
        methodName: "patient/PatientDashboard/goToPage",
        errorStake: error.toString(),
        history:this.props.history
      };

      errorLogger(errorObject);
    }
  };
  changeValue = (ev) => {
    this.setState({
      [ev.target.name]: ev.target.value,
    });
  };
  searchFilter = (ev) => {
    ev.preventDefault();

    this.viewBasicApi();
  };

  openVideo = (patient_deck_id, url, title) => {
    this.setState(
      {
        patientDeckId: patient_deck_id,
        url: url,
        visitTitle: title,
        isFullViewed: 0
      },
      () => {
        this.setState({
          viewStartTime: new Date(),
          videoModalOpen: true,
        });
      }
    );
  };
  closeVideoModal = () => {
    this.setState(
      {
        url: null,
        visitTitle: "",
      },
      () => {
        this.sendPatientVisit();
        this.setState({ videoModalOpen: false, });
      }
    );
  };

  sendPatientVisit = async () => {
    try {
      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/add-patient-visit',
        body: {
          time_spent: (new Date().getTime() - this.state.viewStartTime.getTime()) / 1000,
          is_full_viewed: this.state.isFullViewed,
          patient_deck_id: this.state.patientDeckId
        }
      };
      await CallApiAsync(obj);
      this.reloadData();
    } catch (error) {
      let errorObject = {
        method: 'PatientDashboard/sendPatientVisit',
        errorStake: error.toString(),
        history:this.props.history
      }
      errorLogger(errorObject);
    }
  }

  openDeleteRecordsModal = (id, title) => {
    try {
      let localIds = [...this.state.totalUserId];
      localIds.push(id);
      this.setState(
        {
          visitTitle: title,
          totalUserId: localIds,
        },
        () => {
          this.setState({
            deleteModalOpen: true,
          });
        }
      );
    } catch (error) {
      let errorObject = {
        methodName: "patient/PatientDashboard/openDeleteRecordsModal",
        errorStake: error.toString(),
        history:this.props.history
      };

      errorLogger(errorObject);
    }
  };
  closeDeleteRecordsModal = async (val) => {
    if (val) {
      let res = await this.deleteRecordsApi();
      if (res) {
        this.setState(
          {
            deleteModalOpen: false,
          },
          () => {
            this.viewBasicApi();
          }
        );
      }
    } else {
      this.setState({
        deleteModalOpen: false,
      });
    }
  };

  getPatientVisitRow = (item, index) => {
    return (
      <div className="row mx-0 pd-table-row" key={index} onClick={() => { this.openEditUserModalFunc(item) }}>
        <div className="col-md-9 px-0 attachment-margin">
          <div>
            <p className="pd-row-title">{item.content_title}</p>
            <p className="pd-doc-org">{item.clinician_name ? item.clinician_name : getResourceValue(this.state.patientResources, 'NA')} | {item.organization_name != "" ? item.organization_name : getResourceValue(this.state.patientResources, 'NA')}</p>
          </div>
        </div>
        <div className="col-md-3 px-0 d-flex justify-content-end patientDashListDate">
          <div className="patientDateMob">
            <div className="row mx-0 d-flex justify-content-between pd-row-attachment-bar">
              <div className="attachment-count-circle d-flex">
                <p className="attachment-count-text">{item.attachments_count}</p>
              </div>
              <div>
                <p className="pd-row-attachments">{getResourceValue(this.state.patientResources, 'ATTACHMENTS')}</p>
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <p className="pd-row-date">{item.received_date ? format(new Date(item.received_date), 'dd-MM-yyyy') : getResourceValue(this.state.patientResources, 'NA')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  openEditUserModalFunc = (item) => {
    this.setState({
      content: item,
      openEditUserModal: true
    })
  }

  render() {
    return (
      <>
        <div className="pd-container">
          <p className="pd-heading">{getResourceValue(this.state.patientResources, 'HEADER')}</p>
          {this.state.userOptOut == OptOutStatus.OptOut ? <div className="opt-out-data mt-3">{getResourceValue(this.state.patientResources, 'OPT_OUT_NOTE').replace('{date}', this.state.optOutDate)}</div> : null}
          <div className="pd_content-div">
            <div className="row d-flex justify-content-between mx-0 pd-content-header">
              <div className="col-md-3 vcenter">
                <p className="pd-title-text extra-margin table-header-text">{getResourceValue(this.state.patientResources, 'VISIT_RECORDS')} {this.state.dataArray.length > 0 ? `(${this.state.dataArray.length})` : ''}</p>
              </div>
              <div className="col-md-9">
                <div className="row d-flex justify-content-end">
                  {
                    this.state.totalDocument > 0 ? <div className="col-md-4 extra-margin">
                      <FormControl variant="outlined" style={{ width: '100%' }}>

                        <InputLabel id="show_per_page">{getResourceValue(this.state.patientResources, "SHOW_PER_PAGE")}</InputLabel>
                        <Select
                          labelId="show_per_page"
                          id="demo-simple-select-outlined"
                          value={this.state.pageSize}
                          onChange={(ev) => this.setState({ pageSize: ev.target.value }, () => this.viewBasicApi())}
                          label={getResourceValue(this.state.patientResources, "SHOW_PER_PAGE")}
                          name="pageSize"
                        >
                          {PAGE_ENTRY_SIZE && PAGE_ENTRY_SIZE.length > 0 && PAGE_ENTRY_SIZE.map((data, index) => (
                            <MenuItem value={data.value} key={index}>{data.value}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div> : null}

                  <div className="col-md-6">
                    <form
                      className="form-own form-auto-height"
                      noValidate
                      autoComplete="off"
                      onSubmit={(ev) => this.searchFilter(ev)}
                    >
                      <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                        <OutlinedInput
                          id="standard-adornment-amount"
                          name="searchVal"
                          onChange={(ev) => this.setState({ searchVal: ev.target.value })}
                          value={this.state.searchVal}
                          variant="outlined"
                          startAdornment={<InputAdornment position="start"><i className="fa fa-search" aria-hidden="true" ></i></InputAdornment>}
                          placeholder="Search"
                          style={{ background: '#F4F4F4' }}
                        />
                      </FormControl>
                    </form>
                  </div>
                </div>
              </div>

            </div>
            {
              this.state.dataArray.length > 0 ?
                <>
                  <div style={{ cursor: 'pointer' }} >
                    <div id="strapHeader" class="black-strap-box d-flex flex-wrap justify-content-end align-items-center px-3"><div></div></div>
                    <div className="pd-table-body">
                      {
                        this.state.dataArray.map((data, index) => (
                          this.getPatientVisitRow(data, index)
                        ))
                      }
                    </div>
                  </div>
                </>
                : <div className="no-table-data mt-3">{getResourceValue(this.state.patientResources, 'NO_RECORDS')}</div>
            }

          </div>
        </div>
        {this.state.openEditUserModal && <PatientRecords content={this.state.content} onClose={() => this.setState({ openEditUserModal: false })} openEditUserModal={this.state.openEditUserModal} resources={this.state.patientResources} />}
      </>
    );
  }
}

const mapStateToProps = state => ({
  languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(PatientDashboard));
