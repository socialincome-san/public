import { CountryCode } from '@/generated/prisma/enums';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CountryFlag } from './country-flag';

const meta = {
	title: 'Components/CountryFlag',
	component: CountryFlag,
	tags: ['autodocs'],
} satisfies Meta<typeof CountryFlag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Large: Story = {
	args: {
		country: CountryCode.GH,
	},
};

export const Small: Story = {
	args: {
		country: CountryCode.GH,
		size: 'sm',
	},
};

export const Fallback: Story = {
	args: {
		country: 'XX' as CountryCode,
	},
	render: (args) => <CountryFlag {...args} />,
};

export const SeveralCountries: Story = {
	args: {
		country: CountryCode.CH,
	},
	render: (args) => (
		<div className="flex gap-3">
			<CountryFlag {...args} />
			<CountryFlag country={CountryCode.GH} />
			<CountryFlag country={CountryCode.DE} />
			<CountryFlag country={CountryCode.BR} />
		</div>
	),
};
