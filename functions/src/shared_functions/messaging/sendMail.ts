import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { NOTIFICATION_EMAIL_PASSWORD, NOTIFICATION_EMAIL_USER } from '../../config';

export interface Attachment {
	filename: string
    path: string,
}

export const sendEmail = async (
    from: string,
    to: string,
    subject: string,
    content: string,
    attachments: Attachment[]
) => {
	let transporter: Transporter;
	if (NOTIFICATION_EMAIL_USER && NOTIFICATION_EMAIL_PASSWORD) {
		transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: { user: NOTIFICATION_EMAIL_USER, pass: NOTIFICATION_EMAIL_PASSWORD },
		});
	} else {
		const testAccount = await nodemailer.createTestAccount();
		transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: { user: testAccount.user, pass: testAccount.pass },
		});
		console.log('------------------------------------------------------');
		console.log('If you want to check out the emails received, go to ethereal.mail and use the credentials below:');
		console.log('EMAIL TEST USER: ' + testAccount.user);
		console.log('EMAIL TEST PASSWORD: ' + testAccount.pass);
		console.log('------------------------------------------------------');
	}
	const info = await transporter.sendMail({
		from: from,
		to: to,
		bcc: 'earchive@socialincome.org',
		subject: subject,
		html: content,
		attachments: attachments
	});
	console.log('Message sent: %s', info.messageId);
};