const TWILIO_CONSOLE_BASE = 'https://1console.twilio.com/account';

export const twilioTemplateUrl = (accountSid: string, sid: string) =>
	`${TWILIO_CONSOLE_BASE}/${accountSid}/us1/templates/${sid}`;

export const twilioMessageLogUrl = (accountSid: string, messageSid: string) =>
	`${TWILIO_CONSOLE_BASE}/${accountSid}/us1/messaging-logs/${messageSid}`;
