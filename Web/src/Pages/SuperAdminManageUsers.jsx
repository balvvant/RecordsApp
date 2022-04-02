import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ROLES } from '../Constants/types';
import ManageUsers from '../Pages/ManageUsers';

class SuperAdminManageUsers extends Component {
    render() {
        return (
            <ManageUsers role={ROLES.SUPER_ADMIN} isArchive={false} />
        )
    }
}

export default withRouter(SuperAdminManageUsers);