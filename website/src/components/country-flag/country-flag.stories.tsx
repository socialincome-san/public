import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CountryFlag } from './country-flag';

const meta = {
	title: 'Components/CountryFlag',
	component: CountryFlag,
	tags: ['autodocs'],
	args: {
		country: 'CH',
		size: 'lg',
		decorative: false,
	},
	argTypes: {
		country: {
			control: 'select',
			options: ['CH', 'DE', 'KE', 'IN', 'GH'],
		},
		size: {
			control: 'select',
			options: ['sm', 'lg'],
		},
		decorative: {
			control: 'boolean',
		},
	},
} satisfies Meta<typeof CountryFlag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Large: Story = {};

export const Small: Story = {
	args: {
		size: 'sm',
	},
};

export const SeveralCountries: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<CountryFlag country="CH" />
			<CountryFlag country="DE" />
			<CountryFlag country="KE" />
			<CountryFlag country="IN" />
			<CountryFlag country="GH" />
		</div>
	),
};
