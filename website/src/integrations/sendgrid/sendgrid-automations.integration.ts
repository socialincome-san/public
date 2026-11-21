import { resultFail, resultOk, type Result } from '@/lib/result';
import { Client } from '@sendgrid/client';
import { z } from 'zod';

export type SendgridAutomation = {
	name: string;
	status: string;
	// ISO 8601 durations after the previous step, e.g. PT0S or P4D.
	steps: { sendTiming: string; subject: string }[];
};

const automationListSchema = z.array(z.object({ id: z.string(), name: z.string() }));

const automationSchema = z.object({
	name: z.string(),
	status: z.string(),
	steps: z.array(
		z.object({
			send_timing: z.string(),
			messages: z.array(z.object({ subject: z.string() })),
		}),
	),
});

// The Marketing Automations endpoints are not in SendGrid's public API reference,
// but answer for keys with Marketing read access.
export const listSendgridAutomations = async (names: string[]): Promise<Result<SendgridAutomation[]>> => {
	const apiKey = process.env.SENDGRID_API_KEY?.trim();
	if (!apiKey) {
		return resultFail('SendGrid is not configured');
	}

	try {
		const client = new Client();
		client.setApiKey(apiKey);
		const [listResponse] = await client.request({ method: 'GET', url: '/v3/marketing/automations' });
		const list = automationListSchema.parse(listResponse.body);

		const automations = await Promise.all(
			list
				.filter((automation) => names.includes(automation.name))
				.map(async (automation) => {
					const [response] = await client.request({
						method: 'GET',
						url: `/v3/marketing/automations/${automation.id}`,
					});
					const detail = automationSchema.parse(response.body);

					return {
						name: detail.name,
						status: detail.status,
						steps: detail.steps.map((step) => ({
							sendTiming: step.send_timing,
							subject: step.messages[0]?.subject.trim() ?? '',
						})),
					};
				}),
		);

		return resultOk(automations.sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name)));
	} catch (error) {
		console.error('Could not list SendGrid automations', { error });

		return resultFail('Could not load SendGrid automations');
	}
};
