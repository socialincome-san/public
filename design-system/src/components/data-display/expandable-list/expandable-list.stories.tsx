import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Badge } from '../badge/badge';
import { StatusMeter } from '../status-meter/status-meter';
import { ExpandableList, ExpandableListItem } from './expandable-list';

const fields = [
	{ label: 'Mobile money', value: <Badge variant="verified">Condition met</Badge>, detail: 'Three active providers.' },
	{ label: 'Network coverage', value: <Badge variant="verified">Condition met</Badge>, detail: '91% of the population.' },
	{ label: 'Markets', value: <Badge variant="destructive">Not met</Badge>, detail: 'Markets may be impaired.' },
	{ label: 'Sanctions', value: <Badge variant="secondary">Restrictions</Badge>, detail: 'Sanctions apply.' },
];

const summary = (
	<StatusMeter
		items={[
			{ label: 'Markets', status: 'positive' },
			{ label: 'Mobile money', status: 'positive' },
			{ label: 'Network', status: 'negative' },
			{ label: 'Sanctions', status: 'caution' },
		]}
		label="2/4"
		description="2 of 4 conditions met"
	/>
);

const meta = {
	title: 'Data Display/Expandable List',
	component: ExpandableList,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A stacked list for containers too narrow for a table with the same data. Opening an item never moves its fields: a narrow list (phone) shows only the title and summary while closed and stacks the fields as rows when open; a wide list (tablet) always shows the fields side by side and adds their details below.',
			},
		},
	},
} satisfies Meta<typeof ExpandableList>;

export default meta;

type Story = StoryObj<typeof meta>;

const narrow: Story['decorators'] = [
	(Story) => (
		<div className="max-w-sm">
			<Story />
		</div>
	),
];

export const Default: Story = {
	decorators: narrow,
	args: {
		children: (
			<>
				<ExpandableListItem title="Ghana" summary={summary} fields={fields} open={false} onOpenChange={() => undefined} />
				<ExpandableListItem title="Sierra Leone" fields={fields} open={false} onOpenChange={() => undefined} />
			</>
		),
	},
};

export const Open: Story = {
	decorators: narrow,
	args: {
		children: (
			<>
				<ExpandableListItem title="Ghana" summary={summary} fields={fields} open onOpenChange={() => undefined} />
				<ExpandableListItem title="Sierra Leone" fields={fields} open={false} onOpenChange={() => undefined} />
			</>
		),
	},
};

export const OpenWithActions: Story = {
	decorators: narrow,
	args: {
		children: (
			<ExpandableListItem
				title="Ghana"
				actions={
					<Button variant="secondary" size="sm">
						Country page
					</Button>
				}
				fields={fields}
				open
				onOpenChange={() => undefined}
			/>
		),
	},
};

export const Selected: Story = {
	decorators: narrow,
	args: {
		children: (
			<>
				<ExpandableListItem
					title="Ghana"
					leading={<input type="radio" aria-label="Ghana" checked readOnly />}
					fields={fields}
					open={false}
					onOpenChange={() => undefined}
					selected
				/>
				<ExpandableListItem
					title="Sierra Leone"
					leading={<input type="radio" aria-label="Sierra Leone" readOnly />}
					fields={fields}
					open={false}
					onOpenChange={() => undefined}
				/>
			</>
		),
	},
};

export const Wide: Story = {
	decorators: [
		(Story) => (
			<div className="w-[46rem]">
				<Story />
			</div>
		),
	],
	args: {
		children: (
			<>
				<ExpandableListItem title="Ghana" summary={summary} fields={fields} open onOpenChange={() => undefined} />
				<ExpandableListItem
					title="Sierra Leone"
					summary={summary}
					fields={fields}
					open={false}
					onOpenChange={() => undefined}
				/>
			</>
		),
	},
};
