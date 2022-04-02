import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ResetPasswordComponent from '../Components/resetPasswordComponent';
class ResetPassword extends Component {
  constructor(props) {
    super(props);
  }
  render() {

    return (
      <section className="login-comp-wrapper">
        <div className="d-flex flex-wrap w-100 justify-content-center">
          <div className="form-width-sm w-100">
            {this.props.resetUserData.role && this.props.resetUserData.mail ?
              <ResetPasswordComponent roleType={this.props.resetUserData.role} mail={this.props.resetUserData.mail} /> : null
            }
          </div>
        </div>
      </section>
    )
  }
}

const mapStateToProps = state => ({
  resetUserData: state.screen.resetUserData
})

export default connect(mapStateToProps)(withRouter(ResetPassword));