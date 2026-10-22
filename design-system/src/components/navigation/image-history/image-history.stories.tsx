import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { ImageHistory } from './image-history';

const preview =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="beige"/><circle cx="40" cy="40" r="24" fill="steelblue"/></svg>',
	);

const meta = {
	title: 'Navigation/Image History',
	component: ImageHistory,
	tags: ['autodocs'],
	parameters: { docs: { description: { component: 'Slim thumbnail navigation with an active image and hover details.' } } },
	args: {
		label: 'Version history',
		selectedIndex: 0,
		onSelect: () => undefined,
		items: [
			{ src: preview, label: 'Version 1', tooltip: 'Cost: $0.042 USD' },
			{ src: preview, label: 'Version 2', tooltip: 'Cost unavailable' },
		],
		children: <div className="bg-muted flex h-64 w-full items-center justify-center">Selected image</div>,
	},
} satisfies Meta<typeof ImageHistory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { items: [] } };
