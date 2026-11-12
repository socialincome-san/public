import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PersonNote, PersonNoteLink } from './person-note';

const meta = {
	title: 'Data Display/Person Note',
	component: PersonNote,
	tags: ['autodocs'],
	args: {
		name: 'Marc Werner',
		children: 'Marc Werner keeps this data accurate and is glad to hear about changes.',
	},
	parameters: {
		docs: {
			description: {
				component:
					'A one-line personal note: the avatar of the person behind a piece of content, a short sentence and an optional text link, such as to their profile.',
			},
		},
	},
} satisfies Meta<typeof PersonNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLink: Story = {
	args: {
		children: (
			<>
				Marc Werner keeps this data accurate and is glad to <PersonNoteLink href="#">hear about changes</PersonNoteLink>.
			</>
		),
	},
};
