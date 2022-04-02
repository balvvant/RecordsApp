import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { changeTheScreen, errorLogger, globalAlert, globalLoader, storeActivateParam, verifyRoute } from '../actions/commonActions';
import { API_METHODS, CONSTANTS,SCREENS } from '../Constants/types';
import { CallApiAsync } from '../Functions/CommonFunctions';

class ActivateUser extends Component {

    state = {
        validType: false,
        mail: '',
        role: '',
        nhs_number: null,
        userInfo: {}
    }
    componentDidMount = () => {
        if (localStorage.getItem('token')) {
            verifyRoute(this.props.history, `/dashboard`);
        } else {
            this.callInitialApi();
        }
    }

    callInitialApi = async () => {
        try {
            globalLoader(true)
            let pathList = window.location.pathname.split('/');

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/activate-user',
                body: {
                    data: pathList[pathList.length - 1],
                }
            }

            let res = await CallApiAsync(obj);
            if (res.data.status === 200) {
                let userInfo = res.data.data.userInfo;
                let userData = {
                    userInfo: userInfo,
                    mail: res.data.data.userInfo.email,
                    role: res.data.data.role
                }
                storeActivateParam(userData);
                changeTheScreen(SCREENS.ACTIVATE_USER);
                this.props.history.push('/')
                globalLoader(false);
            }
            else {
                globalLoader(false)
                globalAlert(CONSTANTS.ERROR, res.data.status.toString());
                this.props.history.push('/')
            }
        } catch (error) {
            let errorObject = {
                methodName: "activateUser/callInitialApi",
                errorStake: error.toString(),
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }


    render() {

        return (
            <>
            </>
        )
    }
}

export default withRouter(ActivateUser);