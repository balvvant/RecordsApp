import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import AddEditContentComponent from '../Components/AddEditContentComponent';

class UploadMedia extends Component {
    render() {
        return (
            <>
                <AddEditContentComponent />
            </>
        )
    }
}

export default withRouter(UploadMedia);