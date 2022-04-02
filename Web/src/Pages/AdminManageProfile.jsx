import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ACTIONS, ROLES } from '../Constants/types';
import ManageProfileComponent from '../Components/ManageProfileComponent';

class AdminManageProfile extends Component {
    render() {
        return (
            <ManageProfileComponent roleType={ROLES.ADMIN} currentAction={ACTIONS.MANAGE_OWN} />
        )
    }
}

export default withRouter(AdminManageProfile);