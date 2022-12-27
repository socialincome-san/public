import * as fs from 'fs';
import handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as LOCALES_DE from '../../../shared/locales/de/donation-certificate.json';
import * as LOCALES_EN from '../../../shared/locales/en/donation-certificate.json';
import * as LOCALES_FR from '../../../shared/locales/fr/donation-certificate.json';
import { Entity, User } from '../../../shared/src/types';
import { NOTIFICATION_EMAIL_PASSWORD, NOTIFICATION_EMAIL_USER } from '../config';

export const sendDonationCertificateMail = async (userEntity: Entity<User>, year: number, path: string) => {
	const user = userEntity.values;
	let locales;
	let templateDir;
	switch (user.language) {
		case 'DE':
			locales = LOCALES_DE;
			templateDir = 'dist/assets/emails/transactional/donation-certificate-email-de.handlebars';
			break;
		case 'FR':
			locales = LOCALES_FR;
			templateDir = 'dist/assets/emails/transactional/donation-certificate-email-fr.handlebars';
			break;
		default:
			locales = LOCALES_EN;
			templateDir = 'dist/assets/emails/transactional/donation-certificate-email-en.handlebars';
	}

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
		from: 'noreply@socialincome.org',
		to: user.email,
		bcc: 'earchive@socialincome.org',
		subject: locales['email-subject'],
		html: handlebars.compile(fs.readFileSync(templateDir, 'utf-8'))({ firstname: user.personal?.name, year }),
		attachments: [
			{
				filename: locales['filename-prefix'] + year + '.pdf',
				path: path,
			},
		],
	});
	console.log('Message sent: %s', info.messageId);
};
