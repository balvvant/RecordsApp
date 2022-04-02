-- default users
INSERT INTO `Users` (`UserID`, `UserRole`, `UserName`, `BTCAddress`, `EmailID`, `JabberID`, `AccountPassword`, `TelegramID`, `ActivationCodeID`, `ActivationStatus`, `UserToken`, `UserTokenExpiry`, `IsActive`, `CreatedAt`, `CreatedByID`, `ModifiedAt`,  `ModifiedByID`)
VALUES
	(1, 1, `UserName`, `BTCAddress`, `EmailID`, `JabberID`, `AccountPassword`, `TelegramID`,
	0, 'Paid', NULL, NULL, 1,'2021-07-07 06:24:51', 0, '2021-07-07 06:24:51', 0);
