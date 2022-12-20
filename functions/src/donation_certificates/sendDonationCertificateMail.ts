const nodemailer = require("nodemailer");
import { Entity, User } from '../../../shared/src/types';

export const sendDonationCertificateMail = async (userEntity: Entity<User>, year: number, path: string) => {

    let user = userEntity.values;

    let translations = user.language === 'DE' ? GERMAN_TRANSLATIONS : (
            user.language === 'FR' ? FRENCH_TRANSLATIONS : ENGLISH_TRANSLATIONS);

    let transporter: any;

    if ((process.env.NOTIFICATION_EMAIL_USER && process.env.NOTIFICATION_EMAIL_PASSWORD)) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.NOTIFICATION_EMAIL_USER,
                pass: process.env.NOTIFICATION_EMAIL_PASSWORD
            }
          });

    } else {
        let testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user, 
              pass: testAccount.pass,
            },
          });
        
        console.log('------------------------------------------------------');
        console.log("If you want to check out the emails received, go to ethereal.mail and use the credentials below:")
        console.log("EMAIL TEST USER: " + testAccount.user);
        console.log("EMAIL TEST PASSWORD: " + testAccount.pass);
        console.log('------------------------------------------------------');

    }

    const attachmentFilename = translations['donation-certificate-mail.filename-prefix'] + year + ".pdf";

    let htmlTemplate = "";
    if (user.language === 'DE') {
        htmlTemplate = '../shared/emails/transactional/donation-certificate-email-de.html';
    } else if (user.language === 'FR') {
        htmlTemplate = '../shared/emails/transactional/donation-certificate-email-fr.html';
    } else {
        htmlTemplate = '../shared/emails/transactional/donation-certificate-email-en.html';
    }

    let info = await transporter.sendMail({
        from: "noreply@socialincome.org",
        to: user.email,
        bbc: 'earchive@socialincome.org',
        subject: translations['donation-certificate-mail.subject'],
        html: { path: htmlTemplate},
        attachments: [
            { 
                filename: attachmentFilename,
                path: path
            }
        ]
    });

    console.log("Message sent: %s", info.messageId);

};



interface TranslationStub {
	'donation-certificate-mail.subject': string;
	'donation-certificate-mail.filename-prefix': string;
}

const GERMAN_TRANSLATIONS: TranslationStub = {
	'donation-certificate-mail.subject': 'Social Income Spendenbescheingiung',
	'donation-certificate-mail.filename-prefix': 'Social Income Spendenbescheinigung '
};


const ENGLISH_TRANSLATIONS: TranslationStub = {
	'donation-certificate-mail.subject': 'Social Income Donation Certificate',
	'donation-certificate-mail.filename-prefix': 'Social Income Donation Certificate '
};


const FRENCH_TRANSLATIONS: TranslationStub = {
	'donation-certificate-mail.subject': 'Social Income Attestation de don',
	'donation-certificate-mail.filename-prefix': 'Social Income Attestation de don '
};