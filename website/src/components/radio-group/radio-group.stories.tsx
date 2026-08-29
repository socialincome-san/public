import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RadioGroup, RadioGroupItem } from './radio-group';

const meta = {
	title: 'Components/RadioGroup',
	component: RadioGroup,
	tags: ['autodocs'],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=64-316&p=f&t=ZZwJWMAYTvt843S0-0',
		},
	},
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<RadioGroup defaultValue="monthly">
			<div className="flex items-center gap-2">
				<RadioGroupItem id="monthly" value="monthly" />
				<label htmlFor="monthly">Monthly</label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="yearly" value="yearly" />
				<label htmlFor="yearly">Yearly</label>
			</div>
		</RadioGroup>
	),
};

export const Preselected: Story = {
	render: () => (
		<RadioGroup defaultValue="yearly">
			<div className="flex items-center gap-2">
				<RadioGroupItem id="preselected-monthly" value="monthly" />
				<label htmlFor="preselected-monthly">Monthly</label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="preselected-yearly" value="yearly" />
				<label htmlFor="preselected-yearly">Yearly</label>
			</div>
		</RadioGroup>
	),
};

export const DisabledItem: Story = {
	render: () => (
		<RadioGroup defaultValue="monthly">
			<div className="flex items-center gap-2">
				<RadioGroupItem id="disabled-item-monthly" value="monthly" />
				<label htmlFor="disabled-item-monthly">Monthly</label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="disabled-item-yearly" value="yearly" disabled />
				<label htmlFor="disabled-item-yearly">Yearly</label>
			</div>
		</RadioGroup>
	),
};

export const DisabledGroup: Story = {
	render: () => (
		<RadioGroup defaultValue="monthly" disabled>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="disabled-group-monthly" value="monthly" />
				<label htmlFor="disabled-group-monthly">Monthly</label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="disabled-group-yearly" value="yearly" />
				<label htmlFor="disabled-group-yearly">Yearly</label>
			</div>
		</RadioGroup>
	),
};
