import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PersonCircles } from '../../data-display/person-circles/person-circles';
import { PersonNav } from '../../navigation/person-nav/person-nav';
import { PersonHero } from './person-hero';

const circle = (name: string) => ({ label: `${name} Circle`, href: `#${name.toLowerCase()}` });
const more = { href: '#circles', getLabel: (count: number) => `${count} more circles` };

const circles = (active: string[], interested: string[] = [], withPhoto = true) => (
	<PersonCircles
		image={withPhoto ? { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Aminata Kamara' } : null}
		initials="AK"
		activeCircles={active.map(circle)}
		interestedCircles={interested.map(circle)}
		legend={{ active: 'Active Member', interested: 'Follower' }}
		more={more}
	/>
);

const meta = {
	title: 'Layout/PersonHero',
	component: PersonHero,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The hero of a person page, in the frame of the landing page hero: name, role and country, a few numbers, a call to action with external links, a visual such as `PersonCircles`, and a footer such as `PersonNav`. Every part but the name is optional.',
			},
		},
	},
	args: {
		firstName: 'Aminata',
		lastName: 'Kamara',
		role: 'Management',
		country: { code: 'CH', name: 'Switzerland' },
		status: { label: 'Active volunteer', variant: 'active' },
		stats: [
			{ value: '6', label: 'years volunteering', description: 'Volunteering since Mar 1, 2019' },
			{
				value: '16+',
				label: 'hours a week',
				description: (
					<>
						<p>Work style: Ad hoc</p>
						<p>Likes deadlines</p>
					</>
				),
			},
			{
				value: '4',
				label: 'circles',
				description: (
					<>
						<p>Active member in 4 circles</p>
						<p>Follower in 2 circles</p>
					</>
				),
			},
		],
		action: { label: 'Volunteer with Aminata', href: '#volunteer' },
		links: [
			{ label: 'LinkedIn', href: 'https://www.linkedin.com' },
			{ label: 'GitHub', href: 'https://github.com' },
		],
		externalLinkLabel: '(opens in a new tab)',
		visual: circles(['Technology', 'Partnership', 'Operation', 'Community'], ['Communication', 'Finance']),
		footer: (
			<PersonNav
				label="Volunteers"
				previous={{ label: 'Previous', name: 'Kerrin Dieckmann', shortName: 'Kerrin', href: '#previous' }}
				next={{ label: 'Next', name: 'Mohamed Sesay', shortName: 'Mohamed', href: '#next' }}
				all={{ label: 'See all', count: 58, href: '#all' }}
			/>
		),
	},
} satisfies Meta<typeof PersonHero>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneCircleWithoutPhoto: Story = {
	args: {
		visual: circles(['Operation'], [], false),
		stats: [
			{ value: '10', label: 'months volunteering' },
			{ value: '1', label: 'circle' },
		],
	},
};

export const NoCircles: Story = {
	args: { visual: circles([]), stats: [{ value: '2', label: 'years volunteering' }] },
};

export const FormerVolunteer: Story = {
	args: {
		status: { label: 'Former volunteer', variant: 'inactive' },
		stats: [{ value: '2', label: 'circles' }],
		visual: circles(['Technology', 'Community']),
	},
};

export const LongName: Story = {
	args: { firstName: 'Maximiliana Alexandrina', lastName: 'von Hohenzollern-Sigmaringen' },
};

export const MissingStats: Story = {
	args: { stats: [], role: undefined, links: [] },
};

export const NameOnly: Story = {
	args: {
		role: undefined,
		country: undefined,
		status: undefined,
		stats: [],
		action: undefined,
		links: [],
		visual: circles([]),
		footer: undefined,
	},
};
