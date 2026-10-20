import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { ImageAreaEditor } from './image-area-editor';

const meta = {
	title: 'Forms/Image Area Editor',
	component: ImageAreaEditor,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Paint a selection over media with a brush or eraser, undo strokes, and export a transparent PNG mask at the original image resolution.',
			},
		},
	},
	args: {
		width: 640,
		height: 400,
		active: true,
		mode: 'change',
		children: <div className="bg-muted flex h-80 w-full items-center justify-center">Image preview</div>,
		onModeChange: () => undefined,
		onSelectionChange: () => undefined,
		onDone: () => undefined,
		onCancel: () => undefined,
		labels: {
			selection: 'Image area selection',
			remove: 'Mark to Remove',
			removeHelp: 'Remove selected objects.',
			change: 'Mark to Change',
			changeHelp: 'Change the selection with a prompt.',
			brush: 'Brush',
			brushHelp: 'Paint a selection.',
			eraser: 'Eraser',
			eraserHelp: 'Erase selection marks.',
			size: 'Size',
			undo: 'Undo',
			undoHelp: 'Undo last stroke.',
			redo: 'Redo',
			redoHelp: 'Restore undone stroke.',
			clear: 'Clear selection',
			clearHelp: 'Clear all selection marks.',
			done: 'Done',
			cancel: 'Cancel',
			help: 'Paint an area, then choose Done.',
		},
	},
} satisfies Meta<typeof ImageAreaEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Change: Story = {};
export const Remove: Story = { args: { mode: 'remove' } };
export const Inactive: Story = { args: { active: false } };
