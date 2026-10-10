# 2026-10-10 Email (Resend) and SMS: plug-in guide

The code for email and SMS is written so that nothing is hard-wired to an account. With no keys set, the app runs normally and every email or SMS feature stays hidden or skipped. When you add the keys on Vercel and redeploy, the features switch on without any code change. This guide lists what was built, what each environment variable does, the exact steps to connect Resend and an SMS provider, how to check that it works, and what to do when it does not.

No key, token or secret is stored in either repository. Only the variable names are.

## 1. What uses email and SMS

| Feature | Email | SMS | Switch that enables it |
|---|---|---|---|
| Forgot and reset password | yes | no | email configured |
| Trip updates to the patient (assigned, picked up, completed, cancelled) | yes (if the patient allows it) | yes (if the patient allows it and has a phone) | channel configured and the patient's preference on |
| New contact message alert to the team | yes | no | email configured and `ADMIN_NOTIFY_EMAIL` set |
| Admin test messages (Integrations card) | yes | yes | channel configured |

Patient preferences live on `/dashboard/profile`: "Email updates" (default on) and "SMS updates" (default off, needs a valid phone number). A channel that is not configured is never offered to patients.

## 2. How it behaves without keys

- `GET /api/v1/public/capabilities` answers `{ email: false, sms: false, passwordReset: false }`. The frontend reads it and hides the "Forgot password?" link and the notification preferences.
- `POST /auth/forgot-password` still answers `200` with the usual generic message but creates no token and sends nothing (a warning is logged). This avoids revealing whether an address has an account and avoids a dead link.
- Trip status changes, contact submissions and payments are never blocked or slowed by a failing or missing provider: sending is wrapped in a try and a timeout, and a failure only writes a log line.
- The admin Integrations card shows "Not configured" and the test button returns "skipped".

## 3. Environment variables (backend project on Vercel)

| Variable | Required for | Example (placeholder) | Notes |
|---|---|---|---|
| `RESEND_API_KEY` | email | `re_xxxxxxxxxxxxxxxx` | from the Resend dashboard, API Keys |
| `EMAIL_FROM` | email | `RapidAid <no-reply@yourdomain.com>` | the domain must be verified in Resend |
| `ADMIN_NOTIFY_EMAIL` | contact alerts (optional) | `team@yourdomain.com` | where new contact messages are announced |
| `FRONTEND_URL` | links in emails | `https://emergency-ambulance-dispatch-fronte.vercel.app` | already set; no trailing slash |
| `SMS_PROVIDER` | SMS | `twilio` or `webhook` | selects the adapter |
| `TWILIO_ACCOUNT_SID` | SMS with Twilio | `ACxxxxxxxxxxxxxxxx` | |
| `TWILIO_AUTH_TOKEN` | SMS with Twilio | `xxxxxxxxxxxxxxxx` | |
| `TWILIO_FROM` | SMS with Twilio | `+15005550006` | a number you own; use this or the next one |
| `TWILIO_MESSAGING_SERVICE_SID` | SMS with Twilio | `MGxxxxxxxxxxxxxxxx` | alternative to `TWILIO_FROM` |
| `SMS_WEBHOOK_URL` | SMS through a gateway bridge | `https://sms-bridge.example.com/send` | see section 6 |
| `SMS_WEBHOOK_TOKEN` | SMS through a gateway bridge | `xxxxxxxxxxxxxxxx` | sent as a Bearer token |
| `SMS_SENDER_ID` | SMS (optional) | `RapidAid` | sender name passed to the webhook |

All of them are optional. Empty values count as unset. Nothing is needed on the frontend project: the frontend learns what is available from `/public/capabilities`.

## 4. Connect email with Resend

1. Create an account at resend.com.
2. Add your sending domain (Domains, Add Domain) and create the DNS records Resend shows (SPF, DKIM, and optionally DMARC). Wait until the domain shows as verified.
3. Create an API key (API Keys, Create API Key, permission "Sending access").
4. Add the variables to the backend Vercel project:
   ```bash
   cd ph-l2-b7-asnmnt-6
   printf 're_xxxxxxxxxxxxxxxx' | vercel env add RESEND_API_KEY production
   printf 'RapidAid <no-reply@yourdomain.com>' | vercel env add EMAIL_FROM production
   printf 'team@yourdomain.com' | vercel env add ADMIN_NOTIFY_EMAIL production
   ```
5. Redeploy so the new values are read, then move the pinned domain alias:
   ```bash
   vercel redeploy <latest-production-deployment-url> --target production
   vercel alias set <new-deployment-url> emergency-ambulance-dispatch-api.vercel.app
   ```
   (If you deploy by pushing to `master`, any push also redeploys. The alias step is still needed until the domain is assigned to the project, see the spec, B.5.)
6. Check it (section 7).

Until a domain is verified, Resend only lets you send test mail from its shared sender to the address of your own account. That is enough to try the flow: set `EMAIL_FROM` to the shared sender shown in the Resend docs and use your own address as the recipient.

## 5. Connect SMS

### Option A: Twilio
1. Create a Twilio account. A trial account can only text numbers you have verified in the console.
2. Get a sender: buy or use a phone number, or create a Messaging Service. Check Twilio's current rules for sending to Bangladesh (sender ID registration may be needed) before relying on it for real patients.
3. Add the variables:
   ```bash
   printf 'twilio' | vercel env add SMS_PROVIDER production
   printf 'ACxxxxxxxxxxxxxxxx' | vercel env add TWILIO_ACCOUNT_SID production
   printf 'xxxxxxxxxxxxxxxx' | vercel env add TWILIO_AUTH_TOKEN production
   printf '+15005550006' | vercel env add TWILIO_FROM production      # or TWILIO_MESSAGING_SERVICE_SID
   ```
4. Redeploy and move the alias as in section 4, then check it (section 7).

### Option B: any other gateway through the webhook adapter
Local gateways in Bangladesh each have their own request format, so the backend does not guess. Instead it posts one fixed JSON shape to a URL you control, and a tiny bridge (a serverless function, a Cloudflare Worker, or a small Express route) translates it to the gateway's API.

1. Set `SMS_PROVIDER=webhook`, `SMS_WEBHOOK_URL`, `SMS_WEBHOOK_TOKEN` and optionally `SMS_SENDER_ID`.
2. The backend sends:
   ```http
   POST <SMS_WEBHOOK_URL>
   Authorization: Bearer <SMS_WEBHOOK_TOKEN>
   Content-Type: application/json

   { "to": "+8801700000000", "message": "Your ambulance is on the way.", "sender": "RapidAid" }
   ```
   and treats any `2xx` as sent, anything else as failed.
3. Your bridge checks the token, calls the gateway, and answers `200`.
Phone numbers are normalised to E.164 before sending (`017...`, `8801...` and `+8801...` all become `+8801...`).

## 6. Password reset flow (needs email)

1. The login page shows "Forgot password?" when `capabilities.passwordReset` is true.
2. `/forgot-password`: the user enters an email; the page always says "If an account exists for that address, we sent a reset link".
3. The backend creates a random token, stores only its SHA-256 hash with a 30 minute expiry, invalidates older unused tokens of the user, and emails `FRONTEND_URL/reset-password?token=...`.
4. `/reset-password?token=...`: the user sets a new password (at least 8 characters with a letter and a number). The token works once. All sessions (refresh tokens) of the user are revoked.
5. Google-only accounts (no password) receive no email.

## 7. Check that it works

Without sending real patient traffic:

1. Sign in as admin (`admin@dispatch.demo`), open the admin overview, find the Integrations card. It shows Configured or Not configured for each channel and has a "Send test" form.
2. Or with curl (replace the token with an admin access token):
   ```bash
   B=https://emergency-ambulance-dispatch-api.vercel.app/api/v1
   curl -s $B/public/capabilities
   curl -s -XPOST $B/admin/integrations/test-email -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H 'content-type: application/json' -d '{"to":"you@example.com"}'
   curl -s -XPOST $B/admin/integrations/test-sms -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H 'content-type: application/json' -d '{"to":"+8801700000000"}'
   ```
   Answers: `{ sent: true }` when delivered to the provider, `{ sent: false, skipped: "not_configured" }` when keys are missing, `{ sent: false, error: "..." }` when the provider refused (the text is the provider's message, never the key).
3. End to end: with email on, use "Forgot password?" for a real address, open the link, set a password, sign in. With a channel on, switch on the preference in the profile and move a test trip through its statuses.

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Forgot password?" link missing | `RESEND_API_KEY` or `EMAIL_FROM` not set on the backend, or the backend was not redeployed | add both, redeploy, wait up to 60 s for the capabilities cache |
| Test email returns `not_configured` | variable name typo or set only for Preview | add to the Production environment, redeploy |
| Test email returns a provider error about the domain | `EMAIL_FROM` domain not verified in Resend | finish the DNS records, or use the shared sender for tests |
| Mail arrives in spam | missing SPF, DKIM or DMARC | add the records Resend lists, send from a subdomain such as `mail.yourdomain.com` |
| SMS test fails with an authentication error | wrong `TWILIO_ACCOUNT_SID` or `TWILIO_AUTH_TOKEN` | re-enter without quotes or trailing newline (use `printf`, not `echo`) |
| SMS works for you, not for patients | trial account, or country not enabled for the sender | upgrade the account and enable Bangladesh in the geo permissions |
| Patient does not get trip SMS | preference off, phone invalid, or channel not configured | check the profile switch, phone format and `/public/capabilities` |
| Emails link to `localhost` | `FRONTEND_URL` unset on the backend | set it to the live frontend URL and redeploy |

## 9. Security notes

- Keys live only in Vercel environment variables. Rotate them in the provider dashboard if they were ever pasted into a chat or a file.
- Logs record the channel, a masked recipient (`j***@example.com`, `***5678`), and the provider status code, never keys or message bodies with tokens.
- Names in notification emails are HTML-escaped.
- Reset tokens are stored hashed, expire in 30 minutes and are single use; the forgot endpoint never reveals whether an account exists.
- Both channels use the existing rate limits; the admin test endpoints are admin only.
- Messages contain no medical details and no street addresses.

## 10. Where the code is

Backend: `src/config/env.ts` (variables), `src/lib/email.ts`, `src/lib/emailTemplates.ts`, `src/lib/sms.ts` (adapters and phone normalisation), `src/lib/mask.ts` (log masking), `src/lib/notify.ts` (trip events), `src/modules/auth` (forgot and reset), `src/modules/public` (capabilities), `src/modules/admin` (test endpoints), migrations for `PasswordResetToken` and the `notifySms` and `notifyEmail` columns. Frontend: `/forgot-password`, `/reset-password`, the profile notification card, the admin Integrations card, hooks `usePublicCapabilities`, `useForgotPassword`, `useResetPassword`, `useAdminTestEmail`, `useAdminTestSms`.

Both migrations (`20261010160000_password_reset_token`, `20261010163000_user_notification_preferences`) are already applied to the database and the code is deployed. With no keys the live site reports `{ email: false, sms: false, passwordReset: false }` and shows none of the email or SMS UI except the admin Integrations card (status Not configured).
