import { z } from 'zod';

// Only events of emails sent through sendNotification carry sent_email_id.
const sendgridEventSchema = z.object({
	event: z.string(),
	timestamp: z.number(),
	sent_email_id: z.string().optional(),
	reason: z.string().optional(),
	response: z.string().optional(),
});

export const sendgridEventsSchema = z.array(sendgridEventSchema);

export type SendgridEvent = z.infer<typeof sendgridEventSchema>;
