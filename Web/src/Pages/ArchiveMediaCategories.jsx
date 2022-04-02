import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import MediaCategories from './MediaCategories';

class ArchiveMediaCategories extends Component {
    render() {
        return (
            <MediaCategories isArchive={true} />
        )
    }
}

export default withRouter(ArchiveMediaCategories);