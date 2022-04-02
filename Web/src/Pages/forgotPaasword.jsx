import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ForgotPasswordComp from '../Components/forgotPasswordComponent';
class ForgotPassword extends Component {

  render() {
    return (
      <div className="d-flex flex-wrap w-100 justify-content-center">
        <div className="form-width-sm w-100" style={{paddingBottom: "5vw"}}>
          <ForgotPasswordComp loginLink='' />
        </div>
      </div>
    )
  }
}

export default withRouter(ForgotPassword);