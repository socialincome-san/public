const nodemailer = require("nodemailer");

export const sendDonationCertificateMail = async (data: any, translations: Map<string, string>) => {

    let transporter: any;

    if (!(process.env.NOTIFICATION_EMAIL_USER)) {
        let testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: testAccount.user, // generated ethereal user
              pass: testAccount.pass, // generated ethereal password
            },
          });
        
        console.log('------------------------------------------------------');
        console.log("If you want to check out the emails received, go to ethereal.mail and use the credentials below:")
        console.log("EMAIL TEST USER: " + testAccount.user);
        console.log("EMAIL TEST PASSWORD: " + testAccount.pass);
        console.log('------------------------------------------------------');

    } else {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.NOTIFICATION_EMAIL_USER,
                pass: process.env.NOTIFICATION_EMAIL_PASSWORD
            }
          })
    }

    const attachmentFilename = translations.get('donation-certificate-mail.filename-prefix') + data.year + ".pdf";

    let htmlTemplate = "";
    if (data.language === 'de') {
        htmlTemplate = '../shared/emails/transactional/donation-certificate-email-de.html';
    } else if (data.language === 'fr') {
        htmlTemplate = '../shared/emails/transactional/donation-certificate-email-fr.html';
    } else {
        htmlTemplate = '../shared/emails/transactional/donation-certificate-email-en.html';
    }

    let info = await transporter.sendMail({
        from: "noreply@socialincome.org",
        to: data.email,
        bbc: 'earchive@socialincome.org',
        subject: translations.get('donation-certificate-mail.subject'),
        html: { path: htmlTemplate},
        attachments: [
            { 
                filename: attachmentFilename,
                path: 'tempPdfFile.pdf'
            }
        ]
    });

    console.log("Message sent: %s", info.messageId);

};

export const generateDonationCertificateMailContent = async (data: any, translations: Map<string, string>) => {
    const htmlContent = `
        <p>${translations.get('donation-certificate-mail.salutation')} ${data.personal.name} ${data.personal.lastname}</p>
        <p>${translations.get('donation-certificate-mail.content-1')} ${data.year} ${translations.get('donation-certificate-mail.content-2')}</p>
        <p>${translations.get('donation-certificate-mail.content-3')}</p>
        <p>${translations.get('donation-certificate-mail.signature-1')}
            <br>${translations.get('donation-certificate-mail.signature-2')}
            <br>${translations.get('donation-certificate-mail.signature-3')}
        </p>
    `;

    return htmlContent
}