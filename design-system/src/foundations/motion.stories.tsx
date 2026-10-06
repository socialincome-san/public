import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ReactNode } from 'react';
import { Button } from '../components/actions/button/button';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../components/data-display/accordion/accordion';
import { FoundationPage, FoundationSection, TokenName } from './foundation-layout';

const meta = {
	title: 'Foundations/Motion',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type AnimationDemoProps = {
	name: string;
	usage: string;
	children: ReactNode;
};

// Remounting the preview restarts its animation
const AnimationDemo = ({ name, usage, children }: AnimationDemoProps) => {
	const [runCount, setRunCount] = useState(0);

	return (
		<div className="border-border flex flex-col gap-3 rounded-xl border p-4">
			<div className="bg-muted flex h-28 items-center justify-center overflow-hidden rounded-lg">
				<div key={runCount}>{children}</div>
			</div>
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-col gap-1">
					<TokenName>{name}</TokenName>
					<span className="text-muted-foreground text-sm">{usage}</span>
				</div>
				<Button type="button" variant="outline" size="sm" onClick={() => setRunCount((count) => count + 1)}>
					Replay
				</Button>
			</div>
		</div>
	);
};

const MotionOverview = () => (
	<FoundationPage
		title="Motion"
		intro={
			<>
				<p>
					Motion is short and functional: it shows where something came from or went to. Interface transitions stay around
					100–300ms with ease-out. Overlays (dialogs, popovers, menus, tooltips) fade and zoom in with{' '}
					<TokenName>tw-animate-css</TokenName> (<TokenName>animate-in fade-in-0 zoom-in-95</TokenName>).
				</p>
				<p>
					Decorative motion respects reduced-motion settings: add <TokenName>motion-reduce:animate-none</TokenName> or{' '}
					<TokenName>motion-reduce:transition-none</TokenName>. Keyframes live in <TokenName>src/styles/theme.css</TokenName>
					.
				</p>
			</>
		}
	>
		<FoundationSection title="Animations">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<AnimationDemo name="animate-enter-from-top" usage="Desktop navigation flyout opening (100ms).">
					<div className="bg-card animate-enter-from-top rounded-md px-6 py-3 text-sm shadow-md">Menu</div>
				</AnimationDemo>
				<AnimationDemo name="animate-fade-out" usage="Desktop navigation flyout closing (75ms).">
					<div
						className="bg-card animate-fade-out rounded-md px-6 py-3 text-sm shadow-md"
						style={{ animationFillMode: 'forwards' }}
					>
						Menu
					</div>
				</AnimationDemo>
				<AnimationDemo name="animate-globe-badge" usage="Badges popping up on the donation globe (350ms).">
					<div className="bg-card animate-globe-badge rounded-full px-4 py-2 text-sm shadow-md">CHF 50</div>
				</AnimationDemo>
				<AnimationDemo name="animate-gauge-arc-draw" usage="Segments of the inflows gauge drawing in (900ms).">
					<svg viewBox="0 0 100 50" className="text-primary h-16 w-32" aria-hidden>
						<path
							d="M 10 45 A 40 40 0 0 1 90 45"
							fill="none"
							stroke="currentColor"
							strokeWidth="8"
							strokeLinecap="round"
							pathLength={1}
							strokeDasharray="1 2"
							className="animate-gauge-arc-draw"
						/>
					</svg>
				</AnimationDemo>
			</div>
		</FoundationSection>

		<FoundationSection
			title="Accordion"
			description="animate-accordion-down / animate-accordion-up (200ms) animate the content height Radix measures."
		>
			<div className="max-w-md">
				<Accordion type="single" collapsible>
					<AccordionItem value="motion">
						<AccordionTrigger>How is the money paid out?</AccordionTrigger>
						<AccordionContent>Recipients receive their income every month via mobile money.</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <MotionOverview />,
};
