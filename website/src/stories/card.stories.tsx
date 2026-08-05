import { SectionHeading } from '@/components/section-heading';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Avatar, AvatarFallback } from '../components/avatar';

import { Card } from '../components/card';

const meta = {
	title: 'Components/Card',
	component: Card,
	tags: ['autodocs'],
	parameters: {
		docs: {
			codePanel: true,
			description: {
				component: 'Eine wiederverwendbare Card-Komponente für Inhalte mit optionalem Link-Verhalten.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'noPadding'],
		},
		className: {
			control: 'text',
		},
	},
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		href: '/',
		children: 'Test',
	},
	play: async ({ canvas }) => {
		const link = await canvas.findByRole('link');
		const card = link.firstElementChild;
		const chevron = card?.querySelector('.lucide-chevron-right');

		if (!card || !chevron) {
			throw new Error('The linked card must render its content and chevron icon.');
		}

		await expect(link).toHaveAttribute('href', '/');
		await expect(card).toHaveClass('cursor-pointer');
		await expect(chevron).toBeVisible();
	},
};

export const Variants: Story = {
	render: () => (
		<div className="flex items-stretch gap-6">
			<Card>Default</Card>
			<Card variant="noPadding">
				<div className="p-10">No padding</div>
			</Card>
		</div>
	),
};

export const WithContent: Story = {
	args: {
		children: (
			<div className="flex items-center gap-6">
				<div className="flex flex-col gap-4">
					<SectionHeading size={4} align="left">
						Schulden statt Chancen? Warum wir keine Mikrokredite anbieten.
					</SectionHeading>
					<div className="flex items-center gap-2">
						<Avatar>
							<AvatarFallback>SS</AvatarFallback>
						</Avatar>
						<span className="font-semibold text-slate-800">Sandino Scheidegger</span>
					</div>
				</div>
				<Image
					src="https://a.storyblok.com/f/109655/3000x2001/0b43ecee20/alligator-crocodile.jpg/m/640x524/filters:focal(380x1154:381x1155):format(webp)"
					alt="Alligator"
					className="w-80 rounded-2xl object-cover"
				/>
			</div>
		),
	},
	play: async ({ canvas }) => {
		const author = await canvas.findByText('Sandino Scheidegger');
		const card = author.closest('.shadow-lg');

		if (!card) {
			throw new Error('The author must be rendered inside the card.');
		}

		await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
		await expect(card).not.toHaveClass('cursor-pointer');
		await expect(card.querySelector('svg')).not.toBeInTheDocument();
	},
};
