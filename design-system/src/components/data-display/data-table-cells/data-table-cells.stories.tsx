import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table/table';
import {
	DataTableCopyUrlCell,
	DataTableDateCell,
	DataTableDaysCountCell,
	DataTableDownloadCell,
	DataTableGenderCell,
	DataTableIdCell,
	DataTableProgressCell,
	DataTableRowChevronCell,
	DataTableTextCell,
	DataTableValueCell,
} from './data-table-cells';

const meta = {
	title: 'Data Display/DataTableCells',
	component: DataTableTextCell,
	tags: ['autodocs'],
	args: {
		value: 'Aminata Kamara',
	},
} satisfies Meta<typeof DataTableTextCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Obfuscated: Story = {
	args: {
		value: 'Hidden value',
		obfuscated: true,
	},
};

const cells = [
	{ name: 'Text', cell: <DataTableTextCell value="Aminata Kamara" /> },
	{ name: 'Text (empty)', cell: <DataTableTextCell /> },
	{ name: 'Value', cell: <DataTableValueCell value="CHF 700.00" /> },
	{ name: 'Value (empty)', cell: <DataTableValueCell /> },
	{ name: 'Date', cell: <DataTableDateCell formattedDate="06.10.2026" /> },
	{ name: 'Days count', cell: <DataTableDaysCountCell days={5} /> },
	{ name: 'Days count (later)', cell: <DataTableDaysCountCell days={45} /> },
	{ name: 'Progress', cell: <DataTableProgressCell percent={33} received={12} total={36} /> },
	{ name: 'Progress (urgent)', cell: <DataTableProgressCell percent={92} received={33} total={36} urgent /> },
	{ name: 'Gender', cell: <DataTableGenderCell gender="female" /> },
	{ name: 'ID', cell: <DataTableIdCell id="clx2w7k9a0000s6ab1c2d3e4f" /> },
	{ name: 'Copy URL', cell: <DataTableCopyUrlCell url="https://socialincome.org/survey/abc" /> },
	{ name: 'Download', cell: <DataTableDownloadCell href="https://socialincome.org/certificate.pdf" /> },
	{ name: 'Download (unavailable)', cell: <DataTableDownloadCell unavailable /> },
	{ name: 'Row chevron', cell: <DataTableRowChevronCell /> },
];

export const AllCells: Story = {
	render: () => (
		<Table size="lg">
			<TableHeader>
				<TableRow>
					<TableHead>Cell</TableHead>
					<TableHead>Example</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{cells.map(({ name, cell }) => (
					<TableRow key={name}>
						<TableCell>{name}</TableCell>
						<TableCell>{cell}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	),
};
