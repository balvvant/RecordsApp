const express = require("express");
const router = express.Router();
const {RootApi, ErrorLogger, ViewLanguages, AddLanguage, EditLanguage, ActivateDeactivateLanguage, LogIn, ChangePassword, LogOut, DeactivateUserSessions, ViewWebsiteMenus, ViewStaticPages, SaveWebsiteMenu, UploadStaticPageImage, DeleteStaticPageImages, SaveStaticPage, GetLandingPageMenus, GetCustomPageData, ViewLanguageResources, ViewSingleResource, EditLanguageResources, ExportLanguageResources, UploadBulkResources, GetPageResources, ViewUploadedContent, ViewUploadedIcon, ViewUploadedAttachment, GetInvitationCodes, CreateInvitationCode, GetRecordsForBuying, GetUserRecords, GetUserRecordsbasedOnStatus, SaveRecords, BuyRecords, RegisterUser, PayRegistrationFee, CreateSupportTicket, UpdateSupportTicket, GetMySupportTickets, GetMySupportTicket, GetUsers, GetUserDetail, GetUserTransactions} = require("../controllers/Index");


router.route("/").get(RootApi).post(RootApi);
router.route("/error-logger").post(ErrorLogger);
router.route("/view-languages").post(ViewLanguages);
router.route("/add-language").post(AddLanguage);
router.route("/edit-language").post(EditLanguage);
router.route("/activate-deactivate-language").post(ActivateDeactivateLanguage);
router.route("/login").post(LogIn);
router.route("/change-password").post(ChangePassword);
router.route("/logout").post(LogOut);
router.route("/deactivate-user-session").post(DeactivateUserSessions);
router.route("/register-user").post(RegisterUser);
router.route("/pay-registration-fee").post(PayRegistrationFee);
router.route("/view-website-menus").post(ViewWebsiteMenus);
router.route("/view-static-pages").post(ViewStaticPages);
router.route("/save-website-menu").post(SaveWebsiteMenu);
router.route("/upload-static-page-image").post(UploadStaticPageImage);
router.route("/delete-static-page-images").post(DeleteStaticPageImages);
router.route("/save-static-page").post(SaveStaticPage);
router.route("/get-landing-page-menus").post(GetLandingPageMenus);
router.route("/get-custom-page-data").post(GetCustomPageData);
router.route("/view-resources").post(ViewLanguageResources);
router.route("/view-single-resource").post(ViewSingleResource);
router.route("/edit-resources").post(EditLanguageResources);
router.route("/export-resource-data").post(ExportLanguageResources);
router.route("/upload-resources").post(UploadBulkResources);
router.route("/get-page-resources").post(GetPageResources);
router.route("/uploads/:fileName").get(ViewUploadedContent);
router.route("/uploads/icons/:fileName").get(ViewUploadedIcon);
router.route("/uploads/attachment/:fileName").get(ViewUploadedAttachment);
router.route("/get-invitation-codes").post(GetInvitationCodes);
router.route("/create-invitation-code").post(CreateInvitationCode);
router.route("/get-records-for-buying").post(GetRecordsForBuying);
router.route("/get-user-records").post(GetUserRecords);
router.route("/get-user-records-based0n-status").post(GetUserRecordsbasedOnStatus);
router.route("/save-records").post(SaveRecords);
router.route("/buy-records").post(BuyRecords);
router.route("/create-support-ticket").post(CreateSupportTicket);
router.route("/update-support-ticket").post(UpdateSupportTicket);
router.route("/get-my-support-tickets").post(GetMySupportTickets);
router.route("/get-my-support-ticket").post(GetMySupportTicket);
router.route("/get-users").post(GetUsers);
router.route("/get-user").post(GetUserDetail);
router.route("/get-user-transactions").post(GetUserTransactions);


module.exports = router;

