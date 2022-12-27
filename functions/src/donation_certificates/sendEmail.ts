import * as fs from 'fs';
import handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { User } from '../../../shared/src/types';
import { NOTIFICATION_EMAIL_PASSWORD, NOTIFICATION_EMAIL_USER } from '../config';
import { DonationCertificateLocales, getEmailTemplate } from './locales';

export const sendDonationCertificateEmail = async (
	user: User,
	year: number,
	path: string,
	locales: DonationCertificateLocales
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
	const emailTemplate = getEmailTemplate(user.language);
	const info = await transporter.sendMail({
		from: 'noreply@socialincome.org',
		to: user.email,
		bcc: 'earchive@socialincome.org',
		subject: locales['email-subject'],
		html: handlebars.compile(fs.readFileSync(emailTemplate, 'utf-8'))({ firstname: user.personal?.name, year }),
		attachments: [
			{
				filename: locales['filename-prefix'] + year + '.pdf',
				path: path,
			},
		],
	});
	console.log('Message sent: %s', info.messageId);
};
