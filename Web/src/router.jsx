import React, { useEffect, useState } from "react";
import { Switch, Route} from "react-router-dom";
import { connect } from "react-redux";

//common component
import NotFound from './Pages/notFound';
import SSOLogout from './Pages/ssoLogout';
import ResetPassowrd from './Pages/resetPassword';
import ActivateUser from './Pages/activateUser';
import SSO from './Pages/sso';
import Blogs from './Pages/blogs';
import BlogDetails from './Pages/blogDetails';
import StaticPage from './Pages/staticPage';
import Records from "./Pages/Records";
import ChangePassword from "./Pages/changePassword";
import EmailMessage from "./Pages/EmailMessage";
import SSOLink from "./Pages/ssoLink";
import HeaderContentComponent from "./Components/HeaderContentComponent";

// super admin component
import SuperAdminDashboard from "./Pages/SuperAdminDashboard";
import UserCategories from './Pages/UserCategories';
import MediaCategories from './Pages/MediaCategories';
import UploadMedia from './Pages/uploadMedia';
import Contents from './Pages/Contents';
import SuperAdminArchiveUsers from './Pages/SuperAdminArchiveUsers';
import ArchiveOrganisations from './Pages/ArchiveOrganisations';
import ArchiveUserCategories from './Pages/ArchiveUserCategories';
import ArchiveMediaCategories from './Pages/ArchiveMediaCategories';
import ArchiveContents from './Pages/ArchiveContents';
import AdminConfiguration from './Pages/AdminConfiguration';
import WebsiteMenus from './Pages/WebsiteMenus';
import CreateArticles from './Pages/CreateArticles';
import Languages from './Pages/Languages';
import LanguageResources from './Pages/LanguageResources';
import SuperAdminManageProfile from './Pages/SuperAdminManageProfile';
import SuperAdminOrganisations from './Pages/SuperAdminOrganisations';
import SuperAdminManageUsers from './Pages/SuperAdminManageUsers';
import SuperAdminCreateProfile from './Pages/SuperAdminCreateProfile'

// admin component
import AdminDashboard from "./Pages/AdminDashboard";
import AdminManageProfile from './Pages/AdminManageProfile';
import AdminOrganisation from './Pages/AdminOrganisation';
import AdminManageUsers from './Pages/AdminManageUsers';
import AdminArchiveUsers from './Pages/AdminArchiveUsers';
import SendContent from './Pages/sendContent';
import AdminCreateProfile from './Pages/AdminCreateProfile'

// clinician component
import ClinicianDashboard from "./Pages/ClinicianDashboard";
import ClinicianManageProfile from './Pages/ClinicianManageProfile';
import ClinicianDeleteAccount from './Pages/ClinicianDeleteAccount';
import ClinicianCreateProfile from './Pages/ClinicianCreateProfile';
import SwitchOrganization from './Pages/SwitchOrganization';

//patient component
import PatientManageProfile from './Pages/PatientManageProfile';
import PatientDeleteAccount from './Pages/PatientDeleteAccount';
import PatientDashboard from "./Pages/PatientDashboard";
import PatientCreateProfile from './Pages/PatientCreateProfile';
import Support from './Pages/support';

// mapping of component with its name
const FeatureComponentList = {
    //common
    'ResetPassowrd': ResetPassowrd,
    'Support': Support,
    'SSOLogout': SSOLogout,
    'SSO': SSO,
    'BlogDetails': BlogDetails,
    'Blogs': Blogs,

    // super admin
    'SuperAdminDashboard': SuperAdminDashboard,
    'SuperAdminManageProfile': SuperAdminManageProfile,
    'SuperAdminOrganisations': SuperAdminOrganisations,
    'SuperAdminCreateProfile': SuperAdminCreateProfile,
    'SuperAdminManageUsers': SuperAdminManageUsers,
    'SuperAdminArchiveUsers': SuperAdminArchiveUsers,
    'ArchiveOrganisations': ArchiveOrganisations,
    'ChangePassword': ChangePassword,
    'Languages': Languages,
    'LanguageResources': LanguageResources,
    'Records': Records,
    'UserCategories': UserCategories,
    'MediaCategories': MediaCategories,
    'UploadMedia': UploadMedia,
    'Contents': Contents,
    'ArchiveUserCategories': ArchiveUserCategories,
    'ArchiveMediaCategories': ArchiveMediaCategories,
    'ArchiveContents': ArchiveContents,
    'AdminConfiguration': AdminConfiguration,
    'WebsiteMenus': WebsiteMenus,
    'CreateArticles': CreateArticles,

    // admin
    'AdminDashboard': AdminDashboard,
    'AdminManageProfile': AdminManageProfile,
    'AdminManageUsers': AdminManageUsers,
    'AdminOrganisation': AdminOrganisation,
    'AdminArchiveUsers': AdminArchiveUsers,
    'SendContent': SendContent,
    'AdminCreateProfile':AdminCreateProfile,

    //clinician
    'ClinicianDashboard': ClinicianDashboard,
    'ClinicianManageProfile': ClinicianManageProfile,
    'ClinicianCreateProfile': ClinicianCreateProfile,
    'ClinicianDeleteAccount': ClinicianDeleteAccount,
    'SwitchOrganization': SwitchOrganization,
    'EmailMessage': EmailMessage,
    'SSOLink': SSOLink,

    //patient
    'PatientManageProfile': PatientManageProfile,
    'PatientDashboard': PatientDashboard,
    'PatientCreateProfile': PatientCreateProfile,
    'PatientDeleteAccount': PatientDeleteAccount,
};

const Router = (props) => {
  const [featuresList, setFeaturesList] = useState(props.routes);

  useEffect(() => {
    setFeaturesList(props.routes);
  }, [props.routes]);

  return (
    <Switch> 
      <Route exact path="/" component={HeaderContentComponent} />
      <Route path="/activate-user/:token" component={ActivateUser} />
      <Route path="/static-page/:resourceKey" component={StaticPage} />
      <Route path="/records" component={Records} />
      <Route path="/support" component={Support} />
      <Route path="/sso" component={SSO} />
      <Route path="/blogs" component={Blogs} />
      <Route path="/reset-password" component={ResetPassowrd} />
      <Route path="/blog-details" component={BlogDetails} />
      {/* Make all routes as per the features assigned for the user role */}
      {featuresList != null &&
        featuresList != "" &&
        featuresList.length > 0 &&
        featuresList.map((feature, index) =>
          /* check if the component exists for each feature */
          typeof FeatureComponentList[feature.component] != "undefined" ? (
            <Route
              exact
              key={index}
              path={feature.route_name}
              component={FeatureComponentList[feature.component]}
            />
          ) : null
        )}

      <Route path="*" component={NotFound} />
    </Switch>
  );
};

const mapStateToProps = (state) => ({
  routes: state.common.routes,
});

export default connect(mapStateToProps)(Router);
