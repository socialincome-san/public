import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { Building2, Handshake, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../actions/button/button';
import { IconList } from '../../data-display/icon-list/icon-list';
import { Separator } from '../../data-display/separator/separator';
import { AuthStatus } from '../../feedback/auth-status/auth-status';
import { MagicLinkForm } from '../../forms/magic-link-form/magic-link-form';
import { LoginLink } from '../../navigation/login-link/login-link';
import { SiteFooter } from '../../navigation/site-footer/site-footer';
import { Default as FooterDefault } from '../../navigation/site-footer/site-footer.stories';
import { SiteHeader } from '../../navigation/site-header/site-header';
import { SiteMenuDesktop } from '../../navigation/site-header/site-menu-desktop';
import { BlockWrapper } from '../block-wrapper/block-wrapper';
import { AuthPanel, AuthPanelQuote } from './auth-panel';

const destinations = [
	{
		id: 'dashboard',
		icon: <LayoutDashboard />,
		title: 'Dashboard',
		description: 'For contributors: contributions and receipts',
	},
	{ id: 'partner-space', icon: <Handshake />, title: 'Partner Space', description: 'For local partners' },
	{ id: 'portal', icon: <Building2 />, title: 'Portal', description: 'For organizations running programs' },
];

const MagicLinkDemo = () => {
	const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string>();

	const submit = (value: string) => {
		if (!/^\S+@\S+\.\S+$/.test(value)) {
			setError('Please enter a valid email address.');

			return;
		}
		setError(undefined);
		setEmail(value);
		setState('sending');
		setTimeout(() => setState('sent'), 1200);
	};

	return state === 'sent' ? (
		<AuthStatus
			status="sent"
			title="Check your inbox"
			description={
				<>
					If an account exists for <strong>{email}</strong>, we’ve sent you a link to sign in.
				</>
			}
			hint="Nothing arrived? Check your spam folder."
		>
			<Button variant="outline" size="md" fullWidth onClick={() => setState('idle')}>
				Use a different email
			</Button>
		</AuthStatus>
	) : (
		<div className="flex flex-col gap-8">
			<MagicLinkForm
				title="Sign in to Social Income"
				description="One login for contributors, partners and program teams. We’ll take you to the right place."
				emailLabel="Email"
				emailPlaceholder="you@example.org"
				submitLabel="Send login link"
				sendingLabel="Sending…"
				defaultEmail={email}
				error={error}
				sending={state === 'sending'}
				onSubmit={submit}
			/>
			<Separator />
			<IconList title="Where you’ll land" items={destinations} />
		</div>
	);
};

const onGradient: Decorator = (Story) => (
	<div className="bg-website-gradient py-12">
		<BlockWrapper marginTop="none" marginBottom="none">
			<div className="mx-auto max-w-5xl">
				<Story />
			</div>
		</BlockWrapper>
	</div>
);

const meta = {
	title: 'Layout/AuthPanel',
	component: AuthPanel,
	tags: ['autodocs'],
	args: {
		image: {
			src: '/assets/storybook/market-sierra-leone.jpg',
			alt: 'Women carrying goods on their heads through a market street in Sierra Leone',
		},
		caption: (
			<AuthPanelQuote
				quote="We are living in a world of opportunities, let’s make sure we share this privilege with everyone else."
				author="Carlos, United States"
			/>
		),
		footer: (
			<>
				Trouble signing in?{' '}
				<a className="text-foreground underline underline-offset-4" href="mailto:support@socialincome.org">
					support@socialincome.org
				</a>
			</>
		),
		children: <MagicLinkDemo />,
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Card for sign-in flows inside the website shell: the form on the left, a photo with an optional quote on the right. On small screens the photo becomes a banner above the form.',
			},
		},
	},
} satisfies Meta<typeof AuthPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MagicLink: Story = {
	decorators: [onGradient],
};

export const WithoutCaption: Story = {
	args: { caption: undefined },
	decorators: [onGradient],
};

export const InWebsiteShell: Story = {
	decorators: [
		(Story) => (
			<div className="bg-website-gradient relative flex min-h-screen flex-col lg:pt-5">
				<SiteHeader
					homeHref="/"
					homeLinkLabel="Social Income home"
					desktopMenu={
						<SiteMenuDesktop
							entries={[
								{ type: 'link', id: 'journal', label: 'Journal', href: '/journal' },
								{ type: 'link', id: 'faq', label: 'FAQ', href: '/faq' },
							]}
						/>
					}
					mobileMenu={null}
					account={<LoginLink href="/login" label="Login" />}
					donateAction={<Button size="md">Donate now</Button>}
				/>
				<div className="flex-1 py-10 lg:mt-20 lg:py-16">
					<BlockWrapper marginTop="none" marginBottom="none">
						<div className="mx-auto max-w-5xl">
							<Story />
						</div>
					</BlockWrapper>
				</div>
				<SiteFooter groups={FooterDefault.args?.groups ?? []} copyright={FooterDefault.args?.copyright} />
			</div>
		),
	],
};

export const ConfirmLogin: Story = {
	args: {
		children: (
			<AuthStatus status="confirm" title="Complete sign in" description="Click the button below to complete sign in.">
				<Button size="md" fullWidth>
					Complete sign in
				</Button>
			</AuthStatus>
		),
	},
	decorators: [onGradient],
};
