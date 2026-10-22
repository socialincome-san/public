import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { Textarea } from './textarea';

const meta = {
	title: 'Forms/Textarea',
	component: Textarea,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: { component: 'Multiline text input with bordered and bare variants and optional resize control.' },
		},
	},
	args: { 'aria-label': 'Description', placeholder: 'Describe your image ...', rows: 2 },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Bare: Story = { args: { variant: 'bare' } };
export const NonResizable: Story = { args: { variant: 'bare', resize: 'none' } };
export const VerticalResize: Story = { args: { resize: 'vertical' } };
export const Disabled: Story = { args: { disabled: true } };
