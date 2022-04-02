import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Contents from './Contents';

class ArchiveContents extends Component {
    render() {
        return (
            <Contents isArchive={true} />
        )
    }
}

export default withRouter(ArchiveContents);