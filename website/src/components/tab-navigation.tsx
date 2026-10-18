'use client';

import { usePortalSharedTranslations } from '@/components/portal-shared-translations';
import { TabNavigation as TabNavigationLinks } from '@socialincome/design-system/navigation/tab-navigation/tab-navigation';
import { usePathname } from 'next/navigation';

type Section = {
	href: string;
	label: string;
};

type TabNavigationProps = {
	sections: Section[];
};

const sectionTranslationKeys = {
	Website: 'tab.website',
	Portal: 'tab.portal',
	Monitoring: 'tab.monitoring',
	Management: 'tab.management',
	Delivery: 'tab.delivery',
	Messaging: 'tab.messaging',
	Profile: 'tab.profile',
	Templates: 'tab.templates',
	'Delivery log': 'tab.deliveryLog',
	Account: 'tab.account',
	Organization: 'tab.organization',
	'Payout Confirmation': 'tab.payoutConfirmation',
	'Upcoming Surveys': 'tab.upcomingSurveys',
	'Upcoming Onboarding': 'tab.upcomingOnboarding',
	Organizations: 'tab.organizations',
	Users: 'tab.users',
	'Local Partners': 'tab.localPartners',
	'Candidate Pool': 'tab.candidatePool',
	Expenses: 'tab.expenses',
	'Exchange Rates': 'tab.exchangeRates',
	Countries: 'tab.countries',
	Focuses: 'tab.focuses',
	'Mobile Money Providers': 'tab.mobileMoneyProviders',
	'Sent emails': 'tab.sentEmails',
	'Audit log': 'tab.auditLog',
	Overview: 'tab.overview',
	Recipients: 'tab.recipients',
	Payouts: 'tab.payouts',
	'Payout Forecast': 'tab.payoutForecast',
	Surveys: 'tab.surveys',
	'Ongoing Payouts': 'tab.ongoingPayouts',
	Contributors: 'tab.contributors',
	Contributions: 'tab.contributions',
	Subscriptions: 'tab.subscriptions',
	'Donation Certificates': 'tab.donationCertificates',
} as const;

const isSectionTranslationKey = (label: string): label is keyof typeof sectionTranslationKeys =>
	Object.hasOwn(sectionTranslationKeys, label);

export const TabNavigation = ({ sections }: TabNavigationProps) => {
	const pathname = usePathname();
	const { isPortal, t } = usePortalSharedTranslations();

	return (
		<TabNavigationLinks
			links={sections.map(({ href, label }) => {
				const translationKey = isSectionTranslationKey(label) ? sectionTranslationKeys[label] : undefined;

				return {
					href,
					label: isPortal && translationKey ? t(translationKey, label) : label,
					active: pathname === href || pathname.startsWith(`${href}/`) || pathname.endsWith(href),
				};
			})}
		/>
	);
};
