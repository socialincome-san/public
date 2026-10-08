import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../actions/button/button';
import { TickerPill } from '../../actions/ticker-pill/ticker-pill';
import { SocialIncomeLogo } from '../../brand/logo/logo';
import { AvatarStack } from '../../data-display/avatar-stack/avatar-stack';
import { Badge } from '../../data-display/badge/badge';
import { Card } from '../../data-display/card/card';
import { ContributorsCard } from '../../data-display/contributors-card/contributors-card';
import { PeopleStack } from '../../data-display/people-stack/people-stack';
import { BlockWrapper } from '../../layout/block-wrapper/block-wrapper';
import { Breadcrumb } from '../../navigation/breadcrumb/breadcrumb';
import { Backstage, BackstagePanel } from './backstage';

const portrait = '/assets/storybook/placeholder-portrait.svg';

const pageContributors = [
	{ label: 'Content', people: [{ name: 'Aminata Kamara', imageSrc: portrait, href: '#' }] },
	{
		label: 'Translation',
		people: [
			{ name: 'Sara Rossi', href: '#' },
			{ name: 'Léa Dubois', imageSrc: portrait, href: '#' },
		],
	},
	{ label: 'Design', people: [{ name: 'Lukas Meier', imageSrc: portrait, href: '#' }] },
	{ label: 'Development', people: [{ name: 'Nando Schär', href: '#' }] },
];

const firstNames = ['Fatmata', 'Kofi', 'Ibrahim', 'Nando', 'Mia', 'Lukas', 'Sara', 'Léa', 'Jonas', 'Aminata'];
const lastNames = ['Sesay', 'Mensah', 'Koroma', 'Schär', 'Keller', 'Meier', 'Rossi', 'Dubois', 'Weber', 'Kamara'];

const volunteers = (count: number, offset: number) =>
	Array.from({ length: count }, (_, index) => ({
		name: `${firstNames[(index + offset) % 10]} ${lastNames[Math.floor(index / 10 + offset) % 10]}`,
		imageSrc: index % 3 === 0 ? portrait : undefined,
		href: '#',
	}));

const worlds = [
	{
		name: 'In the countries',
		tag: 'On site',
		text: 'Recipient onboarding, partner visits and payout monitoring in Freetown, Accra and Monrovia.',
		people: volunteers(12, 0),
	},
	{
		name: 'In the code',
		tag: 'Remote',
		text: 'An open repository anyone can read, fork and fix. 12 open issues have nobody on them — take one.',
		people: volunteers(17, 3),
	},
	{
		name: 'In the day-to-day',
		tag: 'Remote',
		text: 'Fundraising, communication, translation, research, finance and the board — the majority of this community.',
		people: volunteers(34, 6),
	},
];

const roles = [
	{ role: 'Fundraising', person: { name: 'Jonas Weber', imageSrc: portrait }, email: 'jonas.weber@example.org' },
	{ role: 'Translation', person: { name: 'Léa Dubois' }, email: 'lea.dubois@example.org' },
	{ role: 'Field research', person: { name: 'Fatmata Sesay', imageSrc: portrait }, email: 'fatmata.sesay@example.org' },
	{ role: 'Development', person: { name: 'Mia Keller' }, email: 'mia.keller@example.org' },
];

const waysIn = [
	{ name: 'Join a field trip', effort: 'Applications twice a year' },
	{ name: 'Translate a page', effort: '~2 hours' },
	{ name: 'Write for the journal', effort: 'A few hours' },
	{ name: 'Pick up a coding task', effort: 'An evening' },
];

const articles = [
	{ title: 'Two weeks in Freetown', author: 'Sara Rossi' },
	{ title: 'How we onboard new volunteers', author: 'Jonas Weber' },
	{ title: 'Open source, open books', author: 'Nando Schär' },
];

const PanelHeading = ({ children }: { children: string }) => (
	<h3 className="text-foreground text-xl font-bold">{children}</h3>
);

const BehindTheScenesPanel = () => (
	<BackstagePanel>
		<h2 className="text-3xl md:text-4xl">
			<span className="block">Made by many.</span>
			<strong className="block font-bold">Open to all.</strong>
		</h2>
		<div className="flex flex-col gap-3">
			<p className="text-base">
				<a href="#" className="text-foreground font-medium underline">
					64 volunteers
				</a>{' '}
				across 9 countries make Social Income possible. This page is maintained by:
			</p>
			<ContributorsCard
				roles={pageContributors}
				showMoreLabel="Show all contributors"
				showLessLabel="Show fewer contributors"
				footer={
					<div className="flex flex-wrap items-center justify-between gap-3">
						<span className="text-foreground text-base">Found a mistake?</span>
						<Button asChild variant="outline" size="sm">
							<a href="mailto:aminata.kamara@example.org" aria-label="Email Aminata Kamara about this page">
								Reach out
							</a>
						</Button>
					</div>
				}
			/>
		</div>
		<section className="flex flex-col gap-4">
			<PanelHeading>Join on the ground or from anywhere</PanelHeading>
			{worlds.map((world) => (
				<Card key={world.name} padding="compact">
					<div className="flex flex-col gap-3">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
							<span className="text-foreground text-xl font-bold">{world.name}</span>
							<Badge>{world.tag}</Badge>
						</div>
						<p className="text-foreground text-base">{world.text}</p>
						<PeopleStack people={world.people} moreLabel={`+${world.people.length - 3} people`} lessLabel="Show less" />
					</div>
				</Card>
			))}
		</section>
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<PanelHeading>Which one are you?</PanelHeading>
				<p className="text-muted-foreground text-base">
					Social Income runs on 16 roles. Here are 4 — ask the person doing it how to join in.
				</p>
			</div>
			<Card padding="compact">
				<ul className="flex flex-col">
					{roles.map(({ role, person, email }) => (
						<li
							key={role}
							className="border-border flex items-center gap-4 border-b py-3 first:pt-0 last:border-b-0 last:pb-0"
						>
							<AvatarStack people={[person]} size="xl" />
							<span className="flex min-w-0 flex-1 flex-col gap-0.5">
								<span className="text-foreground text-base font-medium">{role}</span>
								<span className="text-muted-foreground text-base">{person.name}</span>
							</span>
							<Button asChild variant="outline" size="sm">
								<a href={`mailto:${email}`} aria-label={`Email ${person.name} about ${role}`}>
									Reach out
								</a>
							</Button>
						</li>
					))}
				</ul>
			</Card>
		</section>
		<section className="flex flex-col gap-4">
			<PanelHeading>Still no idea? Here are some ways in.</PanelHeading>
			<Card padding="compact">
				<div className="flex flex-col gap-4">
					<dl className="flex flex-col">
						{waysIn.map((way) => (
							<div
								key={way.name}
								className="border-border flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0"
							>
								<dt className="text-base">{way.name}</dt>
								<dd className="text-muted-foreground shrink-0 text-sm">{way.effort}</dd>
							</div>
						))}
					</dl>
					<Button fullWidth>Join the community</Button>
				</div>
			</Card>
		</section>
		<section className="flex flex-col gap-4">
			<PanelHeading>Further reading</PanelHeading>
			{articles.map((article) => (
				<a
					key={article.title}
					href="#"
					className="bg-card border-border flex items-center gap-4 rounded-2xl border p-4 shadow-lg transition-transform hover:-translate-y-0.5"
				>
					<span className="bg-muted size-16 shrink-0 rounded-lg" />
					<span className="flex min-w-0 flex-1 flex-col gap-1">
						<span className="text-foreground text-base leading-snug font-semibold">{article.title}</span>
						<span className="text-muted-foreground text-sm">Article by {article.author}</span>
					</span>
					<ChevronRight className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
				</a>
			))}
		</section>
	</BackstagePanel>
);

const DemoPage = ({ initialOpen }: { initialOpen: boolean }) => {
	const [open, setOpen] = useState(initialOpen);

	return (
		<Backstage
			open={open}
			onOpenChange={setOpen}
			panelLabel="The people behind this page"
			closeLabel="Close"
			panel={<BehindTheScenesPanel />}
		>
			<div className="bg-website-gradient text-primary flex min-h-screen flex-col gap-8 pb-24 antialiased">
				<header className="w-site-width max-w-content mx-auto flex items-center justify-between py-6">
					<SocialIncomeLogo />
					<Button size="md">Donate now</Button>
				</header>
				<BlockWrapper disableMarginTop disableMarginBottom>
					<div className="bg-muted flex aspect-[21/9] items-end rounded-3xl p-10">
						<h1 className="text-5xl font-bold md:text-6xl">Sierra Leone Unconditional</h1>
					</div>
				</BlockWrapper>
				<BlockWrapper disableMarginTop disableMarginBottom>
					<div className="flex flex-wrap items-center justify-between gap-4">
						<Breadcrumb
							links={[
								{ href: '#', label: 'Home' },
								{ href: '#', label: 'Programs' },
								{ href: '#', label: 'Sierra Leone Unconditional' },
							]}
						/>
						<TickerPill
							items={['An open source project', 'Made by 64 volunteers', 'Anyone can contribute', 'See who keeps it going']}
							label="Show the people behind this page"
							people={pageContributors.flatMap((role) => role.people).slice(0, 3)}
							onClick={() => setOpen(true)}
							expanded={open}
						/>
					</div>
				</BlockWrapper>
				<BlockWrapper disableMarginTop disableMarginBottom>
					<div className="grid gap-8 lg:grid-cols-2">
						{['About the program', 'How the money is spent', 'Recipients', 'Partners'].map((title) => (
							<Card key={title}>
								<div className="flex flex-col gap-4">
									<h2 className="text-3xl font-bold">{title}</h2>
									<p className="text-lg leading-relaxed">
										Social Income provides unconditional cash transfers to people living in poverty in Sierra Leone, paid out
										every month via mobile money.
									</p>
								</div>
							</Card>
						))}
					</div>
				</BlockWrapper>
			</div>
		</Backstage>
	);
};

const meta = {
	title: 'Overlays/Backstage',
	component: Backstage,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Slides the whole page aside to reveal a panel behind it. Wrap the app shell in `Backstage` and open it from anywhere on the page, for example with a `TickerPill`. Put the panel content in a `BackstagePanel`, whose children slide in one after another. Closes with the close button, Escape or a click on the page.',
			},
			// The panel is fixed to the viewport, so each story gets its own frame
			story: { inline: false, iframeHeight: 640 },
		},
	},
	render: () => <DemoPage initialOpen={false} />,
} satisfies Meta<typeof Backstage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {
	args: {
		open: false,
		onOpenChange: () => undefined,
		panel: null,
		panelLabel: 'The people behind this page',
		closeLabel: 'Close',
		children: null,
	},
};

export const Open: Story = {
	...Closed,
	render: () => <DemoPage initialOpen />,
};
