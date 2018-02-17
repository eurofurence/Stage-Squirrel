--
-- Table structure for table `sq_configuration`
--

DROP TABLE IF EXISTS `sq_configuration`;
CREATE TABLE `sq_configuration` (
  `configuration_id` int(11) NOT NULL AUTO_INCREMENT,
  `configuration_title` varchar(100) NOT NULL,
  `configuration_key` varchar(45) NOT NULL,
  `configuration_value` varchar(100) NOT NULL,
  PRIMARY KEY (`configuration_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_conventions`
--

DROP TABLE IF EXISTS `sq_conventions`;
CREATE TABLE `sq_conventions` (
  `convention_id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) DEFAULT NULL,
  `convention_name` varchar(60) DEFAULT NULL,
  `convention_description` varchar(255) DEFAULT NULL,
  `date_from` date DEFAULT NULL,
  `date_to` date DEFAULT NULL,
  PRIMARY KEY (`convention_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_event_customs`
--

DROP TABLE IF EXISTS `sq_event_customs`;
CREATE TABLE `sq_event_customs` (
  `event_id` int(11) NOT NULL,
  `custom_id` int(11) DEFAULT NULL,
  `version` int(11) DEFAULT NULL,
  `custom_value` varchar(1024) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_event_details`
--

DROP TABLE IF EXISTS `sq_event_details`;
CREATE TABLE `sq_event_details` (
  `event_id` int(11) NOT NULL,
  `event_version` int(11) NOT NULL,
  `stage_id` int(11) DEFAULT NULL,
  `creator_id` int(11) DEFAULT NULL,
  `event_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `event_title` varchar(60) NOT NULL,
  `event_description` varchar(1024) DEFAULT NULL,
  `event_explaination` varchar(1024) DEFAULT NULL,
  `event_categories` varchar(45) DEFAULT NULL,
  `event_day` date DEFAULT NULL,
  `event_time_pre` int(11) DEFAULT NULL,
  `event_time_post` int(11) DEFAULT NULL,
  `event_time_dur` int(11) DEFAULT NULL,
  PRIMARY KEY (`event_id`,`event_version`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_events`
--

DROP TABLE IF EXISTS `sq_events`;
CREATE TABLE `sq_events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `convention_id` int(11) DEFAULT NULL,
  `event_max_version` int(11) DEFAULT '1',
  `event_confirmed_version_manager` int(11) DEFAULT NULL,
  `event_confirmed_version_creator` int(11) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `event_id_UNIQUE` (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_form_elements`
--

DROP TABLE IF EXISTS `sq_form_elements`;
CREATE TABLE `sq_form_elements` (
  `element_id` int(11) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `element_type` int(11) DEFAULT NULL,
  `element_label` varchar(128) DEFAULT NULL,
  `element_value` varchar(1024) DEFAULT NULL,
  `element_tags` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`element_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_form_templates`
--

DROP TABLE IF EXISTS `sq_form_templates`;
CREATE TABLE `sq_form_templates` (
  `template_id` int(11) NOT NULL,
  `template_name` varchar(45) DEFAULT NULL,
  `template_description` varchar(45) DEFAULT NULL,
  `template_created` datetime DEFAULT NULL,
  `template_changed` datetime DEFAULT NULL,
  PRIMARY KEY (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_login_attempts`
--

DROP TABLE IF EXISTS `sq_login_attempts`;
CREATE TABLE `sq_login_attempts` (
  `attempt_id` int(11) NOT NULL AUTO_INCREMENT,
  `attempt_ip` varchar(45) DEFAULT NULL,
  `attempt_count` int(11) DEFAULT NULL,
  `attempt_last_try` datetime DEFAULT NULL,
  `attempt_banned_until` datetime DEFAULT NULL,
  PRIMARY KEY (`attempt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_map_convention_to_stage`
--

DROP TABLE IF EXISTS `sq_map_convention_to_stage`;
CREATE TABLE `sq_map_convention_to_stage` (
  `convention_id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL,
  PRIMARY KEY (`convention_id`,`stage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_map_riders_to_roles`
--

DROP TABLE IF EXISTS `sq_map_riders_to_roles`;
CREATE TABLE `sq_map_riders_to_roles` (
  `event_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `content` varchar(45) DEFAULT NULL,
  `responsible_id` int(11) DEFAULT NULL,
  `confirmed_version_manager` int(11) DEFAULT NULL,
  `confirmed_version_responsible` int(11) DEFAULT NULL,
  `version` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`event_id`,`version`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_map_user_to_role`
--

DROP TABLE IF EXISTS `sq_map_user_to_role`;
CREATE TABLE `sq_map_user_to_role` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `notification` int(11) DEFAULT '0',
  `notification_creator_only` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_notifications`
--

DROP TABLE IF EXISTS `sq_notifications`;
CREATE TABLE `sq_notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` int(11) DEFAULT NULL,
  `event_id` int(11) DEFAULT NULL,
  `convention_id` int(11) DEFAULT NULL,
  `version_id` int(11) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_on` datetime DEFAULT NULL,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_rider_comments`
--

DROP TABLE IF EXISTS `sq_rider_comments`;
CREATE TABLE `sq_rider_comments` (
  `comment_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `comment_value` varchar(512) DEFAULT NULL,
  `affected_roles` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`comment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_rider_contacts`
--

DROP TABLE IF EXISTS `sq_rider_contacts`;
CREATE TABLE `sq_rider_contacts` (
  `event_id` int(11) NOT NULL,
  `contact_nick` varchar(45) DEFAULT NULL,
  `contact_function` varchar(45) DEFAULT NULL,
  `contact_mobile` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_rider_stagebox`
--

DROP TABLE IF EXISTS `sq_rider_stagebox`;
CREATE TABLE `sq_rider_stagebox` (
  `event_id` int(11) NOT NULL,
  `event_version` int(11) NOT NULL,
  `stagebox_channel` int(11) NOT NULL,
  `stagebox_label` varchar(45) DEFAULT NULL,
  `stagebox_subcore` varchar(45) DEFAULT NULL,
  `stagebox_48v` varchar(45) DEFAULT NULL,
  `stagebox_viadi` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`event_id`,`event_version`,`stagebox_channel`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_riders`
--

DROP TABLE IF EXISTS `sq_riders`;
CREATE TABLE `sq_riders` (
  `event_id` int(11) NOT NULL,
  `creator_id` int(11) DEFAULT NULL,
  `creator_mobile` varchar(45) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `manager_mobile` varchar(45) DEFAULT NULL,
  `crew_lxd` varchar(45) DEFAULT NULL,
  `crew_lx1` varchar(45) DEFAULT NULL,
  `crew_lx2` varchar(45) DEFAULT NULL,
  `crew_a1` varchar(45) DEFAULT NULL,
  `crew_a2` varchar(45) DEFAULT NULL,
  `crew_a3` varchar(45) DEFAULT NULL,
  `crew_stagedecktech` varchar(45) DEFAULT NULL,
  `crew_bananassetup` varchar(45) DEFAULT NULL,
  `crew_bananasshow` varchar(45) DEFAULT NULL,
  `crew_bananasbreakdown` varchar(45) DEFAULT NULL,
  `startdate` datetime DEFAULT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_role`
--

DROP TABLE IF EXISTS `sq_role`;
CREATE TABLE `sq_role` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_title` varchar(60) DEFAULT NULL,
  `role_description` varchar(255) DEFAULT NULL,
  `role_is_admin` int(11) DEFAULT '0',
  `role_is_manager` int(11) DEFAULT '0',
  `role_is_default` int(11) DEFAULT '0',
  `role_is_active` int(11) DEFAULT '1',
  `role_is_creator` int(11) DEFAULT '0',
  `role_glyphicon` varchar(45) DEFAULT NULL,
  `role_controls_stagebox` int(11) DEFAULT '0',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_id_UNIQUE` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_stage`
--

DROP TABLE IF EXISTS `sq_stage`;
CREATE TABLE `sq_stage` (
  `stage_id` int(11) NOT NULL AUTO_INCREMENT,
  `stage_name` varchar(60) DEFAULT NULL,
  `stage_description` varchar(255) NOT NULL,
  `stage_from` datetime DEFAULT NULL,
  `stage_to` datetime DEFAULT NULL,
  PRIMARY KEY (`stage_id`),
  UNIQUE KEY `stage_id_UNIQUE` (`stage_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

--
-- Table structure for table `sq_user`
--

DROP TABLE IF EXISTS `sq_user`;
CREATE TABLE `sq_user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(45) DEFAULT NULL,
  `user_mail` varchar(100) NOT NULL,
  `user_password` varchar(100) DEFAULT NULL,
  `user_telegram_id` varchar(15) DEFAULT '0',
  `user_telegram_linked` int(11) DEFAULT '0',
  `user_telegram_active` int(11) DEFAULT NULL,
  `user_telegram_confirmation_valid_to` datetime DEFAULT NULL,
  `user_telegram_confirmation_key` varchar(45) DEFAULT NULL,
  `user_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_last_login` datetime DEFAULT NULL,
  `user_active` int(11) DEFAULT '1',
  `user_mobile` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`),
  UNIQUE KEY `user_mail_UNIQUE` (`user_mail`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


INSERT INTO `sq_configuration` (`configuration_id`,`configuration_title`,`configuration_key`,`configuration_value`) VALUES (1,'Maximum Attempts for correct credentials till ban','MAX_LOGIN_ATTEMPTS','5');
INSERT INTO `sq_configuration` (`configuration_id`,`configuration_title`,`configuration_key`,`configuration_value`) VALUES (2,'Time till an ip ban runs out','TIME_IP_BAN','30');
INSERT INTO `sq_configuration` (`configuration_id`,`configuration_title`,`configuration_key`,`configuration_value`) VALUES (3,'Time till server forgets login attempts by ip','TIME_IP_ATTEMPT','30');
INSERT INTO `sq_configuration` (`configuration_id`,`configuration_title`,`configuration_key`,`configuration_value`) VALUES (4,'Authentification type (0 = No confirmation, 1 = Admin must confirm)','AUTH_CONFIRMATION','1');
INSERT INTO `sq_configuration` (`configuration_id`,`configuration_title`,`configuration_key`,`configuration_value`) VALUES (5,'Enable DoubleOptIn when signup (0 = disable, 1 = enable)','AUTH_DOUBLEOPTIN','1');
INSERT INTO `sq_configuration` (`configuration_id`,`configuration_title`,`configuration_key`,`configuration_value`) VALUES (6,'Sets Telegram Bot API Token. Setting to nothing deactivates the bot.','TELEGRAM_API_TOKEN','');
INSERT INTO `sq_configuration` (`configuration_id`,`configuration_title`,`configuration_key`,`configuration_value`) VALUES (7,'Sets the Telegram Bot Name to the real telegram name.','TELEGRAM_BOT_NAME','');

INSERT INTO `sq_conventions` (`convention_id`,`template_id`,`convention_name`,`convention_description`,`date_from`,`date_to`) VALUES (1,1,'Eurofurence 23','Convention for Eurofurence 2017 with theme Ancient Egypt','2017-08-16','2017-08-20');

INSERT INTO `sq_role` (`role_id`,`role_title`,`role_description`,`role_is_admin`,`role_is_manager`,`role_is_default`,`role_is_active`,`role_is_creator`,`role_glyphicon`,`role_controls_stagebox`) VALUES (1,'Administrator','can change global settings and edit users',1,1,0,1,1,NULL,0);
INSERT INTO `sq_role` (`role_id`,`role_title`,`role_description`,`role_is_admin`,`role_is_manager`,`role_is_default`,`role_is_active`,`role_is_creator`,`role_glyphicon`,`role_controls_stagebox`) VALUES (2,'Stage Manager','can confirm event requests',0,1,0,1,1,NULL,0);
INSERT INTO `sq_role` (`role_id`,`role_title`,`role_description`,`role_is_admin`,`role_is_manager`,`role_is_default`,`role_is_active`,`role_is_creator`,`role_glyphicon`,`role_controls_stagebox`) VALUES (3,'Event Manager','can create events',0,0,0,1,1,NULL,0);
INSERT INTO `sq_role` (`role_id`,`role_title`,`role_description`,`role_is_admin`,`role_is_manager`,`role_is_default`,`role_is_active`,`role_is_creator`,`role_glyphicon`,`role_controls_stagebox`) VALUES (4,'Member','can only view the application',0,0,1,1,0,NULL,0);
INSERT INTO `sq_role` (`role_id`,`role_title`,`role_description`,`role_is_admin`,`role_is_manager`,`role_is_default`,`role_is_active`,`role_is_creator`,`role_glyphicon`,`role_controls_stagebox`) VALUES (10,'Audio','is member of the audio team',0,0,0,1,0,'music',1);
INSERT INTO `sq_role` (`role_id`,`role_title`,`role_description`,`role_is_admin`,`role_is_manager`,`role_is_default`,`role_is_active`,`role_is_creator`,`role_glyphicon`,`role_controls_stagebox`) VALUES (11,'Video','is member of the video team',0,0,0,1,0,'facetime-video',0);
INSERT INTO `sq_role` (`role_id`,`role_title`,`role_description`,`role_is_admin`,`role_is_manager`,`role_is_default`,`role_is_active`,`role_is_creator`,`role_glyphicon`,`role_controls_stagebox`) VALUES (12,'Light','is member of the light team',0,0,0,1,0,'lamp',0);
INSERT INTO `sq_role` (`role_id`,`role_title`,`role_description`,`role_is_admin`,`role_is_manager`,`role_is_default`,`role_is_active`,`role_is_creator`,`role_glyphicon`,`role_controls_stagebox`) VALUES (13,'Backstage','is member of the backstage team',0,0,0,1,0,'wrench',0);

INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (1,1,NULL,NULL,1,'Important contacts on your end','Anyone we need to know about?',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (2,1,1,NULL,8,'Function;Nick;Mobile(int. notation);E-Mail',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (3,1,2,NULL,3,NULL,'Event-Manager',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (4,1,2,NULL,3,NULL,'Nick',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (5,1,2,NULL,3,NULL,'+1 555 123 1234',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (6,1,2,NULL,3,NULL,'test@mail.org',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (7,1,NULL,NULL,1,'Do you need help?','Do you need a hand during setup, show or breakdown? We know some volunteers who like to help on stagerelated things! (Move stuff to, on or off the stage, deco....). Aprox. no. of volunteers you need during:',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (8,1,7,NULL,8,NULL,NULL,'no-expand');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (9,1,8,NULL,2,'Setup hands',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (10,1,8,NULL,3,NULL,'0',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (11,1,8,NULL,2,'to do',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (12,1,8,NULL,3,NULL,NULL,'multiline');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (13,1,7,NULL,8,NULL,NULL,'no-expand');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (14,1,13,NULL,2,'Stage hands',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (15,1,13,NULL,3,NULL,'0',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (16,1,13,NULL,2,'to do',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (17,1,13,NULL,3,NULL,NULL,'multiline');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (18,1,7,NULL,8,NULL,NULL,'no-expand');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (19,1,18,NULL,2,'Breakdown hands',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (20,1,18,NULL,3,NULL,'0',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (21,1,18,NULL,2,'to do',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (22,1,18,NULL,3,NULL,NULL,'multiline');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (23,1,NULL,10,1,'Microphones','Microphones: Please specify your demand on microphones provides by us',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (24,1,23,10,8,'Microphone type;Application;Nick (if known yet);In fursuit?',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (25,1,24,10,4,NULL,'-;Headset, wireless;Hand, wireless;Hand, wired',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (26,1,24,10,3,NULL,'speaker',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (27,1,24,10,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (28,1,24,10,4,NULL,'-;No;Yes;Yes, I know what I\'m doing',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (29,1,NULL,10,1,'Instruments & equipment','Do you bring any instruments, laptops, ipods or other kinds of eqipment that need to get on the PA?\n\nDo you bring any instruments, laptops, ipods or other kinds of eqipment that need to get on the PA?\n\n',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (30,1,29,10,8,'Equipment;Connection;Make / Model;Owner (Nick)',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (31,1,30,10,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (32,1,30,10,4,NULL,'-;3,5mm TRS (Stereo);3,5mm TS (Mono);6,35mm TRS (Stereo);6,35mm TS (Mono);2x 6,35mm TS (L+R);2x 6,35mm TS (L+R);Analog-XLR;AES-XLR;I don\'t know',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (33,1,30,10,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (34,1,30,10,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (35,1,NULL,10,1,'Wireless equipment','Bring any wireless equipment? Please specify its transmitting frequency range and make/model. We will check this against german law, our own equipment and get back to you if we see any incoming problems.',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (36,1,35,10,8,'Make & Model;Transmitting frequency ranges;Amount / Channels used',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (37,1,36,10,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (38,1,36,10,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (39,1,36,10,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (40,1,NULL,10,1,'Monitoring','Do you bring any instruments, laptops, ipods or other kinds of eqipment that need to get on the PA?',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (41,1,40,10,8,'Channel;Monitor Type;Target (Instrument, Nick, ...)',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (42,1,41,10,9,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (43,1,41,10,4,NULL,'I don\'t care;Wedge (Lying on floor)(Stereo);Two Wedges  (Lying on floor);Drumfill;In ear (I will bring my own system, connected by XLR);In ear (I will bring my own system, connected by TRS);Something else',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (44,1,41,10,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (45,1,NULL,11,1,'Effects and specials','Please check the following questions. If you have any specific needs regarding light, don\'t hesitate do describe them at the end of this section and get in touch with us directly.\n\nPlease check the following questions. If you have any specific needs regarding light, don\'t hesitate do describe them at the end of this section and get in touch with us directly.\n\nPlease check the following questions. If you have any specific needs regarding light, don\'t hesitate do describe them at the end of this section and get in touch with us directly.\n\n',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (46,1,45,11,7,'Will you walk through the audience?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (47,1,45,11,7,'What about a followspot?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (48,1,45,11,7,'Do you need a smokemachine effect? (Smoke produces sightblocking fume)','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (49,1,45,11,7,'Do you need a haze effect? (This mostly makes lightbeams visible)','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (50,1,45,11,7,'Do you need \"disco lights\" synced to music?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (51,1,NULL,11,1,'Freeform','As light is a rather complex theme to put in a form, here is your place to write about anything special we should know about. This also could be: \"I just need a bright stage so everyone can see me.\"',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (52,1,51,11,3,NULL,NULL,'multiline');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (53,1,NULL,NULL,1,'Your own equipment','If you plan to bring any equipment along we need to know if we have to prepare for any incompatibilities.\n\nPlease keep in mind that in germany there is a 230v powergrid. While a conversion to 110v is indeed possible it only is affordable for lowpower devices < 100Watts.',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (54,1,53,NULL,8,'Type of device?;Make & Model, if applicable:;Bought in country: (We need to know the plug)',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (55,1,54,NULL,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (56,1,54,NULL,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (57,1,54,NULL,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (58,1,NULL,12,1,'Live Video','Frontup projections, several inhouse screens and stagemonitors need your attention, too:',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (59,1,58,12,7,'Do you think the event should be broadcasted to the projections?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (60,1,58,12,4,'What style of live-videofeed seems best for the event?','Normal feed from Videoteam (Multiple camera angles);One fixed perspective (eg. whole stage only);Something else (Specify in freeform below)',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (61,1,58,12,7,'Do you need a camera on stage to show details or closeups to the audience?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (62,1,58,12,7,'Will you bring any overlay graphics to be displayed on the live video feed?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (63,1,58,12,7,'Will you bring any other media? Videoclips, PDF, pictures and the like?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (64,1,58,12,7,'Will there be an audioplayback?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (65,1,58,12,10,NULL,'If you answered any of the last three questions with yes, please describe your media and it\'s format as close as possible in the following table.',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (66,1,NULL,12,1,'Videoclips, pictures, PDF and audio playout','Note: The projections native format will be 1280x720p25 (thats 16:9). If you create any content, let it be video or pictures, try to create it within these dimensions.\n\nAny content needs to be on site and handed over to screenoperations at least 1 day prior to your event. Coordinate the when and where with Mendra on Telegram: @MendraDragon or via the EFforum, user: Mendra. Even though the theme of this years EF is \"Back to the 80s!\" we can\'t accept any LPs, SPs, Laserdiscs nor any magnetical media besides harddiskdrives :)',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (67,1,66,12,3,NULL,NULL,'multiline');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (68,1,NULL,12,1,'Main projections','Is there anything else that needs to be connected to the main projections?',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (69,1,68,12,7,'Will you need VJanimations at some point of your perfomance displayed on projection?','Yes;No',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (70,1,NULL,12,1,'Own videosources','Need a laptop or another type of videosource on the main projections? Injection point is at FOH.\n\nDoes this device also needs to be hooked up to audio? Don\'t forget to list it under \"Audio: Instruments & equipment\" above.',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (71,1,70,12,8,'Type of device?;Make & Model:;Connected to projectors via:',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (72,1,71,12,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (73,1,71,12,3,NULL,NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (74,1,71,12,4,NULL,'VGA;DVI;HDMI;(HD)SDI',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (75,1,NULL,12,1,'Screens on stage','By default there are three screens on stage (Left, middle and right). You can choose what to do with them:',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (76,1,75,12,4,'What feed should be shown on ALL screens?','Same as main projections;Only live video;Own source at stage (VGA preferred);Own source from FOH (VGA preferred)',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (77,1,75,12,4,'Left (looking at stage) screen should be:','facing the stage;facing the audience;removed',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (78,1,75,12,4,'Middle (looking at stage) screen should be:','facing the stage;facing the audience;removed',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (79,1,75,12,4,'Right (looking at stage) screen should be:','facing the stage;facing the audience;removed',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (80,1,NULL,13,1,'General','Some really important things you probably have forgotten about',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (81,1,80,13,7,'Do you need something to drink during your show? (Still water and a glas per person)','Yes;no',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (82,1,80,13,6,'If yes: onstage and/or backstage?','Onstage;Backstage',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (83,1,80,13,3,'If yes: For how many people?',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (84,1,80,13,7,'Do you need a place to store or prepare things backstage?','Yes;no',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (85,1,80,13,4,'If yes: Specify aproximate size','Table 200x100cm;2x Table 200x100cm;Floor 200x200cm',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (86,1,80,13,7,'Does your perfomance include fursuiters?','Yes;no',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (87,1,80,13,3,'If yes: How many of those big fans (Airrelated ones, sorry) will you need?',NULL,NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (88,1,NULL,13,1,'Freeform','If there are any other backstagerelated things we need to know, this is your place to tell them:',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (89,1,88,13,3,NULL,NULL,'multiline');
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (90,1,NULL,NULL,1,'Freeform','if you feel that something is missing and we totally need to know about that, go ahead:',NULL);
INSERT INTO `sq_form_elements` (`element_id`,`template_id`,`parent_id`,`role_id`,`element_type`,`element_label`,`element_value`,`element_tags`) VALUES (91,1,90,NULL,3,NULL,NULL,'multiline');


INSERT INTO `sq_map_convention_to_stage` (`convention_id`,`stage_id`) VALUES (1,1);
INSERT INTO `sq_map_convention_to_stage` (`convention_id`,`stage_id`) VALUES (1,2);
INSERT INTO `sq_map_convention_to_stage` (`convention_id`,`stage_id`) VALUES (1,3);


INSERT INTO `sq_stage` (`stage_id`,`stage_name`,`stage_description`,`stage_from`,`stage_to`) VALUES (1,'Main-Stage','Interior big hall in the hotel',NULL,NULL);
INSERT INTO `sq_stage` (`stage_id`,`stage_name`,`stage_description`,`stage_from`,`stage_to`) VALUES (2,'Club-Stage','',NULL,NULL);
INSERT INTO `sq_stage` (`stage_id`,`stage_name`,`stage_description`,`stage_from`,`stage_to`) VALUES (3,'Open-Stage','',NULL,NULL);
