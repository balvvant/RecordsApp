import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Router from './router.jsx';
import AlertComponent from './Components/AlertComponent';
import Loader from './Components/LoaderComponent';
import MasterComponent from './Components/MasterComponent';

global.logoutMessage = "";
global.isModalOpen = false;
global.rightSidebarScrolled = 0;
global.leftSidebarScrolled = 0;
class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Loader />
        <AlertComponent />
        <MasterComponent>
          <div className={`app-whole-wrapper ${this.props.mobileMenuOpen ? "mobile-menu-open" : 'mobile-menu-close'}`}>
            <Router />
          </div>
        </MasterComponent>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  mobileMenuOpen: state.common.mobileMenuOpen,
})

export default connect(mapStateToProps)(withRouter(App));