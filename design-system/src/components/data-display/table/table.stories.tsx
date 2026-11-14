import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

const meta = {
	title: 'Data Display/Table',
	component: Table,
	tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Country</TableHead>
					<TableHead>Recipients</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Ghana</TableCell>
					<TableCell>128</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Sierra Leone</TableCell>
					<TableCell>86</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-8">
			{(['sm', 'default', 'lg'] as const).map((size) => (
				<Table key={size} size={size}>
					<TableHeader>
						<TableRow>
							<TableHead>Country ({size})</TableHead>
							<TableHead>Recipients</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Ghana</TableCell>
							<TableCell>128</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Sierra Leone</TableCell>
							<TableCell>86</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			))}
		</div>
	),
};

export const StickyHeader: Story = {
	render: () => (
		<div className="h-64 overflow-y-auto">
			<Table stickyHeader>
				<TableHeader sticky>
					<TableRow>
						<TableHead>Country</TableHead>
						<TableHead>Recipients</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 12 }, (_, index) => (
						<TableRow key={index}>
							<TableCell>Country {index + 1}</TableCell>
							<TableCell>{(index + 1) * 12}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	),
};

export const InteractiveRows: Story = {
	render: () => (
		<Table>
			<TableBody>
				<TableRow onClick={() => undefined} data-state="selected">
					<TableCell>Selected row</TableCell>
				</TableRow>
				<TableRow onClick={() => undefined}>
					<TableCell>Clickable row</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	),
};

const transferColumns = ['Country', 'Poverty line', 'CPI adjustment', 'Adjusted poverty line', 'Transfer value'];
const transferRows = [
	['Sierra Leone', 'SLE 330 (2018)', '350%', 'SLE 1160', 'SLE 800'],
	['Liberia', 'LRD 5450 (2017)', '120%', 'LRD 11970', 'LRD 8,050'],
	['Ghana', 'GHS 150 (2013)', '420%', 'GHS 465', 'GHS 335'],
];

const ContentTable = ({ surface, textSize }: { surface: 'none' | 'card'; textSize?: 'default' | 'lg' }) => (
	<Table surface={surface} caption="Amounts per person and month.">
		<TableHeader variant="content" textSize={textSize}>
			<TableRow>
				{transferColumns.map((column) => (
					<TableHead key={column} variant="content" verticalAlign="top">
						{column}
					</TableHead>
				))}
			</TableRow>
		</TableHeader>
		<TableBody textSize={textSize}>
			{transferRows.map(([country, ...values]) => (
				<TableRow key={country}>
					<TableHead variant="contentRow" scope="row" verticalAlign="top">
						{country}
					</TableHead>
					{values.map((value, index) => (
						<TableCell key={transferColumns[index + 1]} verticalAlign="top">
							{value}
						</TableCell>
					))}
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export const Content: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Editorial tables, e.g. in journal articles: wrapping headers, row headers and a caption.',
			},
		},
	},
	render: () => <ContentTable surface="none" />,
};

export const ContentOnCard: Story = {
	parameters: {
		docs: { description: { story: 'The `card` surface sets the table on a white panel.' } },
	},
	render: () => (
		<div className="bg-muted p-8">
			<ContentTable surface="card" />
		</div>
	),
};

export const ContentLargeText: Story = {
	parameters: {
		docs: { description: { story: 'Header and body take `textSize="lg"` independently; here both are set.' } },
	},
	render: () => <ContentTable surface="none" textSize="lg" />,
};
