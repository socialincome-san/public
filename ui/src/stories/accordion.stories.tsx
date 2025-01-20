import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/accordion';

const meta = {
	title: 'Components/Accordion',
	component: Accordion,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
	},
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		type: 'single',
		collapsible: true,
		className: 'w-[400px]',
	},
	render: () => (
		<Accordion type="single" collapsible className="w-[400px]">
			<AccordionItem value="item-1">
				<AccordionTrigger>Is it accessible?</AccordionTrigger>
				<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-2">
				<AccordionTrigger>Is it styled?</AccordionTrigger>
				<AccordionContent>
					Yes. It comes with default styles that match the other components&apos; aesthetic.
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-3">
				<AccordionTrigger>Is it animated?</AccordionTrigger>
				<AccordionContent>Yes. It&apos;s animated by default, but you can disable it if you prefer.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const Multiple: Story = {
	args: {
		type: 'multiple',
		className: 'w-[400px]',
	},
	render: () => (
		<Accordion type="multiple" className="w-[400px]">
			<AccordionItem value="item-1">
				<AccordionTrigger>Can I open multiple items?</AccordionTrigger>
				<AccordionContent>Yes. Just set the type prop to "multiple" on the Accordion component.</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-2">
				<AccordionTrigger>Is it responsive?</AccordionTrigger>
				<AccordionContent>Yes. The accordion adjusts to different screen sizes.</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-3">
				<AccordionTrigger>Can I customize the styles?</AccordionTrigger>
				<AccordionContent>Yes. You can use the className prop to override the default styles.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};
