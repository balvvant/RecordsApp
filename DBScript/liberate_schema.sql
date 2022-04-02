# ---------------------------------------------------------------
# Languages table

CREATE TABLE `languages` (
  `language_id` INT NOT NULL AUTO_INCREMENT,
  `language_name` VARCHAR(150) NOT NULL,
  `language_code` VARCHAR(45) NULL,
  `is_default` TINYINT(1) NULL DEFAULT 0,
  `is_active` TINYINT(1) NULL DEFAULT 1,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` INT NULL DEFAULT 0,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` INT NULL DEFAULT 0,
  PRIMARY KEY (`language_id`));


# Dump of table area_of_practice
# ------------------------------------------------------------

CREATE TABLE `specialities` (
  `specialty_id` int NOT NULL AUTO_INCREMENT COMMENT 'Specialty Id',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Specialty Name',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Specialty Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`specialty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table roles
# ------------------------------------------------------------

CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT COMMENT 'Role Id',
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Role Name',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Role Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table search_tags
# ------------------------------------------------------------

CREATE TABLE `search_tags` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Search Tag Id',
  `tag` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Search Tag',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Search tag Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table support_messages
# ------------------------------------------------------------

CREATE TABLE `support_messages` (
  `email` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Support Mailer Email',
  `message` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Support Mailer Message',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Support messages Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table unique_codes
# ------------------------------------------------------------

CREATE TABLE `unique_codes` (
  `code_id` int NOT NULL AUTO_INCREMENT COMMENT 'Code Id',
  `code_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Code Value',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Unique codes Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`code_id`),
  UNIQUE KEY `code_value` (`code_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


# Dump of table parent_categories
# ------------------------------------------------------------

CREATE TABLE `parent_categories` (
  `parent_category_id` int NOT NULL AUTO_INCREMENT COMMENT 'Deck Cat Id',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Deck Cat Name',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Deck Cat Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`parent_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table categories
# ------------------------------------------------------------

CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT COMMENT 'Deck Cat Id',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Deck Cat Name',
  `all` tinyint NOT NULL DEFAULT '0' COMMENT 'All Dec Category Name',
  `parent_category_id` int DEFAULT NULL,
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Deck Cat Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  
  PRIMARY KEY (`category_id`),
  KEY `parent_category_id` (`parent_category_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_category_id`) REFERENCES `parent_categories` (`parent_category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table organizations
# ------------------------------------------------------------

CREATE TABLE `organizations` (
  `organization_id` int NOT NULL AUTO_INCREMENT COMMENT 'Organization Id',
  `name` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization Name',
  `address` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization Address',
  `additional_address` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Organization Address Additional',
  `country` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization Country Code',
  `country_name` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization Country Name',
  `city` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization City',
  `zip_code` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization ZipCode',
  `brand_logo` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization Brand Logo',
  `copyright_text` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Powered by LiberateHealth' COMMENT 'Organization Copyright Text',
  `primary_color` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization Primary Color',
  `primary_font_color` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organization Primary Font Color',
  `invitation_type` enum('IMMEDIATELY', 'WITH_CONTENT') DEFAULT NULL COMMENT 'Patient Invitation Type',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Organization Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table category_organization_mapping
# ------------------------------------------------------------

CREATE TABLE `category_organization_mapping` (
  `organization_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Mapping Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  
  KEY `organization_id` (`organization_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `category_organization_mapping_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `category_organization_mapping_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table users
# ------------------------------------------------------------

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT 'User Id',
  `title` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User Title',
  `first_name` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User First Name',
  `last_name` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User Last Name',
  `mobile` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User Profile Mobile',
  `country` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User Country Code',
  `country_name` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User Country Name',
  `city` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User City',
  `zip_code` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User ZipCode',
  `profile_pic` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User Profile Pic',
  `date_of_birth` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Date of Birth',
  `email` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User Email',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User Password',
  `last_password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User Last Password',
  `otp` int DEFAULT NULL COMMENT 'One Time Password',
  `patient_tags` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activation_status` int NOT NULL DEFAULT '0' COMMENT 'Activation Status [1-Active 0-Inactive]',
  `nhs_number` varchar(400) DEFAULT NULL COMMENT 'NHS Number',
  `subscribed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Patient Subscription Status',
  `email_message` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT 'NGM0OTQyNDU1MjQwNzQ2NTQ4NDU0MDZjNzQ2ODQzNDA6ZWE1YThlYzExZjkyZWNlN2FjOWRjMWFjMGVlNDliYWQyODQyODMyNjM1MWY1ODE3ODBjMzRkMTg5Y2JmNjYxY2Q3MDA0Njc5OTk4Yzc4M2U0MmYxZjg1NjFlOWNmNzU0MzEyYmFhYzY3NWZlZWIyZjM1MzcxNWI1YjI2MTY4NDIyNmJlNGYwOThmYjA4MWRkN2I1MGRhMTRiNDRhMTZkZA==' COMMENT 'User Default Email Message',
  `job_title_id` int DEFAULT NULL,
  `specialty_id` int DEFAULT NULL,
  `opt_out` TINYINT NOT NULL DEFAULT '0',
  `opt_out_date` DATETIME DEFAULT NULL,
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'User Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


# Dump of table user_roles
# ------------------------------------------------------------

CREATE TABLE `user_roles` (
  `organization_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Mapping Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  
  KEY `organization_id` (`organization_id`),
  KEY `user_id` (`user_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


# Dump of table user_sessions
# ------------------------------------------------------------

CREATE TABLE `user_sessions` (
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `refresh_token` varchar(255) NOT NULL,
  `device` varchar(255) NOT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `created_by_id` int DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table configuration
# ------------------------------------------------------------

CREATE TABLE `configuration` (
  `configuration_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Configuration Key',
  `configuration_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Configuration Value',
  `can_modify` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Can modify -> true, can not modify -> false)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Status (Active or Inactive)',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table features
# ------------------------------------------------------------

CREATE TABLE `features` (
  `feature_id` int NOT NULL AUTO_INCREMENT COMMENT 'feature Id',
  `route_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Route Name',
  `component` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Component',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Mapping Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`feature_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Dump of table job_titles
# ------------------------------------------------------------

CREATE TABLE `job_titles` (
  `job_title_id` int NOT NULL AUTO_INCREMENT COMMENT 'Job Title Id',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Job Title Name',
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Job Title Status [1-Active 0-Inactive]',
  
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  PRIMARY KEY (`job_title_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


# Dump of table request_logs
# ------------------------------------------------------------

CREATE TABLE `request_logs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Request Id',
  `method_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Request Portal',
  `method_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Request Method',
  `system_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'System information',
  `error_stake` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Error Stack Details',
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Request logs Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table role_features
# ------------------------------------------------------------

CREATE TABLE `role_features` (
  `role_id` int DEFAULT NULL,
  `feature_id` int DEFAULT NULL,
  `is_active` int NOT NULL DEFAULT '1' COMMENT 'Mapping Status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  
  KEY `role_id` (`role_id`),
  KEY `feature_id` (`feature_id`),
  CONSTRAINT `role_features_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `role_features_ibfk_2` FOREIGN KEY (`feature_id`) REFERENCES `features` (`feature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# ---------------------------------------------------------------
# resource groups

CREATE TABLE `resource_groups` (
  `group_id` INT NOT NULL AUTO_INCREMENT,
  `group_name` VARCHAR(150) NOT NULL,
  `group_description` TEXT(500) NULL,
  `is_active` TINYINT(1) NULL DEFAULT 1,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` INT NULL DEFAULT 0,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` INT NULL DEFAULT 0,
  PRIMARY KEY (`group_id`));

# ------------------------------------------------------------------
# resource keys

CREATE TABLE `resource_keys` (
  `resource_key_id` INT NOT NULL AUTO_INCREMENT,
  `resource_key` VARCHAR(250) NOT NULL,
  `group_id` INT NULL,
  `is_required` TINYINT(1) NULL DEFAULT 0,
  `min_length` INT NULL DEFAULT 0,
  `max_length` INT NULL DEFAULT 0,
  `is_active` TINYINT(1) NULL DEFAULT 1,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` INT NULL DEFAULT 0,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` INT NULL DEFAULT 0,
  PRIMARY KEY (`resource_key_id`),
  INDEX `group_id_idx` (`group_id` ASC),
  CONSTRAINT `group_id`
    FOREIGN KEY (`group_id`)
    REFERENCES `resource_groups` (`group_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);


# -------------------------------------------------------------------
# resources 

CREATE TABLE `resources` (
  `resource_id` INT NOT NULL AUTO_INCREMENT,
  `resource_key_id` INT NOT NULL,
  `language_id` INT NOT NULL,
  `resource_value` TEXT NULL,
  `place_holder_value` TEXT NULL,
  `info_value` TEXT(500) NULL,
  `is_active` TINYINT(1) NULL DEFAULT 1,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` INT NULL DEFAULT 0,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` INT NULL DEFAULT 0,
  PRIMARY KEY (`resource_id`),
  INDEX `resource_key_id_idx` (`resource_key_id` ASC),
  INDEX `language_id_idx` (`language_id` ASC),
  CONSTRAINT `resource_key_id`
    FOREIGN KEY (`resource_key_id`)
    REFERENCES `resource_keys` (`resource_key_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `language_id`
    FOREIGN KEY (`language_id`)
    REFERENCES `languages` (`language_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
);

# -------------------------------------------------------------------
# email_templates 


CREATE TABLE `email_templates` (
  `email_template_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `cc_email_ids` varchar(255) DEFAULT NULL,
  `bcc_email_ids` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` int DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` int DEFAULT '0',
  PRIMARY KEY (`email_template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# -------------------------------------------------------------------
# email_template_i18n 

CREATE TABLE `email_template_i18n` (
  `email_template_id` int NOT NULL,
  `language_id` int NOT NULL,
  `subject` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_data` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` int DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# -------------------------------------------------------------------
# tags 


CREATE TABLE `patient_tags` (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `organization_id` int DEFAULT NULL,
  `tag_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` int DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` int DEFAULT '0',
  PRIMARY KEY (`tag_id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `patient_tags_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# -------------------------------------------------------------------
# website menu 

CREATE TABLE `website_menu` (
  `website_menu_id` int NOT NULL AUTO_INCREMENT,
  `menu_type` int DEFAULT NULL COMMENT '1= header, 2= footer, 3= slider',
  `image_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `menu_group_id` int DEFAULT NULL COMMENT 'null incase of menu_type= 1,3 and group_id in case of footer',
  `parent_menu_id` int DEFAULT NULL,
  `menu_resourcekey_id` int DEFAULT NULL,
  `sequence_no` tinyint DEFAULT NULL,
  `menu_source` tinyint DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` int DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` int DEFAULT '0',
  PRIMARY KEY (`website_menu_id`),
  KEY `menu_resourcekey_id` (`menu_resourcekey_id`),
  CONSTRAINT `website_menu_ibfk_1` FOREIGN KEY (`menu_resourcekey_id`) REFERENCES `resource_keys` (`resource_key_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# blogs

CREATE TABLE `blogs` (
  `blog_id` int NOT NULL AUTO_INCREMENT,
  `menu_resourcekey_id` int NOT NULL,
  `image_name` varchar(250) DEFAULT NULL,
  `author_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`blog_id`),
  KEY `menu_resourcekey_id` (`menu_resourcekey_id`),
  CONSTRAINT `blogs_ibfk_1` FOREIGN KEY (`menu_resourcekey_id`) REFERENCES `resource_keys` (`resource_key_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# contents

CREATE TABLE `contents` (
  `content_id` int NOT NULL AUTO_INCREMENT,
  `content_type_key` varchar(30) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `admin_notes` varchar(255) DEFAULT NULL,
  `content_created_by` varchar(255) DEFAULT NULL,
  `content_created_on` datetime NOT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `search_tags` varchar(255) DEFAULT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT '0',
  `locked_code` varchar(30) DEFAULT NULL,
  `category_id` int NOT NULL,
  `is_guidance_info` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`content_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# content_i18n

CREATE TABLE `content_i18n` (
  `content_id` int NOT NULL,
  `language_id` int NOT NULL,
  `content_title` varchar(255) NOT NULL,
  `pdf_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  CONSTRAINT `content_i18n_ibfk_1`
    FOREIGN KEY (`content_id`)
    REFERENCES `contents` (`content_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `content_i18n_ibfk_2`
    FOREIGN KEY (`language_id`)
    REFERENCES `languages` (`language_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# content_files

CREATE TABLE `content_files` (
  `content_id` int NOT NULL,
  `language_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(30) NOT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT '0',
  `view_order` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  CONSTRAINT `content_files_ibfk_1`
    FOREIGN KEY (`content_id`)
    REFERENCES `contents` (`content_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `content_files_ibfk_2`
    FOREIGN KEY (`language_id`)
    REFERENCES `languages` (`language_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# content_links

CREATE TABLE `content_links` (
  `content_link_id` int NOT NULL AUTO_INCREMENT,
  `content_id` int NOT NULL,
  `language_id` int NOT NULL,
  `display_text` varchar(255) NOT NULL,
  `display_url` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`content_link_id`),
  CONSTRAINT `content_links_ibfk_1`
    FOREIGN KEY (`content_id`)
    REFERENCES `contents` (`content_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `content_links_ibfk_2`
    FOREIGN KEY (`language_id`)
    REFERENCES `languages` (`language_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# clinician_contents

CREATE TABLE `clinician_contents` (
  `clinician_content_id` int NOT NULL AUTO_INCREMENT,
  `content_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `content_id` int NOT NULL,
  `content_type_key` varchar(30) DEFAULT NULL,
  `is_original` tinyint(1) NOT NULL DEFAULT '0',
  `is_favorite` tinyint(1) NOT NULL DEFAULT '0',
  `is_content_saved` tinyint(1) NOT NULL DEFAULT '0',
  `user_id` int NOT NULL,
  `language_id` int NOT NULL DEFAULT '0',
  `time_spent` int NOT NULL,
  `organization_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`clinician_content_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# clinician_content_files

CREATE TABLE `clinician_content_files` (
  `clinician_content_file_id` int NOT NULL AUTO_INCREMENT,
  `clinician_content_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`clinician_content_file_id`),
  CONSTRAINT `clinician_content_files_ibfk_1`
    FOREIGN KEY (`clinician_content_id`)
    REFERENCES `clinician_contents` (`clinician_content_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# clinician_content_modified_files

CREATE TABLE `clinician_content_modified_files` (
  `clinician_content_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT '0',
  `view_order` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  CONSTRAINT `clinician_content_modified_files_ibfk_1`
    FOREIGN KEY (`clinician_content_id`)
    REFERENCES `clinician_contents` (`clinician_content_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# patient_contents

CREATE TABLE `patient_contents` (
  `patient_content_id` int NOT NULL AUTO_INCREMENT,
  `clinician_user_id` int NOT NULL,
  `patient_user_id` int NOT NULL,
  `clinician_content_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`patient_content_id`),
  CONSTRAINT `patient_contents_ibfk_1`
    FOREIGN KEY (`clinician_content_id`)
    REFERENCES `clinician_contents` (`clinician_content_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# patient_contents

CREATE TABLE `patient_content_attachments` (
  `patient_content_attachment_id` int NOT NULL AUTO_INCREMENT,
  `patient_content_id` int NOT NULL,
  `content_id` int DEFAULT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`patient_content_attachment_id`),
  CONSTRAINT `patient_content_attachments_ibfk_1` 
    FOREIGN KEY (`patient_content_id`) 
    REFERENCES `patient_contents` (`patient_content_id`) 
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# patient_content_visits

CREATE TABLE `patient_content_visits` (
  `patient_content_id` int NOT NULL,
  `clinician_content_file_id` int NOT NULL,
  `time_spent` int DEFAULT NULL,
  `is_full_viewed` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '1',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '1',
  CONSTRAINT `patient_content_visits_ibfk_2` 
    FOREIGN KEY (`patient_content_id`) 
    REFERENCES `patient_contents` (`patient_content_id`) 
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# patient_content_link_visits

CREATE TABLE `patient_content_link_visits` (
  `content_link_id` int NOT NULL,
  `patient_content_id` int NOT NULL,
  `patient_content_attachment_id` int DEFAULT NULL,
  `time_spent` int DEFAULT NULL,
  `is_full_viewed` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  CONSTRAINT `patient_content_link_visits_ibfk_2` 
    FOREIGN KEY (`patient_content_id`) 
    REFERENCES `patient_contents` (`patient_content_id`) 
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

# -------------------------------------------------------------------
# patient_content_attachment_visits

CREATE TABLE `patient_content_attachment_visits` (
  `patient_content_attachment_id` int NOT NULL,
  `time_spent` int NOT NULL,
  `is_full_viewed` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  CONSTRAINT `patient_content_attachment_visits_ibfk_1` 
    FOREIGN KEY (`patient_content_attachment_id`) 
    REFERENCES `patient_content_attachments` (`patient_content_attachment_id`) 
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


# -------------------------------------------------------------------
# user_category_visits

CREATE TABLE `user_category_visits` (
  `user_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `organization_id` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Clinician visits status [1-Active 0-Inactive]',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who created',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int NOT NULL DEFAULT '0' COMMENT 'User who updated',
  CONSTRAINT `user_category_visits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_category_visits_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_category_visits_ibfk_3` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


# -------------------------------------------------------------------
# user_content_statuses

CREATE TABLE `user_content_statuses` (
  `user_id` int NOT NULL,
  `content_id` int NOT NULL,
  `organization_id` int NOT NULL,
  `is_unlocked` tinyint(1) NOT NULL DEFAULT '0',
  `is_favorite` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `created_by_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `updated_by_id` int NOT NULL DEFAULT '0',
  CONSTRAINT `user_content_statuses_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `contents` (`content_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_content_statuses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_content_statuses_ibfk_3` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;