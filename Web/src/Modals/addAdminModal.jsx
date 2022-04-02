import {
  FormControl, InputLabel, MenuItem, Select, TextField
} from "@material-ui/core";
import { format } from "date-fns";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { withRouter } from "react-router-dom";
import { errorLogger, globalAlert, globalLoader } from "../actions/commonActions";
import { API_METHODS, resourceFields, resourceGroups, CONSTANTS,ROLES } from "../Constants/types";
import { CallApiAsync, getResourceValue, validEmail } from "../Functions/CommonFunctions";
import TagComponent from "../Components/TagComponent";

class AddAdminModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      emailId: "",
      startDate: this.props.prefilledData ? new Date(this.props.prefilledData.dob) : null,
      valueInDate: this.props.prefilledData && this.props.prefilledData.dob ? true : false,
      formattedDate: this.props.prefilledData ? format(new Date(this.props.prefilledData.dob), "dd-MM-yyyy") : "",
      emptyDob: false,
      securityCode: null,
      emptySecurityCode: false,
      organization: this.props.prefilledData ? this.props.prefilledData.orgId : '',
      organizationsArray: props.organizations,
      emptyOrganisation: false,
      emailErrorMessage: '',
      nhsNumber: this.props.prefilledData ? this.props.prefilledData.nhsNumber.slice(0, 3) + "-" + this.props.prefilledData.nhsNumber.slice(3, 6) + "-" + this.props.prefilledData.nhsNumber.slice(6, 10) : '',
      nhsErrorMessage: '',
      tagData: {},
      errorTagMessage: '',
      firstname: "",
      firstnameErrorMessage: "",
      lastname: this.props.prefilledData ? this.props.prefilledData.lastname : "",
      lastnameErrorMessage: ""
    };
  }

  dateChange = (date) => {
    this.setState({
      startDate: date,
      formattedDate: format(date, "dd-MM-yyyy"),
    });
  };

  changeValue = (ev) => {
    let name = ev.target.name;
    let value = ev.target.value;

    this.setState({
      [name]: value,
    });
  };

  userPostData = (ev) => {
    ev.preventDefault();

    try {

      this.formValidation()
        .then((value) => {
          if (value) {
            globalLoader(true);

            let orgId = this.state.organization;

            let obj = {
              method:API_METHODS.POST,
              history:this.props.history,
              api:'',
              body:{
              email: this.state.emailId,
              role: this.props.roleType,
              orgId: orgId
            }};

            if (this.state.tagData?.oldTag?.length > 0) {
              obj.body.tag_ids = this.state.tagData.oldTag.toString();
            }
            if (this.state.tagData?.newTag?.length > 0) {
              obj.body.new_tags = this.state.tagData.newTag.toString();
            }
            if(this.props.roleType=== ROLES.SUPER_ADMIN) {
              obj.api='/invite-superadmin'
            }
            else if(this.props.roleType=== ROLES.ADMIN) {
                obj.api='/invite-admin'
            }
            else if(this.props.roleType=== ROLES.CLINICIAN) {
                obj.api='/invite-clinician'
            }
            else if(this.props.roleType=== ROLES.PATIENT) {
                obj.api='/invite-patient'
            }
            if (this.props.roleType === ROLES.PATIENT) {
              let formattedDob = format(this.state.startDate, 'yyyy-MM-dd');
              obj.body.firstname= this.state.firstname;
              obj.body.lastname= this.state.lastname;
              obj.body.nhs_number= this.state.nhsNumber.split('-').join('');
              obj.body.date_of_birth= formattedDob };
            

            CallApiAsync(obj)
              .then((data) => {
                if (data.data.status === 200) {
                  globalAlert("success", getResourceValue(this.props.resources, 'USER_INVITED'));
                  globalLoader(false);

                  if (this.props.closeCallBackOption) {
                    this.props.closeCallBackOption(data.data.status);
                  }

                  if (this.props.noClose) { } else {
                    this.props.onCloseChangeModal();
                  }
                } else  {
                  if (data?.data?.data?.errors?.email) {

                    let emailMaxLength = getResourceValue(this.props.resources, "EMAIL_ID", resourceFields.Max_Length);
                    this.setState({ emailErrorMessage: getResourceValue(this.props.resources, data?.data?.data?.errors?.email).replace('{max_length}', emailMaxLength) });
                  }

                  if (data?.data?.data?.errors?.nhs_number) {
                    this.setState({ nhsErrorMessage: getResourceValue(this.props.resources, data?.data?.data?.errors?.nhs_number) });
                  }

                  if (data?.data?.data?.errors?.new_tags) {
                    this.setState({ errorTagMessage: getResourceValue(this.props.resources, data?.data?.data?.errors?.new_tags) });
                  }

                  globalLoader(false);
                  globalAlert(CONSTANTS.ERROR, getResourceValue(this.props.resources, data.data.status.toString()))
                }
                
              })
              .catch((err) => {
                // console.log(err);
              });
          }
        })
        .catch((err) => {
          // console.log(err);
        });
    } catch (error) {
      let errorObject = {
        methodName: "addAdminModal/userPostData",
        errorStake: error.toString(),
        history:this.props.history
      };

      errorLogger(errorObject);
    }
  };

  datePickerClicked = () => {
    this.setState({
      valueInDate: true,
    });
  };
  datePickerValue = () => {
    if (!this.state.startDate) {
      this.setState({
        valueInDate: false,
      });
    }
  };

  formValidation = async () => {
    this.setState({
      emptyDob: false,
      emptySecurityCode: false,
      emptyOrganisation: false,
      emailErrorMessage: '',
      nhsErrorMessage: '',
      firstnameErrorMessage: '',
      lastnameErrorMessage: '',
    });
    let formValidation = true;

    if (this.state.roleType == ROLES.SUPER_ADMIN && this.props.roleType === ROLES.ADMIN) {
      if (this.state.organization == '' || this.state.organization <= 0) {
        formValidation = false;
        this.setState({
          emptyOrganisation: true,
        });
      }
    }

    if (this.props.roleType === ROLES.PATIENT) {
      let firstNameMinLength = getResourceValue(this.props.resources, "FIRSTNAME", resourceFields.Min_Length);
      let firstNameMaxLength = getResourceValue(this.props.resources, "FIRSTNAME", resourceFields.Max_Length);
      let lastNameMinLength = getResourceValue(this.props.resources, "LASTNAME", resourceFields.Min_Length);
      let lastNameMaxLength = getResourceValue(this.props.resources, "LASTNAME", resourceFields.Max_Length);

      if (this.state.firstname) {
        if (this.state.firstname.length > firstNameMaxLength || this.state.firstname.length < firstNameMinLength) {
          formValidation = false;
          this.setState({
            firstnameErrorMessage: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}', firstNameMinLength).replace('{max_length}', firstNameMaxLength)
          })
        } else {
          this.setState({
            firstnameErrorMessage: ''
          })
        }
      } else {
        this.setState({
          firstnameErrorMessage: getResourceValue(this.props.resources, 'FIELD_REQUIRED')
        });
      }

      if (this.state.lastname) {
        if (this.state.lastname.length > lastNameMaxLength || this.state.lastname.length < lastNameMinLength) {
          formValidation = false;
          this.setState({
            lastnameErrorMessage: getResourceValue(this.state.manageProfileResources, 'FIELD_LIMIT').replace('{min_length}', lastNameMinLength).replace('{max_length}', lastNameMaxLength)
          })
        } else {
          this.setState({
            lastnameErrorMessage: ''
          })
        }
      } else {
        this.setState({
          lastnameErrorMessage: getResourceValue(this.props.resources, 'FIELD_REQUIRED')
        });
      }
    }

    let emailMaxLength = getResourceValue(this.props.resources, "EMAIL_ID", resourceFields.Max_Length);
    if (!this.state.emailId) {
      if (this.props.roleType !== ROLES.ADMIN) {
        formValidation = false;
        this.setState({
          emailErrorMessage: getResourceValue(this.props.resources, 'FIELD_REQUIRED')
        });
      }
    } else {
      let validEmailLocal = await validEmail(this.state.emailId);
      if (!validEmailLocal) {
        formValidation = false;
        this.setState({
          emailErrorMessage: getResourceValue(this.props.resources, 'FIELD_INVALID')
        });
      } else {
        if (this.state.emailId.length > 100) {
          formValidation = false;
          this.setState({ emailErrorMessage: getResourceValue(this.props.resources, 'FIELD_LENGTH').replace('{max_length}', emailMaxLength) })
        } else {
          this.setState({ emailErrorMessage: '' })
        }
      }
    }

    if (this.props.roleType === ROLES.PATIENT) {
      if (!this.state.formattedDate) {
        formValidation = false;
        this.setState({
          emptyDob: true,
        });
      }

      let nhsNumberMaxLength = getResourceValue(this.props.resources, "NHS_NUMBER", resourceFields.Max_Length);
      if (!this.state.nhsNumber) {
        formValidation = false;
        this.setState({ nhsErrorMessage: getResourceValue(this.props.resources, 'FIELD_REQUIRED') });
      } else if (!this.nhsNumberFunc(this.state.nhsNumber)) {
        formValidation = false;
        this.setState({ nhsErrorMessage: getResourceValue(this.props.resources, 'FIELD_LENGTH').replace('{max_length}', nhsNumberMaxLength) })
      }

    }

    if (this.props.roleType == ROLES.PATIENT) {
      let tagResult = await this.refs.tagComp.formValidation();

      if (tagResult.formValidation) {
        this.setState({
          tagData: tagResult.data,
        })
      }
      else {
        formValidation = false
      }
    }

    return formValidation;
  };

  nhsNumberFunc = (value) => {
    try {
      var containsNumber = /^[0-9\-\b]+$/;
      let firstLetterZero = false;
      let maxLength = 12;
      if (value && value[0] === '0') {
        firstLetterZero = true;
      }


      if ((containsNumber.test(value) || value === '') && value.length <= maxLength) {

        let newVal = value.split('-').join('');

        if (newVal.length > 3 && newVal.length < 7) {
          this.setState({ nhsNumber: newVal.slice(0, 3) + "-" + newVal.slice(3, 6) })
        }
        else if (newVal.length >= 7) {
          this.setState({ nhsNumber: newVal.slice(0, 3) + "-" + newVal.slice(3, 6) + "-" + newVal.slice(6, 10) })
        }
        else {
          this.setState({ nhsNumber: newVal })
        }

        return true;
      }
      else {
        return false
      }
    } catch (error) {
      let errorObject = {
        methodName: "addAdminModal/nhsNumberFunc",
        errorStake: error.toString(),
        history:this.props.history
      };

      errorLogger(errorObject);
    }
  }

  render() {

    return (
      <div>
        <Modal
          classNames={{ modal: "modal-sm modal-own" }}
          open={this.props.open}
          onClose={() => this.props.noClose ? null : this.props.onCloseChangeModal()}
          center
          closeOnOverlayClick={false}
          closeIcon={""}
          autoFocus={false}
          showCloseIcon={false}
        >
          <div className=" ">
            <p className="login-txt  primary-color mb-0">

              {this.props.roleType === ROLES.SUPER_ADMIN ? getResourceValue(this.props.resources, 'ADD_SUPERADMIN') : ''}{this.props.roleType === ROLES.ADMIN ? getResourceValue(this.props.resources, 'ADD_ADMIN') : ''}{this.props.roleType === ROLES.CLINICIAN ? this.props.clinicianLabel : ''}{this.props.roleType === ROLES.PATIENT ? this.props.patientLabel : ''}
            </p>
            <p className="font-14 mb-0">
              {
                this.props.ssoFlag ? null : getResourceValue(this.props.resources, 'ADD_DESCRIPTION')
              }
            </p>

            <form
              className="form-own "
              noValidate
              autoComplete="off"
              onSubmit={(ev) => this.userPostData(ev)}
            >

              {
                this.props.roleType === ROLES.PATIENT ? (
                  <>
                    <div className="col-md-12 col-12 p-0 cmt-10 cmb-10">
                      <div>
                        <TextField
                          id="outlined-textarea"
                          label={getResourceValue(this.props.resources, 'FIRSTNAME')}
                          placeholder={getResourceValue(this.props.resources, 'FIRSTNAME')}
                          className="mt-0 mb-0 d-flex"
                          margin="normal"
                          variant="outlined"
                          name="firstname"
                          onChange={(ev) => this.changeValue(ev)}
                          value={this.state.firstname}
                          autoFocus={true}
                        />
                        <div className="error-wrapper">
                          {this.state.firstnameErrorMessage}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12 col-12 p-0 cmt-10 cmb-10">
                      <div>
                        <TextField
                          id="outlined-textarea"
                          label={getResourceValue(this.props.resources, 'LASTNAME')}
                          placeholder={getResourceValue(this.props.resources, 'LASTNAME')}
                          className="mt-0 mb-0 d-flex"
                          margin="normal"
                          variant="outlined"
                          name="lastname"
                          onChange={(ev) => this.changeValue(ev)}
                          value={this.state.lastname}
                          autoFocus={true}
                        />
                        <div className="error-wrapper">
                          {this.state.lastnameErrorMessage}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null
              }

              <div className="col-md-12 col-12 p-0 cmt-10 cmb-10">
                <div>
                  <TextField
                    id="outlined-textarea"
                    label={getResourceValue(this.props.resources, 'EMAIL_ID')}
                    placeholder={getResourceValue(this.props.resources, 'EMAIL_ID')}
                    className="mt-0 mb-0 d-flex"
                    margin="normal"
                    variant="outlined"
                    name="emailId"
                    onChange={(ev) => this.changeValue(ev)}
                    value={this.state.emailId}
                    autoFocus={true}
                  //inputRef={input => input && input.focus()}
                  />
                  <div className="form-img-wrapper no-pointer">
                    <img src="/assets/img/lock-arrow.png" alt="lock" />
                  </div>
                  <div className="error-wrapper">
                    {this.state.emailErrorMessage}
                  </div>
                </div>
              </div>

              {this.props.roleType === ROLES.ADMIN ? (
                <div className="col-md-12 col-12 p-0 cmt-10 cmb-10">
                  <div>
                    <FormControl variant="outlined">
                      <InputLabel id="organization-label">
                        {getResourceValue(this.props.resources, 'ORGANIZATIONS')}
                      </InputLabel>
                      <Select
                        labelId="organization-label"
                        id="demo-simple-select-outlined"
                        value={this.state.organization}
                        onChange={(ev) => this.changeValue(ev)}
                        label={getResourceValue(this.props.resources, 'ORGANIZATION_LIST')}
                        name="organization"
                      >
                        {/* remove liberatepro org from the list for superadmin */}
                        {this.state.organizationsArray &&
                          this.state.organizationsArray.length > 0 ?
                          this.state.organizationsArray.map((organizations) => (
                            <MenuItem
                              value={organizations.organization_id}
                              key={organizations.organization_id}
                            >
                              {organizations.name}
                            </MenuItem>

                          )) : <MenuItem value={''}>{getResourceValue(this.props.resources, 'NO_RECORDS')}</MenuItem>}
                      </Select>
                    </FormControl>
                    <div className="error-wrapper">
                      {this.state.emptyOrganisation ? (
                        <span>{getResourceValue(this.props.resources, 'FIELD_REQUIRED')}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null
              }

              {this.props.roleType === ROLES.PATIENT ? (
                <div className="col-md-12 col-12 p-0 cmt-10 cmb-10 media-datepicker">
                <div className="position-relative datepicker-form-group">
                  <div className={`own-custom-label ${this.state.valueInDate ? "active" : ""}`}>{getResourceValue(this.props.resources, 'DOB')}</div>
                  <div onClick={this.datePickerClicked}>
                    <DatePicker
                      selected={this.state.startDate}
                      onChange={this.dateChange}
                      onClickOutside={this.datePickerValue}
                      maxDate={new Date()}
                      scrollableYearDropdown={true}
                      yearDropdownItemNumber={100}
                      dateFormat="dd-MM-yyyy"
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
                      showYearDropdown
                      showMonthDropdown
                      onChangeRaw={(ev) => ev.preventDefault()}
                    />
                  </div>
                  <div className="error-wrapper">
                    {this.state.emptyDob ? (
                      <span>{this.props.requiredField}</span>
                    ) : null}
                  </div>
                </div>
                </div>
              ) : null}

              {this.props.roleType === ROLES.PATIENT && 
              <div className="col-md-12 col-12 p-0 cmt-10 cmb-10">
                <div className="position-relative">
                <TextField
                  label={getResourceValue(this.props.resources, 'NHS_NUMBER')}
                  placeholder={getResourceValue(this.props.resources, 'NHS_NUMBER', resourceFields.Placeholder)}
                  className='mt-0 mb-0 d-flex'
                  margin="normal"
                  variant="outlined"
                  onChange={(ev) => this.nhsNumberFunc(ev.target.value)}
                  value={this.state.nhsNumber}
                />
                <div className="error-wrapper">
                  <span >{this.state.nhsErrorMessage}</span>
                </div>
              </div></div>}

              {this.props.roleType === ROLES.PATIENT && <div className="col-md-12 col-12 p-0 cmt-10 cmb-10"><TagComponent resources={this.props.resources} formNumber="07" ref="tagComp" existingTab={this.props.patientTags} editMode={false} errorTag={this.state.errorTagMessage} dataVal={""} tagLABEL={null} from={resourceGroups.MANAGE_USERS} /></div>}

              <div className="btn-wrapper">
                {
                  this.props.noClose ? null :
                    <button
                      type="button"
                      className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn mr-3 mw-100"
                      onClick={() => this.props.onCloseChangeModal()}
                    >
                      {getResourceValue(this.props.resources, 'CANCEL')}
                    </button>
                }

                <button
                  type="submit"
                  className="btn full-width-xs btn-own btn-own-primary min-height-btn mw-100"
                >
                  { 
                    this.props.ssoFlag ? 
                    getResourceValue(this.props.resources, 'CREATE_RECORD')
                    :
                    getResourceValue(this.props.resources, 'SEND_INVITATION')
                  }
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withRouter(AddAdminModal);
