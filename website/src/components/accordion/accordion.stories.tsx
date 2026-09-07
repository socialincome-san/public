import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/accordion/accordion';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/Accordion',
	tags: ['autodocs'],
	component: Accordion,
	args: {
		type: 'single',
		collapsible: true,
	},
	argTypes: {
		collapsible: {
			control: 'boolean',
		},
	},
	parameters: {
		docs: {
			description: {
				component: 'A reusable accordion component for displaying collapsible content.',
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=1-434&p=f&t=9Voj9wb0Isxm1rnr-0',
		},
	},
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<Accordion {...args}>
			<AccordionItem value="item-1">
				<AccordionTrigger>Item 1</AccordionTrigger>
				<AccordionContent>Content for item 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};
