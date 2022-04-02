import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ROLES } from '../Constants/types';
import ManageUsers from '../Pages/ManageUsers';

class AdminArchiveUsers extends Component {
    render() {
        return (
            <ManageUsers role={ROLES.ADMIN} isArchive={true} />
        )
    }
}

export default withRouter(AdminArchiveUsers);