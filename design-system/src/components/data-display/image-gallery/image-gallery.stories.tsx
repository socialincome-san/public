import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { ChevronDown, Download, MessageSquarePlus, Trash2 } from 'lucide-react';
import { Button } from '../../actions/button/button';
import { BlockWrapper } from '../../layout/block-wrapper/block-wrapper';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../overlays/dropdown-menu/dropdown-menu';
import { ImageGallery } from './image-gallery';

const examples = [
	{ name: 'planting', description: 'People planting a tree' },
	{ name: 'family-reading', description: 'A family reading together' },
	{ name: 'children-running', description: 'Children running together' },
	{ name: 'shop', description: 'A person running a small shop' },
];

const images = examples.map(({ name, description }) => ({
	id: name,
	src: `/assets/image-gallery/${name}.webp`,
	alt: description,
	price: '0.06 USD',
	date: { label: '2 Nov 2026, 13:00', value: '2026-11-02T12:00:00Z' },
	prompt: { text: description, title: 'Image prompt', triggerLabel: 'Show image prompt' },
	actions: (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					<Download aria-hidden="true" /> Download <ChevronDown aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<a href={`/assets/image-gallery/${name}.webp`} download>
						Preview (WebP)
					</a>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
}));

const meta = {
	title: 'Data Display/Image Gallery',
	component: ImageGallery,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<BlockWrapper marginTop="none" marginBottom="none">
				<Story />
			</BlockWrapper>
		),
	],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The shared image gallery. Supply price, date and prompt only when they should appear. Actions and overlay controls are optional slots; omit them for a read-only gallery.',
			},
		},
	},
	args: { images, loadingLabel: 'Loading image …', errorLabel: 'Image could not be loaded.' },
} satisfies Meta<typeof ImageGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = { args: { density: 'compact', infoPlacement: 'metadata' } };

export const UnavailablePrice: Story = {
	args: {
		density: 'compact',
		infoPlacement: 'metadata',
		images: images.map((image) => ({ ...image, price: 'Cost unknown' })),
	},
};

export const WithLoadMore: Story = {
	args: { density: 'compact', infoPlacement: 'metadata', pagination: { pageSize: 2, loadMoreLabel: 'Load more' } },
};

export const WithActions: Story = {
	args: {
		images: images.map((image) => ({
			...image,
			price: undefined,
			date: { label: '2 Nov 2026, 13:00', value: '2026-11-02T12:00:00Z' },
			actions: (
				<>
					<Button size="sm" variant="outline">
						<MessageSquarePlus aria-hidden="true" /> Edit
					</Button>
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button size="sm" variant="outline">
								<Download aria-hidden="true" /> Download <ChevronDown aria-hidden="true" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<a href={image.src} download>
									White background
								</a>
							</DropdownMenuItem>
							<DropdownMenuItem disabled>Transparent background</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			),
			overlay: (
				<Button size="icon-sm" variant="ghost" aria-label="Delete image">
					<Trash2 aria-hidden="true" />
				</Button>
			),
		})),
	},
};

export const ImagesOnly: Story = { args: { images: images.map(({ id, src, alt }) => ({ id, src, alt })) } };

export const Empty: Story = { args: { images: [] } };

export const EmptyWithMessage: Story = {
	args: {
		images: [],
		emptyState: {
			badge: 'Gallery empty',
			title: 'No images yet',
			description: 'Create your first image.',
			action: <Button>Create image</Button>,
		},
	},
};
