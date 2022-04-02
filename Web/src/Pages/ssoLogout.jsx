import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class ssoLogout extends Component {
    componentDidMount = () => {
        window.history.pushState(null, document.title, window.location.href);
        window.history.back();
        window.history.forward();
        window.onpopstate = function () {
            window.history.go(1);
        };
    }
    render() {
        return (
            <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)', textAlign: 'center'
            }}>
                <h3>You are logged out from Liberate Pro. Please click the launch button in your system to connect again</h3>
            </div>
        )
    }
}

export default withRouter(ssoLogout);