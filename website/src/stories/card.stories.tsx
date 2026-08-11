import { Avatar, AvatarFallback } from '@/components/avatar';
import { SectionHeading } from '@/components/section-heading';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Image from 'next/image';

import { Card } from '@/components/card';

const meta = {
	title: 'Components/Card',
	component: Card,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'A reusable card component for content with optional link behavior.',
			},
		},
	},
	argTypes: {
		href: {
			control: 'text',
		},
		children: {
			control: 'text',
		},
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
		href: 'https://smartive.ch',
		children: 'Test',
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
						Debt instead of opportunity? Why we don&apos;t offer microloans.
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
					width={300}
					height={200}
					className="rounded-2xl object-cover"
				/>
			</div>
		),
	},
};
