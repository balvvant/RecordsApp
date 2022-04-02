import { TextField } from '@material-ui/core';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader, verifyRoute } from '../actions/commonActions';
import { API_METHODS, CONSTANTS ,resourceGroups } from "../Constants/types";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class AdminConfiguration extends Component {

    constructor(props) {
        super(props);
        this.state = {
            configData: [],
            changeConfigData: [],
            adminResources: [],
            languageId: props.languageId,
        }
    }

    componentDidMount = () => {
        this.getConfigDetails();
        this.getAdminResources();
    }
    componentDidUpdate = () => {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources() });
        }
    }

    getAdminResources = async () => {
        try {

            globalLoader(true);
            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.COMMON, resourceGroups.UPLOAD_MEDIA, resourceGroups.MANAGE_MEDIA, resourceGroups.FEATURE_MENU],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "adminconfiguration/getAdminResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }


    getConfigDetails = async () => {
        try {
            globalLoader(true)
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/view-configurations',
                body: {}
            }
            let userData = await CallApiAsync(obj);
            if (userData.data.status === 200) {
                this.setState({
                    configData: userData.data.data.config_data
                }, () => {

                    globalLoader(false)
                })
                globalLoader(false)
            }

            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, userData.data.status.toString()))
                this.setState({
                    configData: [],
                }, () => {
                    globalLoader(false)
                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "AdminConfiguration/getConfigDetails",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }


    changeValue = (ev, id) => {
        try {

            let name = ev.target.name;
            let value = ev.target.value;
            let ChangeArray = this.state.changeConfigData;



            let found = ChangeArray.findIndex(x => x.config_key == name)
            if (found >= 0) {
                ChangeArray[found].config_value = value;
                this.setState({ changeConfigData: ChangeArray });
            }
            else {
                let obj = {
                    config_key: name,
                    config_value: value
                }
                ChangeArray.push(obj);
                this.setState({ changeConfigData: ChangeArray });
            }

        } catch (error) {
            let errorObject = {
                methodName: "AdminConfiguration/changeValue",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }

    }

    configSave = async (ev) => {
        ev.preventDefault();
        let allData = true;
        try {
            let obj = {
                config_data: this.state.changeConfigData,
            }

            obj.config_data.forEach((value) => {
                let val = value.config_value.replace(/\s/g, "")
                if (!val || val == ' ') {
                    allData = false
                }
            })

            if (allData) {
                let obj = {
                    method: API_METHODS.POST,
                    history: this.props.history,
                    api: '/save-configuration',
                    body: {
                        config_data: this.state.changeConfigData,
                    }
                }
                await CallApiAsync(obj).then(data => {
                    if (data.data.status === 200) {
                        globalAlert('success', getResourceValue(this.state.adminResources, 'CONFIGURATION_UPDATE'));
                        globalLoader(false);
                        verifyRoute(this.props.history, `/dashboard`);
                    } 
                    else {
                        globalLoader(false);
                        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, data.data.status.toString()));
                    }
                });
            }
            else {
                globalLoader(false);
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, 'ALL_FIELDS'));
            }

        }
        catch (error) {
            let errorObject = {
                methodName: "AdminConfiguration/configSave",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    render() {

        return (

            <div>
                <form noValidate autoComplete="off" onSubmit={(ev) => this.configSave(ev)}>
                    <div className="d-flex justify-content-between cpb-10" >
                        <div className="d-flex" >
                            <p className="login-txt mb-0 d-flex align-self-center font-20 primary-color cpl-10 cpr-10">{getResourceValue(this.state.adminResources, 'AdminConfiguration')}</p>
                        </div>
                        <div className=" btn-wrapper  ">
                            <button type="submit" className="btn btn-own btn-own-primary min-height-btn mw-100">{getResourceValue(this.state.adminResources, 'SAVE')}</button>
                        </div>
                    </div>
                    <div className='content-container cpr-10 cpb-10'>
                        <div className='row p-0 m-0'>
                            {this.state.configData.map((item, key) => (
                                <div className="col-md-6 col-12 m-0 p-0" key={key}>
                                    <div className="cpt-10 cpl-10">
                                        <TextField
                                            type="text"
                                            label={item.configuration_key.replace(/_/g, ' ')}
                                            placeholder={item.configuration_key.replace(/_/g, ' ')}
                                            className='mt-0 mb-0 d-flex'
                                            margin="normal"
                                            variant="outlined"
                                            onChange={(ev) => this.changeValue(ev, item)}
                                            defaultValue={item.configuration_value}
                                            name={item.configuration_key}
                                        />
                                    </div>
                                </div>
                            ))
                            }
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId
})
export default connect(mapStateToProps)(withRouter(AdminConfiguration));