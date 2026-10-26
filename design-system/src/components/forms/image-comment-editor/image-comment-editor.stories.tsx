import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { ImageCommentEditor } from './image-comment-editor';

const meta = {
	title: 'Forms/Image Comment Editor',
	component: ImageCommentEditor,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="flex h-[38rem] flex-col">
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					'Place numbered comments on an enlarged image. Drag pins or use arrow keys to reposition them in original-image pixel coordinates; comments can be edited or removed before applying.',
			},
		},
	},
	args: {
		src:
			'data:image/svg+xml,' +
			encodeURIComponent(
				'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="768"><rect width="1024" height="768" fill="#eee"/><circle cx="512" cy="384" r="160" fill="#aaa"/></svg>',
			),
		alt: 'Sample image',
		maxComments: 20,
		maxLength: 2000,
		onApply: () => undefined,
		onCancel: () => undefined,
		labels: {
			place: 'Place a comment (arrow keys move, Enter places)',
			loading: 'Loading image …',
			loadError: 'Image could not be loaded.',
			comment: 'Comment',
			comments: 'Comments',
			cancel: 'Cancel',
			placeholder: 'Describe the change …',
			remove: 'Remove',
			empty: 'Click the image to add a comment.',
			apply: 'Apply comments',
			pending: 'Creating new version …',
		},
	},
} satisfies Meta<typeof ImageCommentEditor>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Narrow: Story = {
	decorators: [
		(Story) => (
			<div className="flex h-[32rem] w-full max-w-sm flex-col">
				<Story />
			</div>
		),
	],
};
export const Pending: Story = { args: { disabled: true } };
export const LoadError: Story = { args: { src: '/missing-image.png' } };
