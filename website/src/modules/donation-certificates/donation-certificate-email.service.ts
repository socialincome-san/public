import { defaultCurrency, defaultLanguage, getWebsiteBasePath } from '@/lib/i18n/utils';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { hasSentMailToWithSubject, sendMail } from '@/modules/mail/mail.service';
import * as donationCertificateRepository from './donation-certificate.repository.read';

export const sendDonationCertificateReadyEmails = async (
	year: number,
): Promise<Result<{ sentCount: number; skippedCount: number }>> => {
	const baseUrl = process.env.BASE_URL?.trim();
	if (!baseUrl) {
		return resultFail('Missing BASE_URL');
	}

	try {
		const certificates = await donationCertificateRepository.findDonationCertificatesForYear(year);
		const subject = `Your ${year} Social Income donation certificate is ready`;
		const certificateUrl = new URL(
			`${getWebsiteBasePath(defaultLanguage, defaultCurrency)}/dashboard/donation-certificates?search=${year}`,
			baseUrl,
		).toString();
		const emailedContributors = new Set<string>();
		let sentCount = 0;
		let skippedCount = 0;
		let failedCount = 0;

		for (const certificate of certificates) {
			if (emailedContributors.has(certificate.contributorId)) {
				continue;
			}
			emailedContributors.add(certificate.contributorId);

			const email = certificate.contributor.contact.email?.trim();
			if (!email) {
				skippedCount++;
				continue;
			}

			const sentResult = await hasSentMailToWithSubject(email, subject);
			if (!sentResult.success) {
				return resultFail(sentResult.error);
			}
			if (sentResult.data) {
				skippedCount++;
				continue;
			}

			const firstName = certificate.contributor.contact.firstName?.trim();
			const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
			const emailResult = await sendMail({
				to: email,
				subject,
				text: `${greeting}\n\nYour donation certificate for ${year} is ready. Sign in to your Social Income account to view and download it:\n${certificateUrl}`,
			});
			if (!emailResult.success) {
				failedCount++;
				continue;
			}

			sentCount++;
		}

		if (failedCount > 0) {
			console.error('Could not send all donation certificate emails', { year, failedCount });

			return resultFail('Could not send all donation certificate emails');
		}

		return resultOk({ sentCount, skippedCount });
	} catch (error) {
		console.error('Could not send donation certificate emails', { year, error });

		return resultFail('Could not send donation certificate emails');
	}
};
