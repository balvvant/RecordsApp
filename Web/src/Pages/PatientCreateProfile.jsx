import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ACTIONS, ROLES } from '../Constants/types';
import ManageProfileComponent from '../Components/ManageProfileComponent';

class PatientCreateProfile extends Component {
  render() {
    return (
      <ManageProfileComponent userInfo={this.props.createUserData.userInfo} roleType={ROLES.PATIENT} currentAction={ACTIONS.CREATE} />
    )
  }
}

const mapStateToProps = state => ({
  createUserData: state.screen.createUserData,
});

export default connect(mapStateToProps)(withRouter(PatientCreateProfile));