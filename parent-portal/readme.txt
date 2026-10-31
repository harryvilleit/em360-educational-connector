=== EM360 Parent Portal ===
Contributors: harryvilleit
Tags: parent portal, school, education, school fees, attendance
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 8.1
Requires Plugins: em360-educational-management
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds the EM360 parent portal to a school website connected with EM360 School Connector.

== Description ==

This add-on for [EM360 School Connector](https://wordpress.org/plugins/em360-educational-management/) gives parents and guardians their own portal page on the school's website. Parents sign in with their EM360 parent account and see only the records of their own children at the school:

* Overview of each child, results and report cards, attendance, timetable and school calendar
* School fees: invoices, fee breakdown, payment history, optional items, and paying from the wallet or by card
* Courses and subjects, optional subjects, and lesson progress
* Chat and messages with the school, consent requests, visitation and transcript requests, health notifications and learner support
* Rating the school

**How it works.**

* It uses the school connection set up in EM360 School Connector, so the school connects only once.
* Parent, student and staff sign-ins are kept apart: each session opens only its own portal.
* Every request goes through the connector's server-side gateway, which forwards only the operations listed in `resources/parent-portal-routes.json`. The EM360 School API checks each one against the signed-in parent's own children.
* Card payments open the payment provider's secure checkout in a new tab. Card details are never entered on, sent to or stored by the school's website.
* The screens are the same React screens as the EM360 parent portal, served from this plugin in a frame on your own domain.

== External service ==

This plugin uses the EM360 platform operated by HarryVille Solutions Ltd, through EM360 School Connector.

* **When:** when a parent signs in, and on every parent portal screen that loads or saves records.
* **What is sent:** sign-in authorisation codes and session credentials, and the records the signed-in parent views or submits (for example chat messages, attachments, school ratings and fee payment requests).
* **Where:** the HTTPS EM360 School API address set in EM360 School Connector, and the EM360 sign-in website (https://em360s.com).

When a parent chooses to pay by card, EM360 starts the payment with the payment provider the school uses, and the provider's checkout page opens in a new browser tab. The parent's payment details go only to that provider. Providers include:

* **Paystack.** Terms: https://paystack.com/terms · Privacy: https://paystack.com/privacy
* **Stripe.** Terms: https://stripe.com/legal/ssa · Privacy: https://stripe.com/privacy

Lesson videos may also load from **Cloudflare Stream**, **YouTube** or **Vimeo** when the school added them from those services. Cloudflare terms: https://www.cloudflare.com/website-terms/ · Cloudflare privacy: https://www.cloudflare.com/privacypolicy/ · YouTube terms: https://www.youtube.com/t/terms · Google privacy: https://policies.google.com/privacy · Vimeo terms: https://vimeo.com/terms · Vimeo privacy: https://vimeo.com/privacy

EM360 legal information: https://em360s.com/legal
Privacy notice: https://em360s.com/legal/privacy

== Source code ==

The full source is public at https://github.com/harryvilleit/em360-educational-connector under GPLv2 or later. The React screens in `assets/parent-portal-v027/` are built from its `ui/` folder with `npm ci && npm run build:wordpress`.

== Installation ==

1. Install and activate EM360 School Connector (0.28.0 or later) and connect your school.
2. Install and activate EM360 Parent Portal.
3. Open **EM360** in the WordPress admin menu and choose **Create parent portal page**, then add the page to your site menu.

== Frequently Asked Questions ==

= Do parents need an EM360 account? =

Yes. Parents sign in with the EM360 parent account linked to their children at the school.

= Can a parent see other children? =

No. The EM360 School API only returns records for the children linked to the signed-in parent at this school.

= Where do card payments happen? =

On the payment provider's own checkout page, opened in a new tab. After paying, the parent returns to the portal and refreshes to see the updated balance.

= Can I put the portal on another page? =

Yes. Place `[em360_parent_portal]` on any page. The page created from the setup screen is used as the parent sign-in return address.

== Changelog ==

= 1.0.0 =
First release.

== Upgrade Notice ==

= 1.0.0 =
First release.
