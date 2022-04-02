import { TextField } from '@material-ui/core';
import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalLoader } from '../actions/commonActions';
import { resourceFields } from "../Constants/types";
import { getResourceValue, validEmail } from '../Functions/CommonFunctions';

class EditPatientComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            nhsNumber: '',
            email: '',
            date_of_birth: '',
            firstNameError: '',
            lastNameError: '',
            emailError: ''
        }
    }

    componentDidMount = () => {
        this.setState({ firstName: this.props.singlePatient.first_name, lastName: this.props.singlePatient.last_name, nhsNumber: this.props.singlePatient.nhs_number, email: this.props.singlePatient.email, date_of_birth: this.props.singlePatient.date_of_birth })
    }

    changeValue = (ev) => {
        try {
            let name = ev.target.name;
            let value = ev.target.value;
            this.setState({
                [name]: value,
            })
        }
        catch (error) {
            let errorObject = {
                methodName: "editPatient/changeValue",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }

    userPostData = async (ev) => {
        ev.preventDefault();
        try {
            let formValidation = true;
            let firstNameMinLength = getResourceValue(this.props.resources, "FIRSTNAME", resourceFields.Min_Length);
            let firstNameMaxLength = getResourceValue(this.props.resources, "FIRSTNAME", resourceFields.Max_Length);
            let lastnameMinLength = getResourceValue(this.props.resources, "LASTNAME", resourceFields.Min_Length);
            let lastnameMaxLength = getResourceValue(this.props.resources, "LASTNAME", resourceFields.Max_Length);
            if (!this.state.firstName) {
                formValidation = false;
                this.setState({
                    firstNameError: getResourceValue(this.props.resources, 'FIELD_REQUIRED')
                })
            } else if (this.state.firstName.length > firstNameMaxLength) {
                formValidation = false;
                this.setState({
                    firstNameError: getResourceValue(this.props.resources, 'FIELD_LIMIT').replace('{min_length}', firstNameMinLength).replace('{max_length}', firstNameMaxLength)
                })
            } else {
                this.setState({
                    firstNameError: ''
                })
            }

            if (!this.state.lastName) {
                formValidation = false;
                this.setState({
                    lastNameError: getResourceValue(this.props.resources, 'FIELD_REQUIRED')
                })
            } else if (this.state.lastName.length > lastnameMaxLength) {
                formValidation = false;
                this.setState({
                    lastNameError: getResourceValue(this.props.resources, 'FIELD_LIMIT').replace('{min_length}', lastnameMinLength).replace('{max_length}', lastnameMaxLength)
                })
            } else {
                this.setState({
                    lastNameError: ''
                })
            }

            let emailMaxLength = getResourceValue(this.props.resources, "EMAIL_ID", resourceFields.Max_Length);
            if (!this.state.email) {
                formValidation = false;
                this.setState({
                    emailError: getResourceValue(this.props.resources, 'FIELD_REQUIRED')
                });
            } else {
                let validEmailLocal = await validEmail(this.state.email);
                if (!validEmailLocal) {
                    formValidation = false;
                    this.setState({
                        emailError: getResourceValue(this.props.resources, 'FIELD_INVALID')
                    });
                } else {
                    if (this.state.email.length > 100) {
                        formValidation = false;
                        this.setState({ emailError: getResourceValue(this.props.resources, 'FIELD_LENGTH').replace('{max_length}', emailMaxLength) })
                    } else {
                        this.setState({ emailError: '' })
                    }
                }
            }

            if (formValidation) {
                globalLoader(true)
                let obj = {
                    user_id: this.props.singlePatient.user_id,
                    email: this.state.email,
                    first_name: this.state.firstName,
                    last_name: this.state.lastName,
                    nhs_number: this.state.nhsNumber,
                    date_of_birth: this.state.date_of_birth,
                    changed: true,
                }
                let localPatientUsers = this.props.setpatientUsers;
                let userIndex = localPatientUsers.findIndex((val) => val.user_id == obj.user_id);
                localPatientUsers[userIndex] = obj;
                this.props.saveUser(localPatientUsers)
                globalLoader(false)
            }

        } catch (error) {
            let errorObject = {
                methodName: "managePatient/userPostData",
                errorStake: error.toString(),
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }


    render() {
        return (
            <div className="">
                <form className="form-own pt-3" noValidate autoComplete="off" onSubmit={(ev) => this.userPostData(ev)}>
                    <div className="row">
                        <div className="col-md-6 col-12 cpt-10 cpb-10 cpl-10 cpr-10">
                            <div className="form-group-icon form-group" style={{ display: 'contents' }}>
                                <TextField
                                    type="text"
                                    label={getResourceValue(this.props.resources, 'FIRSTNAME')}
                                    placeholder={getResourceValue(this.props.resources, 'FIRSTNAME', resourceFields.Placeholder)}
                                    className={'mt-0 mb-0 d-flex'}
                                    margin="normal"
                                    variant="outlined"
                                    name="firstName"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.firstName}
                                />
                                <div className="error-wrapper">
                                    {this.state.firstNameError}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-12 cpt-10 cpb-10 cpl-10 cpr-10">
                            <div className="form-group-icon form-group" style={{ display: 'contents' }}>
                                <TextField
                                    type="text"
                                    label={getResourceValue(this.props.resources, 'LASTNAME')}
                                    placeholder={getResourceValue(this.props.resources, 'LASTNAME', resourceFields.Placeholder)}
                                    className={'mt-0 mb-0 d-flex'}
                                    margin="normal"
                                    variant="outlined"
                                    name="lastName"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.lastName}
                                />
                                <div className="error-wrapper">
                                    {this.state.lastNameError}
                                </div>
                            </div>
                        </div>
                        <div className=" col-md-6 col-12 cpt-10 cpb-10 cpl-10 cpr-10 position-relative datepicker-form-group ">
                            <div className="form-group-icon form-group" style={{ display: 'unset' }}>
                                <div className={`own-custom-label active`} style={{ width: 140, left: -5, top: -12 }}>
                                    {getResourceValue(this.props.resources, "DATE_OF_BIRTH")}
                                </div>
                                <div>
                                    <DatePicker
                                        selected={this.state.date_of_birth && this.state.date_of_birth != "null" ? new Date(this.state.date_of_birth) : null}
                                        // onClickOutside={props.datePickerValue}
                                        maxDate={new Date()}
                                        dateFormat='dd-MM-yyyy'
                                        scrollableYearDropdown={true}
                                        yearDropdownItemNumber={100}
                                        autoComplete='off'
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
                                        disabled={true}
                                        className={'mt-0 mb-0 d-flex nonEditable'}
                                        onChangeRaw={(ev) => ev.preventDefault()}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-12 cpt-10 cpb-10 cpl-10 cpr-10">
                            <div className="form-group-icon form-group" style={{ display: 'contents' }}>
                                <TextField
                                    type="text"
                                    label={getResourceValue(this.props.resources, 'NHS_NUMBER')}
                                    disabled
                                    placeholder={getResourceValue(this.props.resources, 'NHS_NUMBER', resourceFields.Placeholder)}
                                    className={'mt-0 mb-0 d-flex nonEditable'}
                                    margin="normal"
                                    variant="outlined"
                                    name="nhsNumber"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.nhsNumber}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 col-12 cpt-10 cpb-10 cpl-10 cpr-10">
                            <div className="form-group-icon form-group datepicker-form-group" style={{ display: 'contents' }}>
                                <TextField
                                    label={getResourceValue(this.props.resources, 'EMAIL')}
                                    placeholder={getResourceValue(this.props.resources, 'EMAIL', resourceFields.Placeholder)}
                                    className='mt-0 mb-0 d-flex'
                                    margin="normal"
                                    variant="outlined"
                                    name="email"
                                    onChange={(ev) => this.changeValue(ev)}
                                    value={this.state.email}
                                />
                                <div className="error-wrapper">
                                    {this.state.emailError}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='row cpl-10 cpr-10'>
                        <div className="btn-wrapper">
                            <button type="button" className="btn btn-own btn-own-grey min-height-btn mr-3 mw-100" onClick={() => this.props.closeModal(null)}>{getResourceValue(this.props.resources, 'CANCEL')}</button>
                            <button type="submit" className="btn btn-own btn-own-primary min-height-btn mw-100">{getResourceValue(this.props.resources, 'SAVE')}</button>
                        </div>
                    </div>

                </form>
            </div>
        )
    }

}

const mapStateToProps = state => ({
    userData: state.user.userData,
    userDetail: state.user.userDetail,
    otherUserData: state.user.otherUserData,
    languageId: state.common.languageId,
})

export default connect(mapStateToProps)(withRouter(EditPatientComponent));

