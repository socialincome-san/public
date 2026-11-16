import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AfricaMap } from './africa-map';

const regions = ['northern', 'western', 'central', 'eastern', 'southern'];

const meta = {
	title: 'Data Display/AfricaMap',
	component: AfricaMap,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Map of Africa with the outlines of all countries. The countries passed in are highlighted and marked; hovering, focusing or tapping one opens a popup with its flag, its name, an optional `detail` such as a number of people, and a link if the country has a page. Countries with a page are links themselves. Every other country reacts to the pointer with a slight tint. The map fills the width of its parent, which sets the size. `appearance` sets the colour of the land or swaps it for a satellite image, on which a border only shows while its country is hovered. `highlightColor` sets the colour of the highlighted countries: yellow and white stand out on the satellite image, white also on the blue and dark maps. `shadedRegion` tints the countries of a region of the UN geoscheme, `zoom` shows one region instead of the whole continent. Cabo Verde, Mauritius and the Seychelles lie far out in the ocean: the map only widens to include them when they are highlighted.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="bg-website-gradient px-4 py-24">
				<div className="mx-auto max-w-2xl">
					<Story />
				</div>
			</div>
		),
	],
	argTypes: {
		appearance: { control: 'select', options: ['light', 'blue', 'dark', 'satellite'] },
		highlightColor: { control: 'select', options: ['gradient', 'yellow', 'white'] },
		shadedRegion: { control: 'select', options: [undefined, 'subSaharan', ...regions] },
		zoom: { control: 'select', options: [undefined, ...regions] },
	},
	args: {
		label: 'Map of Africa',
		countries: [
			{ code: 'sl', name: 'Sierra Leone', href: '/countries/sierra-leone', detail: '1,250 recipients' },
			{ code: 'lr', name: 'Liberia', href: '/countries/liberia', detail: '480 recipients' },
			{ code: 'gh', name: 'Ghana', href: '/countries/ghana' },
			{ code: 'ke', name: 'Kenya', href: '/countries/kenya', detail: '120 recipients' },
		],
	},
} satisfies Meta<typeof AfricaMap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blue: Story = {
	args: { appearance: 'blue' },
};

export const Dark: Story = {
	args: { appearance: 'dark' },
};

export const Satellite: Story = {
	args: { appearance: 'satellite' },
};

export const SatelliteWithClouds: Story = {
	args: { appearance: 'satellite', clouds: true },
};

export const YellowHighlights: Story = {
	args: { appearance: 'satellite', highlightColor: 'yellow' },
};

export const WhiteHighlights: Story = {
	args: { appearance: 'satellite', highlightColor: 'white' },
};

export const ShadedRegion: Story = {
	args: { shadedRegion: 'subSaharan' },
};

export const Zoom: Story = {
	args: { zoom: 'western', shadedRegion: 'western' },
};

export const SatelliteZoom: Story = {
	args: { appearance: 'satellite', clouds: true, zoom: 'eastern' },
};

export const WithoutPages: Story = {
	args: {
		countries: [
			{ code: 'sn', name: 'Senegal' },
			{ code: 'ng', name: 'Nigeria' },
			{ code: 'cd', name: 'Democratic Republic of the Congo' },
			{ code: 'tz', name: 'Tanzania', href: '/countries/tanzania' },
		],
	},
};

export const SmallCountries: Story = {
	args: {
		countries: [
			{ code: 'gm', name: 'Gambia', href: '/countries/gambia' },
			{ code: 'tg', name: 'Togo', href: '/countries/togo' },
			{ code: 'rw', name: 'Rwanda', href: '/countries/rwanda' },
			{ code: 'bi', name: 'Burundi', href: '/countries/burundi' },
			{ code: 'dj', name: 'Djibouti', href: '/countries/djibouti' },
			{ code: 'ls', name: 'Lesotho', href: '/countries/lesotho' },
			{ code: 'st', name: 'São Tomé and Príncipe', href: '/countries/sao-tome-and-principe' },
			{ code: 'km', name: 'Comoros', href: '/countries/comoros' },
		],
	},
};

export const IslandStates: Story = {
	args: {
		countries: [
			{ code: 'cv', name: 'Cabo Verde', href: '/countries/cabo-verde' },
			{ code: 'sc', name: 'Seychelles', href: '/countries/seychelles' },
			{ code: 'mu', name: 'Mauritius', href: '/countries/mauritius' },
			{ code: 'mg', name: 'Madagascar', href: '/countries/madagascar' },
		],
	},
};

export const NoHighlights: Story = {
	args: { countries: [] },
};
