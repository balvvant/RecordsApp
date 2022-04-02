import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ACTIONS, ROLES } from '../Constants/types';
import ManageProfileComponent from '../Components/ManageProfileComponent';

class PatientManageProfile extends Component {
    render() {
        return (
            <ManageProfileComponent roleType={ROLES.PATIENT} currentAction={ACTIONS.MANAGE_OWN} />
        )
    }
}

export default withRouter(PatientManageProfile);