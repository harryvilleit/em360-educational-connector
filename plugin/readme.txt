=== EM360 School Connector ===
Contributors: harryvilleit
Tags: school management, education, school, staff portal, learning
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 8.1
Stable tag: 0.27.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Run EM360 school management on your own WordPress website, with the same screens as EM360.

== Description ==

EM360 is a school management platform. This plugin connects a school's WordPress website to its EM360 account, so the school owner and staff can manage the school from the school's own website.

**Staff portal.** School owners and staff sign in with their EM360 account and see only the modules and menus their role allows:

* User management, roles and permissions, ID cards, consent and visitation
* Student and parent records, enrolment and CSV import
* Exams and records, results, promotion and broadsheets
* Fee management, invoices, payments and payroll
* E-learning, timetable, attendance and live classes
* Hostel, staff, health records, learner support (SEND), safeguarding and pastoral care
* Training, voting, reports and analytics, and the document designer

**How it works.**

* The screens are the same React screens as EM360. They run from files inside the plugin, in a frame on your own domain.
* Every request goes through the plugin's server-side gateway. It only forwards a fixed list of operations, bound to your school and checked against the signed-in person's permissions.
* School records stay in EM360. WordPress stores only the connection settings and encrypted session state.
* Sign-in happens on EM360, with the same password, email code and approval screen people already use.

An EM360 school account is required. A new school can register from the plugin's setup screen.

== External service ==

This plugin connects to the EM360 platform operated by HarryVille Solutions Ltd. It does not work without it.

* **When:** while an administrator connects the website, whenever someone signs in to a portal, and on every portal screen that loads or saves school records.
* **What is sent:** the website address and connection request when connecting; sign-in authorisation codes and session credentials; and the school records a signed-in user views, creates or changes (for example student, staff, attendance or fee records), including passwords typed into account-creation or password-reset forms.
* **Where:** the HTTPS EM360 School API address set on the plugin's settings screen, and the EM360 sign-in website (https://em360s.com) that people are sent to when they sign in.

Some EM360 screens also load content directly from these services in the visitor's browser:

* **Agora** (live classes: video, audio and chat, only when someone joins a live class). Terms: https://www.agora.io/en/terms-of-service/ · Privacy: https://www.agora.io/en/privacy-policy/
* **Cloudflare Stream** (playing and uploading lesson videos the school added). Terms: https://www.cloudflare.com/website-terms/ · Privacy: https://www.cloudflare.com/privacypolicy/
* **YouTube** and **Vimeo** (lesson videos a teacher linked from those sites). YouTube terms: https://www.youtube.com/t/terms · Google privacy: https://policies.google.com/privacy · Vimeo terms: https://vimeo.com/terms · Vimeo privacy: https://vimeo.com/privacy
* **Unsplash** (placeholder cover images on e-learning class cards). Terms: https://unsplash.com/terms · Privacy: https://unsplash.com/privacy

EM360 legal information: https://em360s.com/legal
Privacy notice: https://em360s.com/legal/privacy
Acceptable use: https://em360s.com/legal/acceptable-use
Data deletion: https://em360s.com/legal/data-deletion

== Source code ==

The full source is public at https://github.com/harryvilleit/em360-educational-connector under GPLv2 or later. The React screens in `assets/*-v*/` are built from its `ui/` folder with `npm ci && npm run build:wordpress`; `ui/wordpress-bundles.json` lists the source files behind each bundle.

== Installation ==

1. Install and activate the plugin.
2. Open **EM360** in the WordPress admin menu and enter the EM360 service addresses your EM360 contact gave you.
3. Choose **Register a new school** or **Connect an existing school**, sign in to EM360 and approve the connection.
4. Create the school portal page, then add it to your site menu.

Requirements: HTTPS, a single-site WordPress install, PHP 8.1 or later with OpenSSL, and outbound HTTPS from your server to EM360.

== Frequently Asked Questions ==

= Is there a student portal? =

Yes. The free EM360 Student Portal add-on (em360-educational-student-portal) adds a student sign-in page that uses this plugin's school connection. Install it alongside this plugin, then create the student page from step 4 of the setup screen.

= Do I need an EM360 account? =

Yes. The plugin is a connector for EM360 schools. A new school can register from the setup screen.

= Where are student records stored? =

In EM360. WordPress stores only the connection settings and encrypted portal sessions.

= Should the portal pages be cached? =

No. Exclude the portal pages, the plugin's REST routes and the sign-in callback from page and CDN caching.

= What happens when I uninstall? =

Disconnect the website first. Uninstalling removes the plugin's settings from WordPress. School records in EM360 and the pages the plugin created are kept.

== Changelog ==

= 0.27.1 =
Self-hosted updates: "Compatible up to 7.1" now covers every 7.1.x release, as on WordPress.org, so WordPress 7.1.4 no longer shows the "has not been tested" warning.

= 0.27.0 =
The student portal is now the separate EM360 Student Portal add-on, which builds on this plugin's school connection, sessions and gateway through a small extension API (the `em360_connector_loaded` action). Existing student portal pages keep working once the add-on is installed; until then they show a short notice. Self-hosted updates: the "View details" window now shows the description, installation steps, FAQ and changelog with the EM360 banner and icon, and updates unpack into the folder the plugin is installed in (for example em360-educational-management), so it stays active.

= 0.26.2 =
Portal screens load their script and styles through the WordPress script-module and style queues.

= 0.26.1 =
WordPress coding-standards pass for the plugin directory: portal frames are written by an escaped template, request values are unslashed and sanitised, the EM360 sign-in redirect uses wp_safe_redirect, and catalogue files load with wp_json_file_decode. No behaviour change.

= 0.26.0 =
School Management edition. Hostel, Staff (with availability) and Lesson Notes run from their own bundle again, and every screen's WordPress behaviour is now in readable source (`ui/wordpress/overrides/`): server-side teacher search and paging, saved result remarks and real result downloads, school-date attendance and timetable defaults, idempotent fee payments and reminders, invoices printed from the portal frame, and payment checkout opened in a new tab. The WordPress.org package leaves out the student sign-in portal.

= 0.25.0 =
Every React bundle is now rebuilt from the public source repository. Readme rewritten for site owners; operator deployment notes moved to the source repository. The self-updater is now optional, so the same code ships to WordPress.org without it.

= 0.24.1 =
First signed release of 0.24.0. No code changes.

= 0.24.0 =
Adds the Student Portal on its own page, using the same React screens as the EM360 student portal: overview, chat, timetable, school calendar, results, subjects, attendance, my support, e-learning (courses, lessons, assignments with voice answers, adaptive practice and live classes), hostel, health record, cafeteria, library, voting and rate school. LifeLab and Tutor Courses open on EM360. Students sign in through EM360; the plugin keeps staff and student sessions apart and the School API binds every student request to the signed-in learner.

= 0.23.0 =
Adds one-click updates through Dashboard › Updates for sites installed from an EM360 package.

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

== Upgrade Notice ==

= 0.27.1 =
Removes the "not tested" warning on WordPress 7.1.x. No settings change.

= 0.27.0 =
If you use the student portal page, install the EM360 Student Portal add-on.

= 0.26.2 =
Coding-standards fix. No settings change.

= 0.26.1 =
Coding-standards fixes. No settings change.

= 0.26.0 =
Restores the dedicated Hostel, Staff and Lesson Notes screens. No settings change.

= 0.25.0 =
Rebuilt screens from the public source. No settings change.
