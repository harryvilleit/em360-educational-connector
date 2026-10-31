=== EM360 Student Portal ===
Contributors: harryvilleit
Tags: student portal, school, education, e-learning, timetable
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 8.1
Requires Plugins: em360-educational-management
Stable tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds the EM360 student portal to a school website connected with EM360 School Connector.

== Description ==

This add-on for [EM360 School Connector](https://wordpress.org/plugins/em360-educational-management/) gives students their own portal page on the school's website. Students sign in with their EM360 student account and see only their own records:

* Timetable, school calendar, results, subjects and attendance
* E-learning: courses, lessons, assignments (including voice answers), practice and live classes
* Chat, support, hostel, health record, cafeteria, library and school votes

**How it works.**

* It uses the school connection set up in EM360 School Connector, so the school connects only once.
* Student, parent and staff sign-ins are kept apart: each session opens only its own portal.
* Every request goes through the connector's server-side gateway, which forwards only the operations listed in `resources/student-portal-routes.json`. The EM360 School API checks each one against the signed-in student's own records.
* The screens are the same React screens as the EM360 student portal, served from this plugin in a frame on your own domain.

== External service ==

This plugin uses the EM360 platform operated by HarryVille Solutions Ltd, through EM360 School Connector.

* **When:** when a student signs in, and on every student portal screen that loads or saves records.
* **What is sent:** sign-in authorisation codes and session credentials, and the records the signed-in student views or submits (for example assignment answers, including voice recordings, and chat messages).
* **Where:** the HTTPS EM360 School API address set in EM360 School Connector, and the EM360 sign-in website (https://em360s.com).

Some screens also load content directly from these services in the visitor's browser:

* **Agora** (live classes, only when a student joins one). Terms: https://www.agora.io/en/terms-of-service/ · Privacy: https://www.agora.io/en/privacy-policy/
* **Cloudflare Stream** (lesson videos the school added). Terms: https://www.cloudflare.com/website-terms/ · Privacy: https://www.cloudflare.com/privacypolicy/
* **YouTube** and **Vimeo** (lesson videos a teacher linked from those sites). YouTube terms: https://www.youtube.com/t/terms · Google privacy: https://policies.google.com/privacy · Vimeo terms: https://vimeo.com/terms · Vimeo privacy: https://vimeo.com/privacy

EM360 legal information: https://em360s.com/legal
Privacy notice: https://em360s.com/legal/privacy

== Source code ==

The full source is public at https://github.com/harryvilleit/em360-educational-connector under GPLv2 or later. The React screens in `assets/student-portal-v024/` are built from its `ui/` folder with `npm ci && npm run build:wordpress`.

== Installation ==

1. Install and activate EM360 School Connector and connect your school.
2. Install and activate EM360 Student Portal.
3. Open **EM360** in the WordPress admin menu and choose **Create student portal page** (step 4), then add the page to your site menu.

== Frequently Asked Questions ==

= Do students need an EM360 account? =

Yes. Students sign in with the EM360 student account their school created.

= Can I put the portal on another page? =

Yes. Place `[em360_student_portal]` on any page. The page created from the setup screen is used as the student sign-in return address.

== Changelog ==

= 1.0.1 =
The EM360 logo in the portal sidebar now shows on school websites. When the browser is signed in to the parent portal, the student page offers to sign out of it first.

= 1.0.0 =
First release as an add-on. Previously part of the self-hosted EM360 School Connector package.

== Upgrade Notice ==

= 1.0.1 =
Logo fix and parent portal sign-in handling.

= 1.0.0 =
First release.
