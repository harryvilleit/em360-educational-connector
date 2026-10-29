# EM360 School Connector — deployment history

Operator notes moved out of readme.txt in 0.25.0 (WordPress.org readmes are for site owners). Each section lists the School API files and migrations a release needed.

## Upgrading to 0.24.0
Deploy the accompanying School API files and apply migration 20261028100000_AddWordPressStudentPortal (it adds four columns to the WordPress connector tables). Then update the plugin and open WordPress → EM360 → 4. Publish the student portal to create the Student portal page, or place [em360_student_portal] on a page of your own. Add the page to your website menu for students.

Students sign in on EM360 exactly as they do today (password, the email code and first-time password setup) and approve the website on the same "Open your school portal" screen as staff. Only students currently enrolled at the connected school can use the student portal, and staff cannot use it. A student session can only read and change that student's own records: the School API checks every student, class, session and record it is given. A student who does nothing for 120 minutes is signed out; change this with WordPress:StudentIdleMinutes on the School API. Sessions still end after WordPress:SessionHours (8 by default). The staff portal page is unchanged.

## Upgrading to 0.23.0
Install this version by uploading the ZIP once (Upload Plugin › Replace current with uploaded). Later versions then appear under Dashboard › Updates. Deploy the accompanying School API files, which add the anonymous GET api/v1/WordPress/plugin/release endpoint; it returns nothing until WordPressPluginRelease is configured.

## Upgrading to 0.22.0
Deploy the accompanying School API files (Safeguarding and Document Designer gateway modules and ownership checks) and the React files to the main EM360 site, then replace the plugin. No migration is needed.

Each menu needs View; raising a concern needs Create on Report a Concern, case work needs Update or Create on a case menu, and grants need Create/Delete on Access. The API's own safeguarding rules still apply: only the DSL, deputy, a case reviewer or a user granted access in Safeguarding › Access sees cases, even the school owner. Document templates need the matching designer menu; issuing needs Create on Issued Documents and revoking needs Delete. Case evidence uploads accept PDF, Word, JPEG and PNG files up to 5 MB through WordPress.

## Upgrading to 0.21.2
Deploy the accompanying School API files and the React files to the main EM360 site, then replace the plugin. No migration is needed. Reports now open on the school's current session and term; check that the correct session is marked current in Academic Sessions. Set the school's base currency in Settings › Billing & Plan so amounts show in that currency.

## Upgrading to 0.21.1
Deploy the two updated staff directory API files with the accompanying gateway files, then replace the plugin. No migration is needed. Deploy the supplied React files to the main EM360 site as well: the same fixes apply there.

## Upgrading to 0.21.0
This release includes 0.18.0 to 0.20.0. Deploy the accompanying School API files (Reports gateway module and read-only report sources); no database migration is needed. Then replace the plugin through Upload Plugin and choose Replace current with uploaded.

Each report menu needs View. A report screen can read only the sources it charts: for example Financial reads fee totals, Welfare reads health, learner-support and safeguarding summaries, and Overview and My Dashboard read all of them. The source modules keep their own rules, so health and safeguarding figures still require the user's clinical or safeguarding access; when a source refuses, the React report shows its sample figures with the standard demo-data notice, exactly as on the main EM360 site. Library and Cafeteria figures are sample data in this release on both sites. Refresh cached portal assets after the update.

## Upgrading to 0.20.0
This release includes 0.18.0 and 0.19.0. Deploy the accompanying School API files (Voting gateway module, admin operations and election, category and student-enrolment ownership checks); no database migration is needed. Then replace the plugin through Upload Plugin and choose Replace current with uploaded.

Grant the Voting menus through the existing role matrix: Overview or Elections with View to see elections and results, Create to set up elections, Update to activate, close or reopen them and to run the supervised student voting station, and Delete to remove them. Categories needs its own Create/Update grants. The Staff voting menu still opens the staff ballot in the Staff module. Refresh cached portal assets after the update.

## Upgrading to 0.19.0
This release includes 0.18.0 (Training & Development). Deploy the accompanying School API files, which add the Learner Support gateway module, operations and case ownership checks; no database migration is needed. Then replace the plugin through Upload Plugin and choose Replace current with uploaded.

Learner Support follows the existing role matrix and the API's own case rules: only the school owner, Admin, Principal, Vice Principal and learner-support roles (for example SENCO) can open cases and make changes. Grant the Learner Support menus with View to see a list, Create to submit referrals, contributions and evidence, and Update to triage and change passports, plans, adjustments and reviews. Local Support Settings needs its own Update grant. Evidence uploads accept PDF, Word, Excel and image files up to 5 MB each in WordPress. Refresh cached portal assets after the update.

## Upgrading to 0.18.0
Start with the completed 0.17.1 update. Deploy the accompanying School API files (WordPress gateway module, operation catalogue and resource checks); no database migration is needed because the Training & Development module, menus and tables already exist in the shared API. Then replace the plugin through Upload Plugin and choose Replace current with uploaded. Do not delete the existing plugin first.

Training access follows the existing role matrix. Grant View on Training to staff who take courses; grant Course Library, Assignments & Progress and Training Rules with the matching View/Create/Update/Delete actions to administrators. School ownership grants all four. AI course drafting waits up to three minutes; the connector extends its request and PHP time limits for that one operation, but a host-level proxy timeout below 180 seconds still ends the request early. Refresh cached portal assets after the update.

## Upgrading to 0.17.1
Apply the accompanying API files and migration 20261024210000_RegisterHealthSidebarMenus, then replace the plugin through Upload Plugin. This migration only registers two menu entries; it creates no tables and grants no roles automatically. In User Management, assign Follow-ups and Access & audit to the appropriate roles, and assign those roles to users. Clinical Health permissions continue to apply. Deploy the supplied React files to update the main EM360 interface.

## Upgrading to 0.17.0
This ZIP is the complete installable plugin, including all existing modules and the Health update. PHP 8.1 or later is required.

1. Deploy the previously supplied Health API changes and apply migration 20261024200000_CompleteSchoolHealthWorkflow before using the new Health screens. That migration adds six columns to existing API tables; it creates no tables. Apply the earlier Staff Payroll/Performance menu fix if it has not already been applied.
2. In WordPress, open Plugins > Add New Plugin > Upload Plugin. Select this complete ZIP, click Install Now and choose Replace current with uploaded. Do not delete the existing plugin first; deletion runs its uninstall cleanup and removes the local connection settings.
3. Clear cached portal assets, refresh the portal and open Health Records. Existing configuration, school connection and other module assets are retained by replacement.
4. Use Manage access to assign the appropriate clinical Health role. School ownership alone does not grant clinical record access.

The matching React source update was supplied separately for the main EM360 site and the guardian notification inbox. This plugin includes its compiled Health assets, so Node/Composer installation is not needed on WordPress. Parent-portal notifications are stored in the shared API; SMS/email delivery is not added. Manual phone/email/in-person contact is recorded separately.

The package was checked for complete runtime files and asset references. Health browser workflows and the matching API/React builds were validated previously. Live WordPress/PHP execution and production database migration still require deployment verification.

## Upgrading to 0.15.0
Apply the shared School API update and AddSharedManualPayroll migration first, deploy the API, then install this plugin. Deploy the supplied original React source changes to keep both portals on the same payroll workflow. Existing staff, salary history, payslips and school cash-book records are reused. New pay-item and pay-run tables belong to the shared API, never WordPress. Approval and payment recording are restricted to the school owner in this phase. Statutory figures and bank transfers remain external.

## Upgrading to 0.14.0
Start with the completed 0.13.0 Staff update (0.13.1 is also supported). Apply the supplied School API files and 20261024140000_AddHostelVisitorPackageDescription migration, deploy the API, then replace the plugin with 0.14.0. All Hostel menus use the supplied React layouts inside WordPress, with persistent floors, bed assignments, visitors, attendance, resident health and student movement. No central React or separate E-Learning API deployment is required. Refresh cached portal assets.

## Upgrading to 0.13.1
Start with the completed 0.13.0 Staff update. Deploy the affected SchoolHostel.cs summary handler, then replace the plugin with 0.13.1. No new migration, central React or separate E-Learning API deployment is required. The Hostel overview now follows the original React layout. Subscription rules are unchanged; a 402 response still requires checking the connected school's entitlement and the API environment.

## Upgrading to 0.13.0
Start with the completed 0.12.0 Hostel update. Apply the affected School API files and the 20261024130000_AddWordPressStaffRecords migration, deploy the API, then replace the plugin with the 0.13.0 ZIP. Staff runs inside WordPress; no central React or E-Learning API deployment is needed. Salary history, payslips, reviews, goals and private staff/leave documents are persisted in the School API database. Payroll records completed payments but does not transfer money. Refresh cached portal assets after the update.

## Upgrading to 0.12.0
Start with the completed 0.11.0 Attendance update. Apply the affected School API files and the 20261024120000_AddWordPressHostelMovement migration, deploy the API, then replace the plugin with the 0.12.0 ZIP. No central React deployment or separate E-Learning API update is needed. Preserve a database backup before migration; automatic downgrade is intentionally disabled to protect movement audit records. Refresh cached portal assets. Health records retain the school’s clinical access policy; damage responsibility does not automatically create a fee invoice.

## Upgrading to 0.11.0
Start with the completed 0.10.0 Timetable update. Deploy the affected School API files first, then replace the plugin with the 0.11.0 ZIP. No central React deployment, separate E-Learning API update or new database migration is required. Existing Attendance tables and migrations from the original School API must already be deployed. Refresh cached portal assets.

## Upgrading to 0.10.0
Start with the completed 0.9.0 E-Learning implementation. Deploy the affected School API files, then upload the 0.10.0 plugin ZIP and choose Replace current with uploaded. Existing connections and records are retained. No new database migration, central React deployment or separate E-Learning API update is required. Purge cached portal assets.

## Upgrading to 0.9.0
Start with the preceding 0.8.0 Fee Management implementation. Deploy the affected School API files and apply migration 20261024110000_AddSchoolLessonNotes. Deploy the two affected E-Learning API files to enable external tutor workflows. Set WordPress:ELearningApiBaseUrl on the School API to the HTTPS E-Learning API base including /api/v1, and set the same WordPress:LearningBridgeSecret (at least 32 random bytes) on both APIs. Keep secrets in deployment configuration. See INSTALL.txt in the update bundle for commands and the update order. Upload the 0.9.0 plugin ZIP and choose Replace current with uploaded; existing connections are retained. No central React deployment is required. Purge cached portal assets.

## Upgrading to 0.8.0
Deploy the affected School API files, rebuild/redeploy the API, then upload the 0.8.0 ZIP and replace the installed plugin. This update requires the preceding 0.7.0 implementation. No new database migration or central React deployment is required. Existing connections are retained; purge cached portal assets. Reminders are recorded in the central database and submitted through the existing EM360 email service. The UI reports accepted and failed submissions; inbox delivery depends on that service. No SMS integration is added. Online provider actions retain the existing owner and subscription checks; complete provider onboarding in its separate tab, then return to WordPress and refresh status.

## Upgrading to 0.7.0
Deploy the affected School API files and apply migration 20261024100000_AddSchoolResultRemarks, then replace the installed plugin with 0.7.0. This update builds on 0.6.0 and retains its required earlier migrations. Existing connections are retained. The WordPress management UI is bundled in the plugin; a separate central React deployment is not required.

## Upgrading to 0.6.0
Deploy the Parent Portal API changes, then replace the installed plugin with 0.6.0. No new migration is required when upgrading from 0.5.0. Earlier installations must retain/apply the connector migration and 20261023120000_AddStudentPortalProfileData. The plugin contains compiled React screens; no separate frontend deployment is required for WordPress. Refresh the portal and purge cached assets. Existing connections are retained. Rebuild the central React site separately if using these shared UI changes there.

Student profiles are saved in the EM360 database. CSV import processes up to 100 rows per file, with school/session/term validation and explicit per-row status. A student may be saved even if enrollment fails; the results screen identifies those rows and can retry them without re-creating the student. New guardians must be registered with this school, or already linked through a current student. Active students cannot be transferred out of another school through this module.

## Previous layout update from 0.4.0
Upload version 0.4.1 and choose Replace current with uploaded. The existing portal page automatically uses the full-width application layout if its only content is [em360_school_portal], including a Gutenberg Shortcode block. The website header/footer remain on other pages. Use [em360_school_portal layout="embedded"] to retain the theme wrapper intentionally. No reconnect, API deployment, central React deployment or database migration is needed for this layout update.

## Upgrading from 0.1.0, 0.2.0 or 0.3.0
Deploy the cumulative API overlay and the required connector/student-profile migrations, then upload version 0.6.0 and choose Replace current with uploaded. Do not uninstall the old plugin first. Existing settings, encrypted connection credentials, valid browser sessions and the portal page retain their original storage formats. Keep WordPress authentication salts unchanged. Retain the central login/registration/approval frontend deployment; the management screens are bundled locally.

## Upgrading to 0.16.0
Deploy the affected shared API files and apply AddConfigurableStaffPerformance after AddSharedManualPayroll. Deploy the affected original React files. Upload this complete plugin ZIP and replace the installed connector; do not uninstall it. Reviews, goals and evidence use the same API database in both portals. Templates and cycles are new shared configuration records. Grant the Performance menu View permission to staff/reviewers; View + Create + Update enables performance administration. Existing connection settings and payroll remain in place.


## E-Learning (0.9.0)
School E-Learning runs inside the WordPress portal: overview, assigned courses, curriculum and lessons, YouTube and resumable Cloudflare video, materials, assignments and marking, adaptive insights, live rooms, teacher timetable and persistent lesson notes with owner review.
External tutor learning, course briefs, invitations, audience assignments, progress, jobs and contract/payment workflows use the separate E-Learning API through a request-bound server bridge. Configure the two API services as described in the update's INSTALL.txt. No central React-site deployment is required.
Lesson notes require the included School API migration. Existing video storage, Agora and AI services retain their configuration and entitlement checks. Document attachments in the portal are limited to 5 MB per file; Cloudflare videos upload directly in resumable chunks.
