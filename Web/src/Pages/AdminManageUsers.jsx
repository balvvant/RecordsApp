import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ROLES } from '../Constants/types';
import ManageUsers from '../Pages/ManageUsers';

class AdminManageUsers extends Component {
    render() {
        return (
            <ManageUsers role={ROLES.ADMIN} isArchive={false} />
        )
    }
}

export default withRouter(AdminManageUsers);