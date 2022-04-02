import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ROLES } from '../Constants/types';
import SuperAdminOrganisations from './SuperAdminOrganisations';

class ArchiveOrganisations extends Component {
    render() {
        return (
            <SuperAdminOrganisations role={ROLES.SUPER_ADMIN} isArchive={true} />
        )
    }
}

export default withRouter(ArchiveOrganisations);