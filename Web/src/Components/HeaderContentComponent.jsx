import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

const HeaderContentComponent = React.memo((props) => {
    let token = localStorage.getItem("token");
    return (
        <>
        <div className={token ? "content-container" : ''}>
            {
                props.headerContent && props.headerContent.length > 0 && props.headerContent.map((header, index) => {
                    if (header.place_holder_value) {
                        return <>
                            {
                                (header.info_value || header.resource_value || (header.data && header.data.length > 0)) && <div id={header.place_holder_value.toLowerCase().replace(" ", "-")} key={index} className="landing-content-div">
                                    <p className="content-header">{header.place_holder_value}</p>
                                    <h6>{header.info_value}</h6>
                                    <div dangerouslySetInnerHTML={{ __html: header.resource_value }} ></div>
                                </div>
                            }
                            {
                                header.data && header.data.length > 0 && header.data.map((subHeader, subIndex) => {
                                    if (subHeader.place_holder_value) {
                                        return <>
                                            <div id={subHeader.place_holder_value.toLowerCase().replace(" ", "-")} key={subIndex} className="mt-4 landing-content-div">
                                                <p className="content-sub-header">{subHeader.place_holder_value}</p>
                                                <h6>{subHeader.info_value}</h6>
                                                <div dangerouslySetInnerHTML={{ __html: subHeader.resource_value }} ></div>
                                            </div>
                                        </>
                                    }
                                })
                            }
                        </>
                    }
                })
            }
            </div>
        </>
    )
});

const mapStateToProps = state => ({
    headerContent: state.screen.headerContent,
});

export default connect(mapStateToProps)(withRouter(HeaderContentComponent));
