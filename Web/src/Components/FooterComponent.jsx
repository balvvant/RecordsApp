import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter, Link } from 'react-router-dom';
import { changeOpenComponent } from '../actions/commonActions';
import { RESOURCE_KEYS } from "../Constants/types";

class FooterComponent extends Component {
    constructor(props) {
        super(props);
        let token = localStorage.getItem('token');
        this.state = {
            websiteData: [],
            footerHeader: [],
            openComponent: false,
            urlLink: '',
            iframeHeight: "100vh",
            iframeResize: false,
            active: '',
            indexLink: null,
            isDropdown: false,
            token: token,
        }
    }

    componentDidUpdate() {
        const { languageId } = this.props;
       
        let token = localStorage.getItem("token");
        if (token !== this.state.token) {
            this.setState({ token: token })
        }
    }

    getFooters = () => {
        const activeStyle = { color: '#3366cc' };
        return this.props.footerHeader.map((resource, index) => {
            if (this.props.websiteData["FOOTER"] && this.props.websiteData["FOOTER"][resource.resource_key]) {
                return (
                    <>
                        <div className="col-xs-6 col-md-2 p-0 site-foot-col" key={index}>
                            <h6>{resource.resource_value}</h6>
                            <ul className="footer-links">
                                {
                                    this.props.websiteData["FOOTER"][resource.resource_key].length > 0 && this.props.websiteData["FOOTER"][resource.resource_key].map((footer, footerIndex) => {
                                        if (footer.resource_value) {
                                            return <li key={footerIndex} >
                                                <Link to={footer.menu_resource_key == RESOURCE_KEYS.BLOG  ?  '/blogs' : `/static-page/${footer.menu_resource_key}`} smooth={true} duration={1000} onClick={() => { window.scrollTo(0, 0); changeOpenComponent(false); this.setState({ active: footer.place_holder_value, indexLink: footerIndex }) }} style={this.state.active == footer.place_holder_value && this.state.indexLink == footerIndex ? activeStyle : {}} >{footer.place_holder_value}
                                                </Link>
                                            </li>
                                        }
                                        return <li style={{ cursor: 'auto' }} key={footerIndex}><h5>{footer.place_holder_value}</h5><p>{footer.info_value}</p></li>
                                    })
                                }

                            </ul>
                        </div>
                    </>
                )
            } else {
                return null;
            }
        })

    }


    render() {
        return (
            <>
                
                {
                    this.props.websiteData["FOOTER"] &&
                    <div className="div-container" style={{ background: '#fff' }}>
                        {
                            this.props.websiteData["FOOTER"] && <div className="site-footer" style={{ padding: "60px 90px" }}>
                                <div className="container-fluid">
                                    <div className="row justify-content-between">
                                        {this.props.footerHeader.length > 0 ? this.getFooters() : null}
                                    </div>
                                </div>
                                <div className="footer-logo">
                                    <img src="/assets/img/cyber-essentials-logo.png" alt="cyber essentials" />
                                </div>
                            </div>
                        }
                    </div>
                }
            </>

        )
    }

}

const mapStateToProps = state => ({
    languageId: state.common.languageId,
    openedScreen: state.screen.openedScreen,
    createUserData: state.screen.createUserData,
    resourceKey: state.screen.resourceKey,
    openComponent: state.common.openComponent,
});

export default connect(mapStateToProps)(withRouter(FooterComponent));