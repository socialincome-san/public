import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LayoutDashboard, Users } from 'lucide-react';
import { Button } from '../../actions/button/button';
import { LocaleCurrencySwitcher } from '../locale-currency-switcher/locale-currency-switcher';
import { LoginFlyout } from '../login-flyout/login-flyout';
import { SiteAccountMenu } from '../site-account-menu/site-account-menu';
import { SiteHeader, type SiteMenuEntry } from './site-header';
import { SiteMenuDesktop } from './site-menu-desktop';
import { SiteMenuMobile } from './site-menu-mobile';

const siteMenuEntries: SiteMenuEntry[] = [
	{
		type: 'dropdown',
		id: 'about',
		label: 'About us',
		groups: [
			{
				id: 'organisation',
				label: 'Organisation',
				links: [
					{ id: 'team', label: 'Team', href: '/en/int/about-us/team' },
					{ id: 'finances', label: 'Finances', href: '/en/int/about-us/finances' },
				],
				overview: { label: 'All about us', href: '/en/int/about-us' },
			},
			{
				id: 'programs',
				label: 'Programs',
				links: [
					{ id: 'sierra-leone', label: 'Sierra Leone', href: '/en/int/programs/sierra-leone' },
					{ id: 'transparency', label: 'Transparency', href: '/en/int/transparency' },
				],
			},
			{
				id: 'community',
				label: 'Community',
				links: [{ id: 'github', label: 'GitHub', href: 'https://github.com/socialincome-san/public', newTab: true }],
			},
		],
	},
	{ type: 'link', id: 'journal', label: 'Journal', href: '/en/int/journal' },
	{ type: 'link', id: 'faq', label: 'FAQ', href: '/en/int/faq' },
];

const DonationFormPlaceholder = () => (
	<div className="bg-card text-muted-foreground rounded-3xl p-6 text-sm">Donation form</div>
);

const DonateButton = () => <Button size="md">Donate now</Button>;

const localeSwitcher = (variant: 'ghost' | 'outline') => (
	<LocaleCurrencySwitcher
		ariaLabel="Change language, region, and currency"
		variant={variant}
		open={false}
		onOpenChange={() => undefined}
		language={{
			label: 'Language',
			value: 'en',
			options: [
				{ value: 'en', label: 'EN' },
				{ value: 'de', label: 'DE' },
			],
			onChange: () => undefined,
		}}
		region={{
			label: 'Region',
			value: 'ch',
			options: [
				{ value: 'int', label: 'International' },
				{ value: 'ch', label: 'Switzerland', flagCountry: 'CH' },
			],
			onChange: () => undefined,
		}}
		currency={{
			label: 'Currency',
			value: 'CHF',
			options: [
				{ value: 'CHF', label: 'CHF' },
				{ value: 'USD', label: 'USD' },
			],
			onChange: () => undefined,
		}}
	/>
);

const loginFlyout = (
	<LoginFlyout buttonLabel="Log in" title="Log in to Social Income">
		<p className="text-sm">Login form</p>
	</LoginFlyout>
);

const mobileMenu = (
	<SiteMenuMobile
		entries={siteMenuEntries}
		homeHref="/en/int"
		labels={{
			openMenu: 'Open menu',
			closeMenu: 'Close menu',
			title: 'Menu',
			back: 'Back',
			homeLink: 'Social Income home',
		}}
		renderDonateAction={() => <DonateButton />}
		footerControls={
			<>
				{localeSwitcher('outline')}
				{loginFlyout}
			</>
		}
	/>
);

const meta = {
	title: 'Navigation/SiteHeader',
	component: SiteHeader,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
	decorators: [
		(Story) => (
			<div className="bg-website-gradient relative min-h-96 lg:pt-5">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
	args: {
		homeHref: '/en/int',
		homeLinkLabel: 'Social Income home',
		desktopMenu: <SiteMenuDesktop entries={siteMenuEntries} dropdownAside={<DonationFormPlaceholder />} />,
		localeSwitcher: localeSwitcher('ghost'),
		account: loginFlyout,
		donateAction: <DonateButton />,
		mobileMenu,
	},
};

export const LoggedIn: Story = {
	args: {
		...LoggedOut.args,
		donateAction: undefined,
		account: (
			<SiteAccountMenu
				firstName="Jane"
				lastName="Doe"
				links={[
					{ href: '/portal', label: 'Go to portal', icon: Users },
					{ href: '/dashboard/subscriptions', label: 'Go to dashboard', icon: LayoutDashboard },
				]}
				signOutLabel="Sign out"
				onSignOut={() => undefined}
			/>
		),
	},
};
