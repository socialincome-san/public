import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { MarkdownEditor } from './markdown-editor';

const labels = {
	toolbar: 'Formatting',
	write: 'Write',
	preview: 'Preview',
	emptyPreview: 'Nothing to preview yet.',
	bold: 'Bold',
	italic: 'Italic',
	bulletList: 'Bullet list',
	link: 'Link',
	hint: 'Supports **bold**, _italic_, lists and [links](https://…).',
};

const meta = {
	title: 'Forms/Markdown Editor',
	component: MarkdownEditor,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="w-[32rem]">
				<Story />
			</div>
		),
	],
	args: {
		value: 'We are raising money for **Social Income**.\n\n- Paid to mobile phones\n- No conditions',
		onChange: () => undefined,
		renderPreview: (value: string) => <p className="text-foreground text-sm whitespace-pre-wrap">{value}</p>,
		labels,
		rows: 5,
		'aria-label': 'Description',
	},
	render: function Render(args) {
		const [value, setValue] = useState(args.value);

		return <MarkdownEditor {...args} value={value} onChange={setValue} />;
	},
	parameters: {
		docs: {
			description: {
				component:
					'Textarea for Markdown with buttons for bold, italic, lists and links, and a preview whose rendering the caller provides.',
			},
		},
	},
} satisfies Meta<typeof MarkdownEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
	args: { value: '' },
};

export const WithoutHint: Story = {
	args: { labels: { ...labels, hint: undefined } },
};

export const Invalid: Story = {
	args: { 'aria-invalid': true },
};

export const Disabled: Story = {
	args: { disabled: true },
};
