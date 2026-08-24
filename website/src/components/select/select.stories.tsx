import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const currencies = [
	{ value: 'chf', label: 'CHF' },
	{ value: 'eur', label: 'EUR' },
	{ value: 'usd', label: 'USD' },
	{ value: 'gbp', label: 'GBP' },
	{ value: 'cad', label: 'CAD' },
	{ value: 'aud', label: 'AUD' },
	{ value: 'jpy', label: 'JPY' },
	{ value: 'sek', label: 'SEK' },
	{ value: 'nok', label: 'NOK' },
	{ value: 'dkk', label: 'DKK' },
];

const meta = {
	title: 'Components/Select',
	component: Select,
	tags: ['autodocs'],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=118-1264&p=f&t=JhRcgeLN4He1gEQ1-0',
		},
	},
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Select>
			<SelectTrigger>
				<SelectValue placeholder="Choose a currency" />
			</SelectTrigger>
			<SelectContent>
				{currencies.slice(0, 3).map((currency) => (
					<SelectItem key={currency.value} value={currency.value}>
						{currency.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	),
};

export const SelectedValue: Story = {
	render: () => (
		<Select defaultValue="chf">
			<SelectTrigger>
				<SelectValue placeholder="Choose a currency" />
			</SelectTrigger>
			<SelectContent>
				{currencies.slice(0, 3).map((currency) => (
					<SelectItem key={currency.value} value={currency.value}>
						{currency.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	),
};

export const Disabled: Story = {
	render: () => (
		<Select disabled>
			<SelectTrigger>
				<SelectValue placeholder="Choose a currency" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="chf">CHF</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const ManyOptions: Story = {
	render: () => (
		<Select defaultOpen>
			<SelectTrigger>
				<SelectValue placeholder="Choose a currency" />
			</SelectTrigger>
			<SelectContent className="max-h-64">
				{currencies.map((currency) => (
					<SelectItem key={currency.value} value={currency.value}>
						{currency.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	),
};
