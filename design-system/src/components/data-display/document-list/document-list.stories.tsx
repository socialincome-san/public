import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DocumentListEmpty, DocumentListGroup, DocumentListGroupFooter, DocumentListItem } from './document-list';

const sara = { name: 'Sara Brunner', firstName: 'Sara', href: '#sara-brunner' };
const kerstin = { name: 'Kerstin Huber', firstName: 'Kerstin', href: '#kerstin-huber' };
const lukas = { name: 'Lukas Meier', firstName: 'Lukas', href: '#lukas-meier' };

const meta = {
	title: 'Data Display/Document List',
	component: DocumentListItem,
	tags: ['autodocs'],
	args: {
		title: 'Annual Report 2025',
		authors: [sara],
		downloads: [
			{
				label: 'English & German',
				href: '#annual-report',
				ariaLabel: 'Download Annual Report 2025 in English & German',
				tooltip: 'English & German',
			},
		],
	},
	decorators: [
		(Story) => (
			<DocumentListGroup title="2025">
				<Story />
			</DocumentListGroup>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					'Downloadable documents grouped in cards, for example by year. Each row shows a thumbnail, up to three authors with stacked avatars, an optional note and one download per file. On narrow rows, several authors shorten to first names and downloads to their short label (e.g. EN). Documents can carry a tick (e.g. approved), and a group can end with a footer that explains it.',
			},
		},
	},
} satisfies Meta<typeof DocumentListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNote: Story = {
	args: {
		title: 'Zewo Certification',
		authors: [lukas],
		note: 'Valid until Dec 2026',
		downloads: [{ label: 'German', href: '#zewo', ariaLabel: 'Download Zewo Certification in German' }],
	},
};

export const SeveralAuthors: Story = {
	args: {
		title: 'Financial Statement 2025',
		authors: [kerstin, sara, lukas],
		downloads: [
			{
				label: 'English',
				shortLabel: 'EN',
				href: '#statement-en',
				ariaLabel: 'Download Financial Statement 2025 in English',
			},
			{ label: 'German', shortLabel: 'DE', href: '#statement-de', ariaLabel: 'Download Financial Statement 2025 in German' },
		],
	},
};

export const Approved: Story = {
	args: { checkLabel: 'Approved by the Board' },
};

export const WithThumbnail: Story = {
	args: {
		thumbnailSrc: '/assets/storybook/market-sierra-leone.jpg',
	},
};

export const WithoutAuthors: Story = {
	args: { authors: undefined },
};

export const Group: Story = {
	decorators: [],
	render: () => (
		<DocumentListGroup
			title="2025"
			footer={
				<DocumentListGroupFooter
					message="These documents have been reviewed and approved by our Board."
					linkLabel="Meet our Board"
					linkHref="#board"
				/>
			}
		>
			<DocumentListItem
				title="Annual Report 2025"
				authors={[sara]}
				checkLabel="Approved by the Board"
				downloads={[{ label: 'English & German', href: '#annual', ariaLabel: 'Download Annual Report 2025' }]}
			/>
			<DocumentListItem
				title="Financial Statement 2025"
				authors={[kerstin, lukas]}
				downloads={[
					{
						label: 'English',
						shortLabel: 'EN',
						href: '#statement-en',
						ariaLabel: 'Download Financial Statement 2025 in English',
					},
					{
						label: 'German',
						shortLabel: 'DE',
						href: '#statement-de',
						ariaLabel: 'Download Financial Statement 2025 in German',
					},
				]}
			/>
			<DocumentListItem
				title="Audit Report 2025"
				authors={[kerstin]}
				checkLabel="Approved by the Board"
				downloads={[{ label: 'German', href: '#audit', ariaLabel: 'Download Audit Report 2025 in German' }]}
			/>
		</DocumentListGroup>
	),
};

export const Empty: Story = {
	decorators: [],
	render: () => <DocumentListEmpty message="No documents match your search." />,
};
