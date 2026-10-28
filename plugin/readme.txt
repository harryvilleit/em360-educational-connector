=== EM360 School Connector ===
Requires at least: 6.6
Tested up to: 6.8
Requires PHP: 8.1
Stable tag: 0.24.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Register or connect an EM360 school on its WordPress website.

== Description ==
Version 0.22.0 adds Safeguarding & Pastoral Care (overview, report a concern, cases, action queue, referrals, safety plans, full case records with triage, actions, referrals, safety plans, evidence documents and closure, access management with audit, and support settings) and the Document Designer (report-card and certificate templates with the visual editor, preview, issue and revoke, and the issued documents register), using the original React screens. Version 0.21.0 added Reports & Analytics inside WordPress using the original React screens: overview, enrolment, staff, academic (including the CAS sheet), financial, attendance, welfare, operations and My Dashboard, with session/term filters and PDF, Excel, CSV and JSON exports. Version 0.20.0 added Voting management inside WordPress using the original React screens: voting overview, elections list, election categories, create election (categories, session, voter type, eligible classes, subcategories and student/staff candidates), election details with live results, activate/close/reopen/delete, and the supervised student voting station. Staff ballots remain in the Staff module. Version 0.19.0 added Learner Support (SEND) inside WordPress using the original React screens: overview, referrals, learner register, plans and provisions, provision delivery, reviews, adjustments, reports, full case records (passport, plan, adjustments, reviews, learner and family voice, evidence documents, audit) and local support settings. Version 0.18.0 added Training & Development inside WordPress, using the same React screens as the main EM360 site: My Training (assigned courses, lessons, assessments and progress), Course Library (create, AI-draft, edit and publish courses), Assignments & Progress (assign published courses to staff, track and cancel) and Training Rules (automatic assignment by audience with preview and apply now). It keeps the complete existing portal and the Health Records workspace: student health profiles, sick-bay visits, care plans, consent, medication, administration corrections, incident follow-ups, parent contact, access management and audit history. The Health UI runs locally inside WordPress and uses the shared EM360 School API.

Phase 3 adds User Management screens inside the WordPress school portal, using the supplied EM360 React components: overview, dashboard, roles and permissions, users, ID cards, staff attendance, consent, visitation, chat, notifications, academic sessions and settings. New-school registration, connection approval and owner/staff sign-in are retained. Student Portal is also included: overview, list/search/filter, three-step registration, profiles and editing, guardian registration/assignment, enrollment, ID cards, password reset, student timetable/calendar, and server-backed CSV import. Parent Portal is included with all seven menus: overview, parent directory and registration, consent requests, fee records, visitation and transcripts. Exams and Records is included with class/arm setup, subjects, categories, departments, teacher assignments, assessments and grading scales, grade entry and worksheet review, published results, remarks, promotion and broadsheets. Fee Management includes school fee structures/items/methods, invoices with school branding and PDF/print, bills, bookkeeping, wallet payments, guardian email reminders, provider setup, refunds, disputes and settlements. E-Learning includes courses, curriculum, lessons, materials, assignments, adaptive insights, live classes, timetables, persistent lesson notes and external tutor learning/payment workflows. Timetable includes the overview, weekly class/assessment builder, staff availability, calendar, custom period types and predefined timetable types. Attendance adds student/staff registers, ID-card arrivals and early intervention. Hostel includes its 12 menus: overview, rooms, hostels, categories, floors, beds, hostel parents, roll call, resident health records, visitors, damage reports and student movement. Staff adds the directory and school profiles, private documents, ID cards, own roles and availability, leave requests and approvals, payroll, performance reviews and staff voting.

This plugin requires the matching EM360 School API changes supplied in the cumulative implementation bundle. Installing the plugin alone does not enable the service. Schools can connect their HTTPS websites directly after school-owner approval.

== External service ==
User Management, Student Portal, Parent Portal, Exams and Records, Fee Management, E-Learning, Timetable, Attendance, Hostel, Staff, Health Records, Training & Development, Learner Support, Voting, Reports & Analytics, Safeguarding & Pastoral Care and Document Designer run from local plugin assets in an isolated same-origin frame. The PHP gateway forwards only listed, school-bound operations. Other module links still open EM360. School records remain in the EM360 database; only connector configuration and encrypted portal-session state are held in WordPress.

The plugin sends connection requests, authorization codes and scoped session credentials to the HTTPS EM360 School API URL configured by the WordPress administrator. That service reads and updates the connected school's records after fresh identity, school and menu permission checks. Portal sign-in takes place on the configured EM360 website. Authorized account creation and password-reset forms send the entered credentials through the school-scoped gateway. The service is required for the plugin to work; consult your EM360 operator for its service terms and privacy information.

== Source code ==
The complete source is public at https://github.com/harryvilleit/em360-educational-connector under GPLv2 or later. The React screens in assets/*-v*/ are built from its ui/ folder with `npm ci && npm run build:wordpress`; ui/wordpress-bundles.json lists the source files of each bundle.

== Installation ==
1. Have the EM360 operator deploy the cumulative School API changes and required migrations.
2. Upload this ZIP through Plugins > Add New Plugin > Upload Plugin and activate it.
3. Open EM360, configure the provided API and frontend URLs, and choose Register a new school or Connect an existing school.
4. Sign in or register an EM360 account, complete MFA where required, and register your school through the existing location/modules/review workflow if it is new. Review and approve the school connection.
5. Create the portal page and add it to your website navigation.

Requirements: HTTPS, single-site WordPress, PHP OpenSSL and server access to the configured HTTPS API. No other LMS or commerce plugin is required.

== Operations ==
Exclude the portal page, connector REST routes and callback from page/CDN caching.
Revoke or disconnect the website before uninstalling. Uninstall removes local connector settings and database-backed transients; external object-cache entries expire naturally; central school records and the generated WordPress page are retained.
From 0.23.0 the plugin updates through Dashboard › Updates like any other plugin, and administrators can turn on auto-updates for it on the Plugins screen. Releases come from the configured School API and are installed only when the package matches its EM360 signature. A manual ZIP upload (Upload Plugin › Replace current with uploaded) still works.

== Upgrading to 0.24.0 ==
Deploy the accompanying School API files and apply migration 20261028100000_AddWordPressStudentPortal (it adds four columns to the WordPress connector tables). Then update the plugin and open WordPress → EM360 → 4. Publish the student portal to create the Student portal page, or place [em360_student_portal] on a page of your own. Add the page to your website menu for students.

Students sign in on EM360 exactly as they do today (password, the email code and first-time password setup) and approve the website on the same "Open your school portal" screen as staff. Only students currently enrolled at the connected school can use the student portal, and staff cannot use it. A student session can only read and change that student's own records: the School API checks every student, class, session and record it is given. A student who does nothing for 120 minutes is signed out; change this with WordPress:StudentIdleMinutes on the School API. Sessions still end after WordPress:SessionHours (8 by default). The staff portal page is unchanged.

== Upgrading to 0.23.0 ==
Install this version by uploading the ZIP once (Upload Plugin › Replace current with uploaded). Later versions then appear under Dashboard › Updates. Deploy the accompanying School API files, which add the anonymous GET api/v1/WordPress/plugin/release endpoint; it returns nothing until WordPressPluginRelease is configured.

== Upgrading to 0.22.0 ==
Deploy the accompanying School API files (Safeguarding and Document Designer gateway modules and ownership checks) and the React files to the main EM360 site, then replace the plugin. No migration is needed.

Each menu needs View; raising a concern needs Create on Report a Concern, case work needs Update or Create on a case menu, and grants need Create/Delete on Access. The API's own safeguarding rules still apply: only the DSL, deputy, a case reviewer or a user granted access in Safeguarding › Access sees cases, even the school owner. Document templates need the matching designer menu; issuing needs Create on Issued Documents and revoking needs Delete. Case evidence uploads accept PDF, Word, JPEG and PNG files up to 5 MB through WordPress.

== Upgrading to 0.21.2 ==
Deploy the accompanying School API files and the React files to the main EM360 site, then replace the plugin. No migration is needed. Reports now open on the school's current session and term; check that the correct session is marked current in Academic Sessions. Set the school's base currency in Settings › Billing & Plan so amounts show in that currency.

== Upgrading to 0.21.1 ==
Deploy the two updated staff directory API files with the accompanying gateway files, then replace the plugin. No migration is needed. Deploy the supplied React files to the main EM360 site as well: the same fixes apply there.

== Upgrading to 0.21.0 ==
This release includes 0.18.0 to 0.20.0. Deploy the accompanying School API files (Reports gateway module and read-only report sources); no database migration is needed. Then replace the plugin through Upload Plugin and choose Replace current with uploaded.

Each report menu needs View. A report screen can read only the sources it charts: for example Financial reads fee totals, Welfare reads health, learner-support and safeguarding summaries, and Overview and My Dashboard read all of them. The source modules keep their own rules, so health and safeguarding figures still require the user's clinical or safeguarding access; when a source refuses, the React report shows its sample figures with the standard demo-data notice, exactly as on the main EM360 site. Library and Cafeteria figures are sample data in this release on both sites. Refresh cached portal assets after the update.

== Upgrading to 0.20.0 ==
This release includes 0.18.0 and 0.19.0. Deploy the accompanying School API files (Voting gateway module, admin operations and election, category and student-enrolment ownership checks); no database migration is needed. Then replace the plugin through Upload Plugin and choose Replace current with uploaded.

Grant the Voting menus through the existing role matrix: Overview or Elections with View to see elections and results, Create to set up elections, Update to activate, close or reopen them and to run the supervised student voting station, and Delete to remove them. Categories needs its own Create/Update grants. The Staff voting menu still opens the staff ballot in the Staff module. Refresh cached portal assets after the update.

== Upgrading to 0.19.0 ==
This release includes 0.18.0 (Training & Development). Deploy the accompanying School API files, which add the Learner Support gateway module, operations and case ownership checks; no database migration is needed. Then replace the plugin through Upload Plugin and choose Replace current with uploaded.

Learner Support follows the existing role matrix and the API's own case rules: only the school owner, Admin, Principal, Vice Principal and learner-support roles (for example SENCO) can open cases and make changes. Grant the Learner Support menus with View to see a list, Create to submit referrals, contributions and evidence, and Update to triage and change passports, plans, adjustments and reviews. Local Support Settings needs its own Update grant. Evidence uploads accept PDF, Word, Excel and image files up to 5 MB each in WordPress. Refresh cached portal assets after the update.

== Upgrading to 0.18.0 ==
Start with the completed 0.17.1 update. Deploy the accompanying School API files (WordPress gateway module, operation catalogue and resource checks); no database migration is needed because the Training & Development module, menus and tables already exist in the shared API. Then replace the plugin through Upload Plugin and choose Replace current with uploaded. Do not delete the existing plugin first.

Training access follows the existing role matrix. Grant View on Training to staff who take courses; grant Course Library, Assignments & Progress and Training Rules with the matching View/Create/Update/Delete actions to administrators. School ownership grants all four. AI course drafting waits up to three minutes; the connector extends its request and PHP time limits for that one operation, but a host-level proxy timeout below 180 seconds still ends the request early. Refresh cached portal assets after the update.

== Upgrading to 0.17.1 ==
Apply the accompanying API files and migration 20261024210000_RegisterHealthSidebarMenus, then replace the plugin through Upload Plugin. This migration only registers two menu entries; it creates no tables and grants no roles automatically. In User Management, assign Follow-ups and Access & audit to the appropriate roles, and assign those roles to users. Clinical Health permissions continue to apply. Deploy the supplied React files to update the main EM360 interface.

== Upgrading to 0.17.0 ==
This ZIP is the complete installable plugin, including all existing modules and the Health update. PHP 8.1 or later is required.

1. Deploy the previously supplied Health API changes and apply migration 20261024200000_CompleteSchoolHealthWorkflow before using the new Health screens. That migration adds six columns to existing API tables; it creates no tables. Apply the earlier Staff Payroll/Performance menu fix if it has not already been applied.
2. In WordPress, open Plugins > Add New Plugin > Upload Plugin. Select this complete ZIP, click Install Now and choose Replace current with uploaded. Do not delete the existing plugin first; deletion runs its uninstall cleanup and removes the local connection settings.
3. Clear cached portal assets, refresh the portal and open Health Records. Existing configuration, school connection and other module assets are retained by replacement.
4. Use Manage access to assign the appropriate clinical Health role. School ownership alone does not grant clinical record access.

The matching React source update was supplied separately for the main EM360 site and the guardian notification inbox. This plugin includes its compiled Health assets, so Node/Composer installation is not needed on WordPress. Parent-portal notifications are stored in the shared API; SMS/email delivery is not added. Manual phone/email/in-person contact is recorded separately.

The package was checked for complete runtime files and asset references. Health browser workflows and the matching API/React builds were validated previously. Live WordPress/PHP execution and production database migration still require deployment verification.

== Upgrading to 0.15.0 ==
Apply the shared School API update and AddSharedManualPayroll migration first, deploy the API, then install this plugin. Deploy the supplied original React source changes to keep both portals on the same payroll workflow. Existing staff, salary history, payslips and school cash-book records are reused. New pay-item and pay-run tables belong to the shared API, never WordPress. Approval and payment recording are restricted to the school owner in this phase. Statutory figures and bank transfers remain external.

== Upgrading to 0.14.0 ==
Start with the completed 0.13.0 Staff update (0.13.1 is also supported). Apply the supplied School API files and 20261024140000_AddHostelVisitorPackageDescription migration, deploy the API, then replace the plugin with 0.14.0. All Hostel menus use the supplied React layouts inside WordPress, with persistent floors, bed assignments, visitors, attendance, resident health and student movement. No central React or separate E-Learning API deployment is required. Refresh cached portal assets.

== Upgrading to 0.13.1 ==
Start with the completed 0.13.0 Staff update. Deploy the affected SchoolHostel.cs summary handler, then replace the plugin with 0.13.1. No new migration, central React or separate E-Learning API deployment is required. The Hostel overview now follows the original React layout. Subscription rules are unchanged; a 402 response still requires checking the connected school's entitlement and the API environment.

== Upgrading to 0.13.0 ==
Start with the completed 0.12.0 Hostel update. Apply the affected School API files and the 20261024130000_AddWordPressStaffRecords migration, deploy the API, then replace the plugin with the 0.13.0 ZIP. Staff runs inside WordPress; no central React or E-Learning API deployment is needed. Salary history, payslips, reviews, goals and private staff/leave documents are persisted in the School API database. Payroll records completed payments but does not transfer money. Refresh cached portal assets after the update.

== Upgrading to 0.12.0 ==
Start with the completed 0.11.0 Attendance update. Apply the affected School API files and the 20261024120000_AddWordPressHostelMovement migration, deploy the API, then replace the plugin with the 0.12.0 ZIP. No central React deployment or separate E-Learning API update is needed. Preserve a database backup before migration; automatic downgrade is intentionally disabled to protect movement audit records. Refresh cached portal assets. Health records retain the school’s clinical access policy; damage responsibility does not automatically create a fee invoice.

== Upgrading to 0.11.0 ==
Start with the completed 0.10.0 Timetable update. Deploy the affected School API files first, then replace the plugin with the 0.11.0 ZIP. No central React deployment, separate E-Learning API update or new database migration is required. Existing Attendance tables and migrations from the original School API must already be deployed. Refresh cached portal assets.

== Upgrading to 0.10.0 ==
Start with the completed 0.9.0 E-Learning implementation. Deploy the affected School API files, then upload the 0.10.0 plugin ZIP and choose Replace current with uploaded. Existing connections and records are retained. No new database migration, central React deployment or separate E-Learning API update is required. Purge cached portal assets.

== Upgrading to 0.9.0 ==
Start with the preceding 0.8.0 Fee Management implementation. Deploy the affected School API files and apply migration 20261024110000_AddSchoolLessonNotes. Deploy the two affected E-Learning API files to enable external tutor workflows. Set WordPress:ELearningApiBaseUrl on the School API to the HTTPS E-Learning API base including /api/v1, and set the same WordPress:LearningBridgeSecret (at least 32 random bytes) on both APIs. Keep secrets in deployment configuration. See INSTALL.txt in the update bundle for commands and the update order. Upload the 0.9.0 plugin ZIP and choose Replace current with uploaded; existing connections are retained. No central React deployment is required. Purge cached portal assets.

== Upgrading to 0.8.0 ==
Deploy the affected School API files, rebuild/redeploy the API, then upload the 0.8.0 ZIP and replace the installed plugin. This update requires the preceding 0.7.0 implementation. No new database migration or central React deployment is required. Existing connections are retained; purge cached portal assets. Reminders are recorded in the central database and submitted through the existing EM360 email service. The UI reports accepted and failed submissions; inbox delivery depends on that service. No SMS integration is added. Online provider actions retain the existing owner and subscription checks; complete provider onboarding in its separate tab, then return to WordPress and refresh status.

== Upgrading to 0.7.0 ==
Deploy the affected School API files and apply migration 20261024100000_AddSchoolResultRemarks, then replace the installed plugin with 0.7.0. This update builds on 0.6.0 and retains its required earlier migrations. Existing connections are retained. The WordPress management UI is bundled in the plugin; a separate central React deployment is not required.

== Upgrading to 0.6.0 ==
Deploy the Parent Portal API changes, then replace the installed plugin with 0.6.0. No new migration is required when upgrading from 0.5.0. Earlier installations must retain/apply the connector migration and 20261023120000_AddStudentPortalProfileData. The plugin contains compiled React screens; no separate frontend deployment is required for WordPress. Refresh the portal and purge cached assets. Existing connections are retained. Rebuild the central React site separately if using these shared UI changes there.

Student profiles are saved in the EM360 database. CSV import processes up to 100 rows per file, with school/session/term validation and explicit per-row status. A student may be saved even if enrollment fails; the results screen identifies those rows and can retry them without re-creating the student. New guardians must be registered with this school, or already linked through a current student. Active students cannot be transferred out of another school through this module.

== Previous layout update from 0.4.0 ==
Upload version 0.4.1 and choose Replace current with uploaded. The existing portal page automatically uses the full-width application layout if its only content is [em360_school_portal], including a Gutenberg Shortcode block. The website header/footer remain on other pages. Use [em360_school_portal layout="embedded"] to retain the theme wrapper intentionally. No reconnect, API deployment, central React deployment or database migration is needed for this layout update.

== Upgrading from 0.1.0, 0.2.0 or 0.3.0 ==
Deploy the cumulative API overlay and the required connector/student-profile migrations, then upload version 0.6.0 and choose Replace current with uploaded. Do not uninstall the old plugin first. Existing settings, encrypted connection credentials, valid browser sessions and the portal page retain their original storage formats. Keep WordPress authentication salts unchanged. Retain the central login/registration/approval frontend deployment; the management screens are bundled locally.

== Upgrading to 0.16.0 ==
Deploy the affected shared API files and apply AddConfigurableStaffPerformance after AddSharedManualPayroll. Deploy the affected original React files. Upload this complete plugin ZIP and replace the installed connector; do not uninstall it. Reviews, goals and evidence use the same API database in both portals. Templates and cycles are new shared configuration records. Grant the Performance menu View permission to staff/reviewers; View + Create + Update enables performance administration. Existing connection settings and payroll remain in place.

== Changelog ==

= 0.24.0 =
Adds the Student Portal on its own page, using the same React screens as the EM360 student portal: overview, chat, timetable, school calendar, results, subjects, attendance, my support, e-learning (courses, lessons, assignments with voice answers, adaptive practice and live classes), hostel, health record, cafeteria, library, voting and rate school. LifeLab and Tutor Courses open on EM360. Students sign in through EM360; the plugin keeps staff and student sessions apart and the School API binds every student request to the signed-in learner.

= 0.23.0 =
Adds one-click updates. New versions appear in Dashboard › Updates and on the Plugins screen with the release notes, bulk and automatic updates work, and each package is checked against its EM360 Ed25519 signature and SHA-256 before WordPress installs it. The Update URI header keeps WordPress.org from offering an unrelated plugin with the same name.

= 0.22.0 =
Adds Safeguarding & Pastoral Care and Document Designer inside WordPress using the original React screens. Every call is a listed gateway operation checked against the screen's menu permission and the connected school (cases, actions, documents, access grants, templates and issued documents). Report a Concern now loads the whole learner list in pages of 100 instead of one oversized request.

= 0.21.2 =
Reports no longer substitute sample figures. A source that is restricted (safeguarding without DSL or deputy access, health without the Health Records Overview menu, learner support without SENCO-level access) or fails is left blank with the reason; Library and Cafeteria are shown as not connected. Every report source now uses the same session and term, and the default is the school's current session rather than the newest one created. When the school has not set its base currency, amounts are shown without a currency and the report says how to set it, instead of assuming NGN (WordPress no longer assumes GBP). The API's Reports welfare endpoint now applies safeguarding and learner-support access before returning cases.

= 0.21.1 =
Reports & Analytics now loads whole-school student, staff and class lists page by page within the API and gateway limits. Previously the Staff report could not load live data, Enrolment counted at most 100 students, and in WordPress both fell back to sample figures; the Learner Support referral student list was also affected. The staff directory now returns service number, grade level and step, appointment and posting dates, state, LGA and town, so the Staff report roster and records-completeness figures reflect saved staff records.

= 0.21.0 =
Adds Reports & Analytics as a native WordPress module built from the original React pages: overview, enrolment, staff, academic, financial, attendance, welfare, operations and My Dashboard. All calls are read-only and go through the school-scoped gateway; each report menu is limited to the data sources its screen uses. Larger report responses (rosters, broadsheets, overviews) are allowed up to 4 MB. Requires the accompanying School API gateway update; no migration.

= 0.20.0 =
Adds Voting management as a native WordPress module built from the original React pages: overview, elections, categories, create election, election details and results, and supervised student voting. Calls go through the school-scoped gateway with per-menu permission checks and connected-school checks for elections, categories, sessions, terms, classes and student enrolments. Staff ballots are unchanged. Requires the accompanying School API gateway update; no migration.

= 0.19.0 =
Adds Learner Support as a native WordPress module built from the original React pages, including case records and local support settings. Calls go through the school-scoped gateway with per-menu permission checks and connected-school checks for cases, learners, provisions and case owners. Evidence uploads accept PDF, Word, Excel and images. Fixes evidence, contribution, adjustment, provision-log and review forms not clearing after a successful save (also applies to the main EM360 site). Training & Development and Learner Support now share one module frame. Requires the accompanying School API gateway update; no migration.

= 0.18.0 =
Adds Training & Development as a native WordPress module built from the original React Training pages: My Training, Course Library, Assignments & Progress and Training Rules. All calls use the shared Training API through the school-scoped gateway with per-menu View/Create/Update/Delete checks and connected-school ownership checks for courses, assignments, rules and assigned staff. Requires the accompanying School API gateway update; no migration.

= 0.17.1 =
Uses the full available Health workspace width. Module navigation is sidebar-only. Follow-ups and Access & audit are registered as assignable menus; role-to-user and clinical Health access rules remain in effect. Refreshes retain the screen and open forms, skip hidden tabs and clear data after access loss. Requires the accompanying API menu authorization update and the RegisterHealthSidebarMenus data migration.


= 0.17.0 =
Adds the wide responsive Health Records workspace inside WordPress, including paginated histories, incident follow-up and closure, medication status management, immutable administration corrections, linked-guardian contact and portal notification status. Uses shared API records and school-scoped permissions. Requires the corresponding Health API update and migration.
= 0.16.0 =
* Shared configurable performance templates, review cycles, goals, check-ins and development plans.
* Private self-assessment and manager drafts, evidence, approval, acknowledgement and disagreement resolution.
* Preserved template snapshots and corrected review revisions; legacy reviews remain read-only.
* Responsive WordPress portal screens and original React integration backed by the same API.


= 0.15.0 =
* Shared configurable payroll for React and WordPress: pay items, employee assignments, reviewed drafts, approval, published payslips, CSV import, manual partial payments and reversals.
* Payroll cash movements reuse Fee Management bookkeeping. Server totals span all filtered pages and distinguish cash from unpaid face values.
* Original salary and payslip history preserved; retired write endpoints cannot bypass the new approval workflow.
= 0.14.0 =
* Reuse the supplied React layouts for all Hostel menus, room details and forms.
* Connect floors, student/bed assignments, CSV assignment previews, supervisors, visitor editing and packages, attendance, damage reports, health records and movement to school-scoped API records.
* Retain menu permissions, clinical health permissions and existing subscription requirements; show request failures with retry.
* Add the optional visitor package description field and the Class movement reason without changing existing reason values.

= 0.13.1 =
* Restore the original Hostel summary cards, eleven quick actions and occupancy breakdown design.
* Keep loading and API failure states explicit; failed counts are not displayed as zero.
* Add school-scoped active-supervisor and open-damage counts without capped client-side lists.

= 0.13.0 =
* Staff directory, profiles, ID cards, own roles and weekly availability.
* Leave requests, private attachments, approvals, relief assignments, calendar, balance ledger and settings.
* Persisted salary versions, deduplicated pay runs, payment references and payslip PDFs.
* Persisted performance reviews, staff acknowledgement, development goals and staff voting.

= 0.12.0 =
Adds Hostel management within WordPress using saved School API records. Includes room/floor setup, bed allocation, supervisor assignment and reassignment, historical roll calls, restricted resident health details, visitor arrivals/departures, damage responsibility and audited student movement. Enforces school and menu scope, protects concurrent allocation and preserves legacy movement data.

= 0.11.0 =
Adds Attendance inside WordPress: student dashboard, class registers, records and histories; staff self-service and term summaries; school-verified ID-card arrival scanning; early intervention dashboard, risk queue, cases, activities, reviews, referrals and settings. Uses persistent School API records, school timezone dates and menu/action grants. Fixes partial register totals and detects concurrent writes. Camera and geolocation permissions are delegated to the local portal frame.

= 0.10.0 =
Adds the five Timetable menus inside WordPress: overview, weekly class/assessment scheduling, school calendar, period types and predefined timetable types. Preserves the original period-bank workflow with an accessible Add to week alternative. Adds school-bound CRUD operations, nested period validation, read-only permissions, status toggles, pagination, retry states and first-partial-week scheduling. School records remain in the central School API.

= 0.9.0 =
School E-Learning screens run locally in WordPress using existing teacher course workflows, server-side course permissions, resumable Cloudflare uploads and YouTube fallback. Adds persistent lesson notes with revisions and owner review, live-class room permissions, progress-aware document uploads and a school-scoped bridge to the separate E-Learning API for tutor contracts and payments. Requires matching API files, lesson-note migration and tutor bridge configuration.

= 0.8.0 =
Fee Management runs inside WordPress using the existing school workflow and central financial records. Adds scoped fee operations, nested financial-record validation, school-bound guardian search, real guardian email reminders, school-branded invoice PDF/printing, safe provider onboarding links and retry-safe wallet allocation after a payment is recorded. Includes PATCH support for transaction-type activation. Requires matching School API updates; no additional migration from 0.7.0.

= 0.7.0 =
Exams and Records runs inside WordPress with the existing school workflows, teacher assignment/search, grade entry and worksheet approval, results, persistent remarks, report downloads/printing, promotion and broadsheets. Every operation uses school-bound menu authorization; nested grade and promotion payloads receive additional record checks. Requires the matching API changes and remarks migration.

= 0.6.0 =
Parent Portal: seven local management screens; parent registration/editing, child linking and password reset; academic records, attendance, timetable and calendar; paginated consent and responses; parent invoice/payment records with PDF export; visitation review; persistent transcript submission, processing, rejection and dispatch. School/menu/resource authorization applies to every gateway operation. Requires matching API changes; no additional migration from 0.5.0.

= 0.5.0 =
Student Portal module with local React UI, scoped API operations, persistent extended student profiles and school-bound guardian registration, real CSV import with partial results and retries, and API-correct status filters. Requires the included database migration.

= 0.4.2 =
Consistent server and browser menu URL matching, menu-ID handoff, no duplicate school prefix, and explicit unsupported-menu errors. Correct user creation to send all selected roles and Staff ID together. Fix public-page links and post-deletion navigation. Additional permission and functional regression tests. Requires the matching API navigation update.

= 0.4.1 =
Full-width application layout for dedicated portal pages. Compact school header, React-style sidebar with desktop collapse and accessible mobile drawer, and a module canvas sized to the available viewport. Existing embedded shortcodes can retain the theme layout with layout="embedded". No API, database or central React deployment is required when upgrading from 0.4.0.

= 0.4.0 =
Native User Management React application, scoped API gateway, server-side staff search and exact detail loading, school-membership removal/restoration, correct consent categories and real visitation/consent activity. Chat refreshes every ten seconds while visible. The original report-card design preference remains browser-local; notification-delivery preferences remain unavailable as in the supplied UI.

= 0.3.0 =
New school-product registration with a one-hour setup request, return to owner approval, and exact new-school selection. Module switching, active-module sidebar, menu permission display and permission-checked links to existing EM360 screens.

= 0.2.0 =
Rebuilt PHP using typed domain models, focused application services, narrow interfaces, constructor dependency injection and WordPress adapters. Composer PSR-4 autoloading is included; schools do not need Composer. Existing Phase 1 behavior and record formats are preserved.

= 0.1.0 =
Initial school-connector foundation: setup, approval, school-scoped sign-in, read-only dashboard and website revocation.

== E-Learning (0.9.0) ==
School E-Learning runs inside the WordPress portal: overview, assigned courses, curriculum and lessons, YouTube and resumable Cloudflare video, materials, assignments and marking, adaptive insights, live rooms, teacher timetable and persistent lesson notes with owner review.
External tutor learning, course briefs, invitations, audience assignments, progress, jobs and contract/payment workflows use the separate E-Learning API through a request-bound server bridge. Configure the two API services as described in the update's INSTALL.txt. No central React-site deployment is required.
Lesson notes require the included School API migration. Existing video storage, Agora and AI services retain their configuration and entitlement checks. Document attachments in the portal are limited to 5 MB per file; Cloudflare videos upload directly in resumable chunks.
