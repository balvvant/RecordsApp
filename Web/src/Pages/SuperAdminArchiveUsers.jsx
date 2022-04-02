import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ROLES } from '../Constants/types';
import ManageUsers from '../Pages/ManageUsers';

class SuperAdminArchiveUsers extends Component {
    render() {
        return (
            <ManageUsers role={ROLES.SUPER_ADMIN} isArchive={true} />
        )
    }
}

export default withRouter(SuperAdminArchiveUsers);