import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface Attachment {
	filename: string;
	path: string;
}

interface SendEmailProps {
	from?: string;
	to?: string;
	subject: string;
	content: string;
	attachments?: Attachment[];
	user: string;
	password: string;
}

export const sendEmail = async (
	{ from = 'no-reply@socialincome.org', to, subject, content, attachments = [], user, password }: SendEmailProps,
) => {
	let transporter: Transporter;
	if (!user) {
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
	} else {
		transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: { user: user, pass: password },
		});
	}
	const info = await transporter.sendMail({
		from: from,
		to: to,
		bcc: 'earchive@socialincome.org',
		subject: subject,
		html: content,
		attachments: attachments,
	});
	console.log('Message sent: %s', info.messageId);
};
