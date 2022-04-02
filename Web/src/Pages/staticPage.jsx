import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import {CONSTANTS, API_METHODS } from '../Constants/types';
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class staticPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resource: {},
            resource_key: '',
            reRender: true
        };
    }

    componentDidMount = () => {
        let pathList = window.location.pathname.split('/');
        let resource_key = pathList[pathList.length - 1];
        this.setState({resource_key: resource_key}, () => this.callInitialApi());   
    }

    componentDidUpdate = () => {
        let pathList = window.location.pathname.split('/');
        let resource_key = pathList[pathList.length - 1];
        if(resource_key != this.state.resource_key){
            this.setState({resource_key: resource_key}, () => this.callInitialApi());
        }
    }

    callInitialApi = async () => {
        try {
            globalLoader(true)
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-custom-page-data',
                body: {
                    resource_key: this.state.resource_key
                }}
                let result = await CallApiAsync(obj);
                if (result.data.status === 200) {
                    this.setState({ resource: result.data.data.resource }, () => this.setState({ reRender: !this.state.reRender }));
                } else {
                    globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resource, result.data.status.toString()));
                }
            globalLoader(false);
        } catch (error) {
            let errorObject = {
                methodName: "staticPage/callInitialApi",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    render() {
        let token = localStorage.getItem('token');
        return (
            <div className={`landing-content-div ${ token ? 'content-container' : 'mt-4 mb-4 '}`}>
                <p className="content-header">{this.state.resource?.place_holder_value}</p>
                <h6>{this.state.resource?.info_value}</h6>
                <div dangerouslySetInnerHTML={{ __html: this.state.resource?.resource_value }} ></div>
            </div>
        )
    }
}

export default withRouter(staticPage);