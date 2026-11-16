import { generateFirebaseSignInLink } from '@/integrations/firebase/firebase-auth.integration';
import { loadMessages } from '@/lib/i18n/messages';
import { getWebsiteBasePath, parseCurrencySegment, TIME_ZONE, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { sendMail } from '@/modules/mail/mail.service';
import { createTranslator } from 'next-intl';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { websiteLocaleSchema } from './auth.schemas';
import { deleteExpiredMagicLinkRateLimits, updateMagicLinkRateLimitCount } from './magic-link-rate-limit.repository';

const magicLinkWindowMs = 15 * 60 * 1000;
const magicLinkEmailLimit = 3;
const magicLinkIpLimit = 20;
const magicLinkRateLimitRetentionMs = 24 * 60 * 60 * 1000;

export const sendMagicLoginLink = async (input: {
	email: string;
	continueUrl: string;
	requestOrigin: string;
	requesterIp?: string;
}): Promise<Result<void>> => {
	const continueUrlResult = validateMagicLoginContinueUrl(input.email, input.continueUrl, input.requestOrigin);
	if (!continueUrlResult.success) {
		return resultFail(continueUrlResult.error);
	}

	const templateId = process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID?.trim();
	const rateLimitSecret = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
	if (!templateId || !rateLimitSecret) {
		sendSlackAlert('Magic-link email configuration is incomplete', {
			missingTemplateId: !templateId,
			missingRateLimitSecret: !rateLimitSecret,
		});

		return resultFail('Could not send sign-in link');
	}

	try {
		const now = new Date();
		await deleteExpiredMagicLinkRateLimits(new Date(now.getTime() - magicLinkRateLimitRetentionMs));

		const requesterIp = input.requesterIp?.trim() ?? '';
		const ipVersion = isIP(requesterIp);
		const ipBucket = ipVersion === 6 ? getIpv6RateLimitPrefix(requesterIp) : requesterIp;
		const ipKey = ipVersion ? hashMagicLinkRateLimitKey(rateLimitSecret, `ip:${ipBucket}`) : undefined;
		const emailKey = hashMagicLinkRateLimitKey(rateLimitSecret, `email:${input.email.toLowerCase()}:${ipKey ?? 'no-ip'}`);
		const [emailRequestCount, ipRequestCount] = await Promise.all([
			updateMagicLinkRateLimitCount(emailKey, now, magicLinkWindowMs),
			ipKey ? updateMagicLinkRateLimitCount(ipKey, now, magicLinkWindowMs) : Promise.resolve(0),
		]);
		if (emailRequestCount > magicLinkEmailLimit || ipRequestCount > magicLinkIpLimit) {
			return resultFail('magic-link-rate-limited');
		}

		const signInLinkResult = await generateFirebaseSignInLink(input.email, input.continueUrl);
		if (!signInLinkResult.success) {
			return resultFail('Could not send sign-in link');
		}

		const messages = await loadMessages(continueUrlResult.data.language);
		const t = createTranslator({
			locale: continueUrlResult.data.language,
			messages,
			namespace: 'website-login',
			timeZone: TIME_ZONE,
		});
		const emailResult = await sendMail({
			to: input.email,
			subject: t('magic-link-email.subject'),
			text: t('magic-link-email.archive'),
			template: {
				id: templateId,
				data: {
					logoUrl: new URL('/assets/logos_si/logo_color@2x.png', continueUrlResult.data.origin).toString(),
					subject: t('magic-link-email.subject'),
					previewText: t('magic-link-email.preview-text'),
					heading: t('magic-link-email.heading'),
					body: t('magic-link-email.body'),
					buttonText: t('magic-link-email.button'),
					magicLink: signInLinkResult.data,
					securityNotice: t('magic-link-email.security-notice'),
					ignoreNotice: t('magic-link-email.ignore-notice'),
					footer: t('magic-link-email.footer'),
				},
			},
			sensitive: true,
		});
		if (!emailResult.success) {
			console.error('Could not deliver Firebase magic-link email');

			return resultFail('Could not send sign-in link');
		}

		return resultOk(undefined);
	} catch {
		console.error('Could not process Firebase magic-link request');

		return resultFail('Could not send sign-in link');
	}
};

const validateMagicLoginContinueUrl = (
	email: string,
	continueUrl: string,
	requestOrigin: string,
): Result<{ language: WebsiteLanguage; origin: string }> => {
	try {
		const url = new URL(continueUrl);
		const origin = new URL(requestOrigin);
		if (url.origin !== origin.origin || url.username || url.password || url.hash) {
			return resultFail('Invalid sign-in continue URL');
		}

		const pathMatch = /^\/([^/]+)\/([^/]+)\/auth\/confirm-login$/.exec(url.pathname);
		if (!pathMatch) {
			return resultFail('Invalid sign-in continue URL');
		}

		const currency = parseCurrencySegment(pathMatch[2]);
		const localeResult = websiteLocaleSchema.safeParse({ lang: pathMatch[1], currency });
		if (
			!localeResult.success ||
			url.pathname !== `${getWebsiteBasePath(localeResult.data.lang, localeResult.data.currency)}/auth/confirm-login`
		) {
			return resultFail('Invalid sign-in continue URL');
		}

		const emailParameters = url.searchParams.getAll('email');
		const campaignParameters = url.searchParams.getAll('campaigns');
		if (
			emailParameters.length !== 1 ||
			emailParameters[0] !== email ||
			campaignParameters.length > 1 ||
			Array.from(url.searchParams.keys()).some((key) => key !== 'email' && key !== 'campaigns')
		) {
			return resultFail('Invalid sign-in continue URL');
		}

		if (campaignParameters.length === 1) {
			const claimIds = campaignParameters[0].split(',');
			if (claimIds.some((claimId) => !/^[A-Za-z0-9]{8}$/.test(claimId)) || new Set(claimIds).size !== claimIds.length) {
				return resultFail('Invalid sign-in continue URL');
			}
		}

		return resultOk({ language: localeResult.data.lang, origin: origin.origin });
	} catch {
		return resultFail('Invalid sign-in continue URL');
	}
};

const hashMagicLinkRateLimitKey = (secret: string, value: string): string =>
	createHmac('sha256', secret).update(value).digest('hex');

const getIpv6RateLimitPrefix = (ipAddress: string): string => {
	const [leftSide = '', rightSide = ''] = ipAddress.split('::');
	const leftGroups = leftSide.split(':').filter(Boolean);
	const rightGroups = rightSide.split(':').filter(Boolean);
	const missingGroupCount = 8 - leftGroups.length - rightGroups.length;
	const groups = [...leftGroups, ...Array.from({ length: missingGroupCount }, () => '0'), ...rightGroups];

	return groups
		.slice(0, 4)
		.map((group) => Number.parseInt(group, 16).toString(16).padStart(4, '0'))
		.join(':');
};
