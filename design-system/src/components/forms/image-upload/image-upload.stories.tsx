import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import { ImageUpload } from './image-upload';

const meta = {
	title: 'Forms/Image Upload',
	component: ImageUpload,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: { component: 'Native image upload with a thumbnail, remove action, and file type and size validation.' },
		},
	},
	args: {
		name: 'image',
		acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
		maxSizeBytes: 10 * 1024 * 1024,
		label: 'Reference image',
		optionalLabel: '(optional)',
		dropLabel: 'Drag an image here or',
		browseLabel: 'browse',
		previewLabel: 'Selected reference image',
		removeLabel: 'Remove reference image',
		helperText: 'JPEG, PNG or WebP · up to 10 MB',
		invalidFileMessage: 'Choose a JPEG, PNG or WebP image up to 10 MB.',
	},
} satisfies Meta<typeof ImageUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };

export const Attachment: Story = { args: { variant: 'attachment' } };
export const AttachmentWithPreview: Story = {
	args: { variant: 'attachment' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const imageBytes = Uint8Array.from(
			atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jLZsAAAAASUVORK5CYII='),
			(character) => character.charCodeAt(0),
		);
		await userEvent.upload(
			canvas.getByLabelText('Reference image'),
			new File([imageBytes], 'reference.png', { type: 'image/png' }),
		);
	},
};
