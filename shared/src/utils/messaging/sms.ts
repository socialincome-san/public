export interface SendSmsProps {
	messageRecipientPhone: string,
    smsServiceId: string,
    smsServiceSecret: string,
    statusCallbackUrl: URL,
    messageSenderPhone: string,
	content: string
}

export const sendSms = async ({
	messageRecipientPhone,
    smsServiceId,
    smsServiceSecret,
    statusCallbackUrl,
    messageSenderPhone,
    content: content
}: SendSmsProps) => {
	let messageStatus = 'failed';
	let messageSid = 'unknown';

	const client = require('twilio')(smsServiceId, smsServiceSecret);

	await client.messages
		.create({
			body: content,
			from: messageSenderPhone,
			statusCallback: statusCallbackUrl,
			to: messageRecipientPhone,
		})
		.then((message: any) => {
			console.log(message);
			messageSid = message.sid;
			messageStatus = message.status;
		});

	return [messageSid, messageStatus];
};
