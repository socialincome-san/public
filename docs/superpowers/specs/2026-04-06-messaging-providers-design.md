# Messaging Providers Implementation Design

## Overview

Implement all three messaging providers for the messaging service: Twilio SMS (already done), Twilio WhatsApp, and SendGrid Email. Each provider follows the existing `BaseService` + `MessageProvider` pattern established by `TwilioSmsProvider`.

## Providers

### TwilioWhatsAppProvider (complete existing stub)

- **File:** `website/src/lib/services/messaging/providers/twilio-whatsapp.provider.ts`
- **Channel:** `MessageChannel.whatsapp`
- **SDK:** `twilio` (existing dependency)
- **Pattern:** Mirrors `TwilioSmsProvider` exactly
- **Key difference:** Prepends `whatsapp:` to both `from` and `to` numbers
- **Env vars:** Same as SMS — `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_PHONE_NUMBER`
- **Client init:** Lazy, same validation (AC prefix for account SID, SK prefix for API key SID)

### SendGridEmailProvider (new file)

- **File:** `website/src/lib/services/messaging/providers/sendgrid-email.provider.ts`
- **Channel:** `MessageChannel.email`
- **SDK:** `@sendgrid/mail` (already installed, update to latest)
- **Pattern:** Same `BaseService` + `MessageProvider` structure
- **Env vars:** `SENDGRID_API_KEY` (existing), `SENDGRID_FROM_EMAIL` (new — verified sender address)
- **Client init:** Lazy via `sgMail.setApiKey()`
- **Send:** `sgMail.send({ to, from, subject, text: body })`, returns SendGrid message ID as `externalId`
- **Env validation:** Checks both env vars are present on first use

### TwilioSmsProvider (no changes)

Already fully implemented. Serves as the reference pattern.

## Package Updates

- Update `twilio` to latest in `website/package.json`
- Update `@sendgrid/mail` to latest in `website/package.json`

## What Does NOT Change

- `MessageProvider` interface — already supports `subject` in `SendMessageRequest`
- `MessageProviderRegistry` — generic registry, just registers providers
- `MessagingService` — already resolves email addresses for the `email` channel via `resolveAddressForChannel`

## File Changes Summary

| File | Action |
|------|--------|
| `providers/twilio-whatsapp.provider.ts` | Rewrite (replace stub) |
| `providers/sendgrid-email.provider.ts` | Create new |
| `website/package.json` | Update twilio and @sendgrid/mail versions |
