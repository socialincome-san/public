import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '../components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/collapsible';

const meta = {
	title: 'Components/Collapsible',
	component: Collapsible,
	tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof Collapsible>;

// Basic Collapsible
export const Basic: Story = {
	render: () => {
		const [isOpen, setIsOpen] = React.useState(false);
		return (
			<Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px]">
				<div className="flex items-center justify-between space-x-4 px-4">
					<h4 className="text-sm font-semibold">What is a Collapsible?</h4>
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm" className="w-9 p-0">
							<ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
							<span className="sr-only">Toggle</span>
						</Button>
					</CollapsibleTrigger>
				</div>
				<CollapsibleContent className="space-y-2 px-4">
					<div className="rounded-md border p-4 text-sm">
						A collapsible is a component that can be expanded or collapsed to show or hide content.
					</div>
				</CollapsibleContent>
			</Collapsible>
		);
	},
};

// Multiple Sections
export const MultipleSections: Story = {
	render: () => {
		const [openSections, setOpenSections] = React.useState<number[]>([]);

		const toggleSection = (index: number) => {
			setOpenSections((current) =>
				current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
			);
		};

		return (
			<div className="w-[350px] space-y-2">
				{[1, 2, 3].map((section) => (
					<Collapsible
						key={section}
						open={openSections.includes(section)}
						onOpenChange={() => toggleSection(section)}
						className="rounded-lg border"
					>
						<div className="flex items-center justify-between space-x-4 px-4 py-2">
							<h4 className="text-sm font-semibold">Section {section}</h4>
							<CollapsibleTrigger asChild>
								<Button variant="ghost" size="sm" className="w-9 p-0">
									<ChevronDownIcon
										className={`h-4 w-4 transition-transform duration-200 ${
											openSections.includes(section) ? 'rotate-180' : ''
										}`}
									/>
								</Button>
							</CollapsibleTrigger>
						</div>
						<CollapsibleContent className="px-4 pb-2">
							<div className="rounded-md border p-4 text-sm">Content for section {section}</div>
						</CollapsibleContent>
					</Collapsible>
				))}
			</div>
		);
	},
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => {
		const [isOpen, setIsOpen] = React.useState(false);
		return (
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="border-primary bg-primary/5 w-[350px] rounded-lg border-2"
			>
				<div className="flex items-center justify-between space-x-4 px-4 py-2">
					<h4 className="text-primary text-sm font-semibold">Custom Styled Collapsible</h4>
					<CollapsibleTrigger asChild>
						<Button variant="outline" size="sm" className="border-primary text-primary w-9 p-0">
							<ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
						</Button>
					</CollapsibleTrigger>
				</div>
				<CollapsibleContent className="space-y-2 px-4 pb-4">
					<div className="bg-primary/10 text-primary rounded-md p-4 text-sm">
						This is a custom styled collapsible with primary color theme.
					</div>
				</CollapsibleContent>
			</Collapsible>
		);
	},
};

// With Animation
export const WithAnimation: Story = {
	render: () => {
		const [isOpen, setIsOpen] = React.useState(false);
		return (
			<Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px]">
				<div className="flex items-center justify-between space-x-4 px-4">
					<h4 className="text-sm font-semibold">Animated Collapsible</h4>
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm" className="w-9 p-0">
							<ChevronDownIcon
								className="h-4 w-4 transform transition-all duration-300 ease-in-out"
								style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
							/>
						</Button>
					</CollapsibleTrigger>
				</div>
				<CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp transition-all duration-300 ease-in-out">
					<div className="space-y-2 px-4 py-2">
						<div className="rounded-md border p-4 text-sm">
							This collapsible has smooth animations for both the chevron and content.
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>
		);
	},
};
