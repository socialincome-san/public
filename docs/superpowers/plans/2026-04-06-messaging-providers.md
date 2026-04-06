# Messaging Providers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all three messaging providers (Twilio SMS, Twilio WhatsApp, SendGrid Email) so the messaging service can send messages across all channels.

**Architecture:** Each provider is a self-contained class extending `BaseService` and implementing `MessageProvider`. Providers own their SDK client initialization, env var validation, and error handling. They are registered in `services.ts` and looked up by channel via `MessageProviderRegistry`.

**Tech Stack:** Twilio SDK (`twilio`), SendGrid Mail SDK (`@sendgrid/mail`), Prisma enums for channel types.

---

### Task 1: Update dependencies

**Files:**
- Modify: `website/package.json` (twilio and @sendgrid/mail version ranges)

- [ ] **Step 1: Update twilio version**

In `website/package.json`, update the twilio dependency:

```json
"twilio": "^5.13.1",
```

- [ ] **Step 2: Update @sendgrid/mail version**

In `website/package.json`, the version is already `^8.1.3` which resolves to `8.1.6` (latest). No change needed — the caret range covers the latest. Skip if already current.

- [ ] **Step 3: Install updated dependencies**

Run: `npm install`
Expected: Lock file updates, no errors.

- [ ] **Step 4: Commit**

```bash
git add website/package.json package-lock.json
git commit -m "chore: update twilio to ^5.13.1"
```

---

### Task 2: Implement TwilioWhatsAppProvider

**Files:**
- Modify: `website/src/lib/services/messaging/providers/twilio-whatsapp.provider.ts` (replace stub)

**Reference:** `website/src/lib/services/messaging/providers/twilio-sms.provider.ts` — this provider mirrors it exactly, with the `whatsapp:` prefix on `from` and `to`.

- [ ] **Step 1: Replace the stub with full implementation**

Replace the entire contents of `twilio-whatsapp.provider.ts` with:

```typescript
import { PrismaClient } from '@/generated/prisma/client';
import { MessageChannel } from '@/generated/prisma/enums';
import { logger } from '@/lib/utils/logger';
import { Twilio } from 'twilio';
import { BaseService } from '../../core/base.service';
import { ServiceResult } from '../../core/base.types';
import { MessageProvider, SendMessageRequest, SendMessageResponse } from './message-provider';

export class TwilioWhatsAppProvider extends BaseService implements MessageProvider {
	readonly channel = MessageChannel.whatsapp;

	private twilioClient?: Twilio;

	private readonly twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
	private readonly twilioApiKeySid = process.env.TWILIO_API_KEY_SID;
	private readonly twilioApiKeySecret = process.env.TWILIO_API_KEY_SECRET;
	private readonly twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async send(request: SendMessageRequest): Promise<ServiceResult<SendMessageResponse>> {
		try {
			const clientResult = this.getTwilioClient();
			if (!clientResult.success) {
				return clientResult;
			}

			const message = await clientResult.data.messages.create({
				to: `whatsapp:${request.to}`,
				body: request.body,
				from: `whatsapp:${this.twilioPhoneNumber}`,
			});

			this.logger.info('Twilio WhatsApp message sent successfully', { sid: message.sid, to: request.to });

			return this.resultOk({ externalId: message.sid });
		} catch (error) {
			this.logger.error('Failed to send Twilio WhatsApp message', { error, to: request.to });

			return this.resultFail(
				`Failed to send WhatsApp message: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private getTwilioClient(): ServiceResult<Twilio> {
		if (this.twilioClient) {
			return this.resultOk(this.twilioClient);
		}

		const envCheck = this.requireTwilioEnvVars();
		if (!envCheck.success) {
			return envCheck;
		}

		try {
			this.twilioClient = new Twilio(this.twilioApiKeySid, this.twilioApiKeySecret, {
				accountSid: this.twilioAccountSid,
			});

			return this.resultOk(this.twilioClient);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Failed to initialize Twilio client');
		}
	}

	private requireTwilioEnvVars(): ServiceResult<void> {
		if (!this.twilioAccountSid || !this.twilioApiKeySid || !this.twilioApiKeySecret || !this.twilioPhoneNumber) {
			return this.resultFail('Missing Twilio environment variables for WhatsApp provider');
		}

		if (!this.twilioAccountSid.startsWith('AC')) {
			return this.resultFail('Invalid TWILIO_ACCOUNT_SID format');
		}

		if (!this.twilioApiKeySid.startsWith('SK')) {
			return this.resultFail('Invalid TWILIO_API_KEY_SID format');
		}

		return this.resultOk(undefined);
	}
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run typecheck` from repo root
Expected: No new errors in `twilio-whatsapp.provider.ts`

- [ ] **Step 3: Commit**

```bash
git add website/src/lib/services/messaging/providers/twilio-whatsapp.provider.ts
git commit -m "feat: implement Twilio WhatsApp provider"
```

---

### Task 3: Implement SendGridEmailProvider

**Files:**
- Create: `website/src/lib/services/messaging/providers/sendgrid-email.provider.ts`

**Reference:** `website/src/lib/services/messaging/providers/twilio-sms.provider.ts` — same structure (BaseService + MessageProvider), adapted for SendGrid.

**SendGrid API notes:**
- `sgMail.send()` returns `Promise<[ClientResponse, {}]>`
- The `x-message-id` header in `ClientResponse.headers` is the external ID
- `ClientResponse` has `{ statusCode, body, headers }`

- [ ] **Step 1: Create the SendGrid email provider**

Create `website/src/lib/services/messaging/providers/sendgrid-email.provider.ts`:

```typescript
import { PrismaClient } from '@/generated/prisma/client';
import { MessageChannel } from '@/generated/prisma/enums';
import { logger } from '@/lib/utils/logger';
import sgMail from '@sendgrid/mail';
import { BaseService } from '../../core/base.service';
import { ServiceResult } from '../../core/base.types';
import { MessageProvider, SendMessageRequest, SendMessageResponse } from './message-provider';

export class SendGridEmailProvider extends BaseService implements MessageProvider {
	readonly channel = MessageChannel.email;

	private initialized = false;

	private readonly sendGridApiKey = process.env.SENDGRID_API_KEY;
	private readonly sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL;

	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async send(request: SendMessageRequest): Promise<ServiceResult<SendMessageResponse>> {
		const initResult = this.initialize();
		if (!initResult.success) {
			return initResult;
		}

		try {
			const [response] = await sgMail.send({
				to: request.to,
				from: this.sendGridFromEmail!,
				subject: request.subject ?? '',
				text: request.body,
			});

			const externalId = response.headers['x-message-id'] as string | undefined;

			this.logger.info('SendGrid email sent successfully', { externalId, to: request.to });

			return this.resultOk({ externalId: externalId ?? '' });
		} catch (error) {
			this.logger.error('Failed to send SendGrid email', { error, to: request.to });

			return this.resultFail(
				`Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private initialize(): ServiceResult<void> {
		if (this.initialized) {
			return this.resultOk(undefined);
		}

		const envCheck = this.requireEnvVars();
		if (!envCheck.success) {
			return envCheck;
		}

		sgMail.setApiKey(this.sendGridApiKey!);
		this.initialized = true;

		return this.resultOk(undefined);
	}

	private requireEnvVars(): ServiceResult<void> {
		if (!this.sendGridApiKey || !this.sendGridFromEmail) {
			return this.resultFail('Missing SendGrid environment variables (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL)');
		}

		return this.resultOk(undefined);
	}
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run typecheck` from repo root
Expected: No new errors in `sendgrid-email.provider.ts`

- [ ] **Step 3: Commit**

```bash
git add website/src/lib/services/messaging/providers/sendgrid-email.provider.ts
git commit -m "feat: implement SendGrid email provider"
```

---

### Task 4: Register providers in services.ts

**Files:**
- Modify: `website/src/lib/services/services.ts` (add imports and registration calls)

- [ ] **Step 1: Add imports for the new providers**

At the top of `services.ts`, alongside the existing TwilioSmsProvider import (line 42), add:

```typescript
import { TwilioWhatsAppProvider } from './messaging/providers/twilio-whatsapp.provider';
import { SendGridEmailProvider } from './messaging/providers/sendgrid-email.provider';
```

- [ ] **Step 2: Register new providers**

After the existing `messageProviderRegistry.register(new TwilioSmsProvider(prisma));` (line 191), add:

```typescript
messageProviderRegistry.register(new TwilioWhatsAppProvider(prisma));
messageProviderRegistry.register(new SendGridEmailProvider(prisma));
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run typecheck` from repo root
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add website/src/lib/services/services.ts
git commit -m "feat: register WhatsApp and email providers in service registry"
```

---

### Task 5: Remove @sendgrid/mail from knip ignore list

**Files:**
- Modify: `website/knip.config.ts` (remove `@sendgrid/mail` from ignored dependencies)

`@sendgrid/mail` was listed as an ignored dependency in knip because it was unused. Now that it's imported by `SendGridEmailProvider`, it should be removed from the ignore list.

- [ ] **Step 1: Remove @sendgrid/mail from knip ignore**

In `website/knip.config.ts`, remove `'@sendgrid/mail'` from the `ignoreDependencies` array.

- [ ] **Step 2: Commit**

```bash
git add website/knip.config.ts
git commit -m "chore: remove @sendgrid/mail from knip ignore list"
```

---

### Task 6: Final verification

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 2: Run lint**

Run: `npm run website:lint`
Expected: No errors in provider files.

- [ ] **Step 3: Run unit tests**

Run: `npm run website:test:unit`
Expected: All existing tests pass, no regressions.
