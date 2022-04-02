import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ACTIONS, ROLES } from '../Constants/types';
import ManageProfileComponent from '../Components/ManageProfileComponent';

class ClinicianCreateProfile extends Component {
  render() {
    return (
      <>
      {
        this.props.createUserData.userInfo ? <ManageProfileComponent userInfo={this.props.createUserData.userInfo} roleType={ROLES.CLINICIAN}  currentAction={ACTIONS.CREATE} /> : null
      }
      </>
    
    )
  }
}

const mapStateToProps = state => ({
  createUserData: state.screen.createUserData,
});

export default connect(mapStateToProps)(withRouter(ClinicianCreateProfile));