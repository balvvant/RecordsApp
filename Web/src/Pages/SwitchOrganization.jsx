import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { changeCategoryId, changeContentBasket, changeParentCategoryId, changeViewType, globalAlert, globalLoader, verifyRoute } from '../actions/commonActions';
import { API_METHODS, CONTENT_VIEW_TYPES, GLOBAL_API,CONSTANTS, resourceGroups } from "../Constants/types";
import ConfirmationModal from '../Modals/confirmModal';
import { CallApiAsync, getResourceValue, SetOrg } from '../Functions/CommonFunctions';

const SwitchOrganization = (props) => {
    const [password, setPassword] = useState('')
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [resources, setResources] = useState([])
    const isSSOUser = localStorage.getItem('isSSOUser');
    let clinicianOrg = localStorage.getItem('clinician_organization');

    if (clinicianOrg) {
        clinicianOrg = JSON.parse(clinicianOrg);
    } else {
        clinicianOrg = [];
    }

    useEffect(() => {
        globalLoader(false);
        // changeOrgId()
    }, [props.userDetail])

    useEffect(() => {
        //fetchResources();
    }, [props.languageId])

    const fetchResources = async () => {

        globalLoader(true);

        //get language data
        let languageId = props.languageId;

        let obj = {
            method: API_METHODS.POST,
            history: props.history,
            api: '/get-page-resources',
            body: {
                group_id: [resourceGroups.CREATE_PROFILE, resourceGroups.COMMON]
            }
        }
        let resourcesResult = await CallApiAsync(obj);

        if (resourcesResult.data.status === 200) {
            let resources = resourcesResult.data.data.resources;
            setResources(resources);
        }
        else {
            globalAlert(CONSTANTS.ERROR, getResourceValue(resources, resourcesResult.data.status.toString()));
        }

        globalLoader(false);

    }

    const onOrgClicked = (org) => {
        if (props.contentBaskets && props.contentBaskets.length > 0 && props.orgId?.organization_id != org.organization_id) {
            setSelectedOrg(org);
            setConfirmModalOpen(true);
        } else {
            selectOrg(org);
        }
    }

    const onConfirmCloseModalFunc = (val) => {
        if (val) {
            changeContentBasket([]);
            selectOrg(selectedOrg);
        }
        setConfirmModalOpen(false);
    }

    const selectOrg = (org) => {
        globalLoader(true)
        SetOrg(org);
        setTimeout(() => {
            verifyRoute(props.history, '/dashboard');
        }, 50);
        changeViewType(CONTENT_VIEW_TYPES.ORIGINAL)
        changeParentCategoryId(null);
        changeCategoryId(null);
    }

    const renderOrg = (org) => {
        if (isSSOUser && clinicianOrg.indexOf(org.organization_id) == 0) {
            return null;
        }
        return (
            <li onClick={() => onOrgClicked(org)} style={{ cursor: "pointer" }} className="col-md-6 col-12 px-2" key={org.organization_id}>
                <div className="inner-wrapper text-center content-container shadow p-3  bg-white rounded">
                    <div className="p-4" >
                        <img src={`${GLOBAL_API}/${org?.brand_logo}`} alt="org-img" />
                        <h3 className="font-16 pt-3 font-600">{org?.name}</h3>
                    </div>
                </div>
            </li>
        )
    }
    
    return (
          <div>
            <div>
                <section className="">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-10 col-lg-8">
                                <div className="select-row">
                                    <h2 className="font-16 font-600 pb-3">{getResourceValue(resources, "SELECT_ORGANIZATION")}</h2>
                                    <ul className="org-list row px-2 list-unstyled">
                                        {props.userDetail?.organizations?.length > 0 &&
                                            props.userDetail?.organizations.map(org => (
                                                renderOrg(org)
                                            ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    {confirmModalOpen &&
                        <ConfirmationModal
                            resources={resources}
                            open={confirmModalOpen}
                            description={getResourceValue(resources, "CHANGE_ORG_CONFIRMATION")}
                            onCloseModal={onConfirmCloseModalFunc} />}
                </section>
            </div>

        </div>
    )


}

const mapStateToProps = state => ({
    userDetail: state.user.userDetail,
    orgId: state.user.orgId,
    languageId: state.common.languageId,
    contentBaskets: state.common.contentBaskets,
})

export default connect(mapStateToProps)(withRouter(SwitchOrganization));