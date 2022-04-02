import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ACTIONS, ROLES } from '../Constants/types';
import ManageProfileComponent from '../Components/ManageProfileComponent';

class SuperAdminManageProfile extends Component {
    render() {
        return (
            <ManageProfileComponent roleType={ROLES.SUPER_ADMIN} currentAction={ACTIONS.MANAGE_OWN} />
        )
    }
}

export default withRouter(SuperAdminManageProfile);