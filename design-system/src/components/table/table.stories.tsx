import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

const meta = {
	title: 'Components/Table',
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
