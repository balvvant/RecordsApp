import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import UserCategories from './UserCategories';

class ArchiveUserCategories extends Component {
    render() {
        return (
            <UserCategories isArchive={true} />
        )
    }
}

export default withRouter(ArchiveUserCategories);