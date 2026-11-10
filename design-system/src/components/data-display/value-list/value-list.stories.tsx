import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../overlays/tool-tip/tool-tip';
import { ValueList, ValueListDivider, ValueListRow } from './value-list';

const meta = {
	title: 'Data Display/Value List',
	component: ValueList,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A compact list of labels with right-aligned values, optionally split into groups by a divider. It inherits its text color, so it can sit inside a tooltip.',
			},
		},
	},
} satisfies Meta<typeof ValueList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: (
			<>
				<ValueListRow label="Active" value="31" />
				<ValueListRow label="Former" value="9" />
				<ValueListRow label="Suspended" value="2" />
			</>
		),
	},
};

export const WithDivider: Story = {
	args: {
		children: (
			<>
				<ValueListRow label="Active" value="31" />
				<ValueListRow label="Former" value="9" />
				<ValueListRow label="Suspended" value="2" />
				<ValueListDivider />
				<ValueListRow label="New (30 days)" value="4" />
				<ValueListRow label="Waitlisted" value="12" />
			</>
		),
	},
};

export const InTooltip: Story = {
	args: WithDivider.args,
	render: (args) => (
		<Tooltip defaultOpen>
			<TooltipTrigger asChild>
				<Button variant="outline">42 recipients</Button>
			</TooltipTrigger>
			<TooltipContent sideOffset={8}>
				<ValueList {...args} />
			</TooltipContent>
		</Tooltip>
	),
};
