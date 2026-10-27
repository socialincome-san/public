import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { type ComponentProps, useState } from 'react';
import { type ImageComment, ImageCommentEditor } from './image-comment-editor';

const SAMPLE_IMAGE =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="864"><rect width="1536" height="864" fill="#f4efe6"/><circle cx="768" cy="432" r="220" fill="#d9c7a3"/></svg>',
	);

const SAMPLE_COMMENTS: ImageComment[] = [
	{ id: 'a', x: 0.5, y: 0.35, text: 'Make the headwrap mustard yellow' },
	{ id: 'b', x: 0.72, y: 0.7, text: '' },
];

const meta = {
	title: 'Forms/Image Comment Editor',
	component: ImageCommentEditor,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Numbered comments on an image. Click the image (or press Enter on it) to add a comment, drag a pin or move it with the arrow keys (Shift for larger steps), and describe the change in the list. Positions are fractions of the image size, so they do not depend on the display size. Controlled: the parent owns the comments. Give it a parent with a fixed height, such as a full-height dialog.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="flex h-[36rem] flex-col">
				<Story />
			</div>
		),
	],
	args: {
		src: SAMPLE_IMAGE,
		alt: 'Sample illustration',
		comments: [],
		onCommentsChange: () => undefined,
		maxComments: 20,
		maxLength: 2000,
		labels: {
			addComment: 'Add a comment to the image',
			comment: 'Comment',
			remove: 'Remove',
			placeholder: 'Describe what should change here …',
			empty: 'Click the image to add a comment.',
		},
	},
} satisfies Meta<typeof ImageCommentEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const ControlledEditor = (props: ComponentProps<typeof ImageCommentEditor>) => {
	const [comments, setComments] = useState(props.comments);

	return <ImageCommentEditor {...props} comments={comments} onCommentsChange={setComments} />;
};

export const Empty: Story = {
	render: (args) => <ControlledEditor {...args} />,
};

export const WithComments: Story = {
	args: { comments: SAMPLE_COMMENTS },
	render: (args) => <ControlledEditor {...args} />,
};

export const Disabled: Story = {
	args: { comments: SAMPLE_COMMENTS, disabled: true },
};
