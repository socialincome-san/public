import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ReactNode } from 'react';
import { Button } from '../components/actions/button/button';
import { Code, FoundationPage, FoundationSection, TokenTable } from './foundation-layout';

const meta = {
	title: 'Foundations/Motion',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type AnimationRowProps = {
	name: string;
	duration: string;
	children: ReactNode;
};

const AnimationRow = ({ name, duration, children }: AnimationRowProps) => {
	const [runCount, setRunCount] = useState(0);

	return (
		<div className="grid grid-cols-[11rem_7rem_1fr_auto] items-center gap-4 px-4 py-3">
			<span>
				<Code>{name}</Code>
			</span>
			<span className="text-muted-foreground font-mono text-xs">{duration}</span>
			{/* Remounting restarts the animation */}
			<div key={runCount} className="flex h-16 items-center">
				{children}
			</div>
			<Button type="button" variant="outline" size="sm" onClick={() => setRunCount((count) => count + 1)}>
				Replay
			</Button>
		</div>
	);
};

const MotionOverview = () => (
	<FoundationPage
		title="Motion"
		description={
			<>
				Overlays (dialogs, popovers, menus) animate with <Code>animate-in fade-in-0 zoom-in-95</Code> from tw-animate-css.
				Decorative motion adds <Code>motion-reduce:animate-none</Code>.
			</>
		}
	>
		<FoundationSection title="Animations">
			<TokenTable>
				<AnimationRow name="animate-enter-from-top" duration="100ms">
					<div className="bg-card animate-enter-from-top rounded-md px-6 py-3 text-sm shadow-md">Menu</div>
				</AnimationRow>
				<AnimationRow name="animate-fade-out" duration="75ms">
					<div
						className="bg-card animate-fade-out rounded-md px-6 py-3 text-sm shadow-md"
						style={{ animationFillMode: 'forwards' }}
					>
						Menu
					</div>
				</AnimationRow>
				<AnimationRow name="animate-globe-badge" duration="350ms">
					<div className="bg-card animate-globe-badge rounded-full px-4 py-2 text-sm shadow-md">CHF 50</div>
				</AnimationRow>
				<AnimationRow name="animate-outline-spin" duration="10s">
					<div className="bg-primary/20 animate-outline-spin flex size-12 justify-center rounded-full motion-reduce:animate-none">
						<div className="bg-primary size-2 rounded-full" />
					</div>
				</AnimationRow>
				<AnimationRow name="animate-settle-zoom" duration="24s">
					<div className="bg-primary/20 h-12 w-24 overflow-hidden rounded-md">
						<div className="bg-primary/40 animate-settle-zoom size-full" />
					</div>
				</AnimationRow>
				<AnimationRow name="animate-fade-in" duration="400ms">
					<div className="bg-primary/40 animate-fade-in size-12 rounded-full motion-reduce:animate-none" />
				</AnimationRow>
				<AnimationRow name="animate-disc-enter" duration="400ms">
					<div className="bg-banner-blue animate-disc-enter size-12 rounded-full motion-reduce:animate-none" />
				</AnimationRow>
				<AnimationRow name="animate-disc-drift" duration="7s">
					<div className="bg-banner-blue animate-disc-drift size-12 rounded-full motion-reduce:animate-none" />
				</AnimationRow>
				<AnimationRow name="animate-breathe" duration="8s">
					<div className="border-primary animate-breathe size-12 rounded-full border motion-reduce:animate-none" />
				</AnimationRow>
				<AnimationRow name="animate-orbit" duration="120s">
					<div className="animate-orbit relative size-12 motion-reduce:animate-none">
						<div className="bg-banner-blue absolute top-0 left-1/2 size-4 -translate-x-1/2 rounded-full" />
					</div>
				</AnimationRow>
				<AnimationRow name="animate-gauge-arc-draw" duration="900ms">
					<svg viewBox="0 0 100 50" className="text-primary h-12 w-24" aria-hidden>
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
				</AnimationRow>
			</TokenTable>
		</FoundationSection>

		<FoundationSection title="Easing">
			<p className="text-muted-foreground text-sm">
				<Code>ease-glide</Code> (<Code>cubic-bezier(0.32, 0.72, 0, 1)</Code>) for large surfaces that slide, such as the page
				in <Code>Backstage</Code>.
			</p>
			<p className="text-muted-foreground text-sm">
				<Code>ease-orbit</Code> (<Code>cubic-bezier(0.6, 0, 0.3, 1)</Code>) for slow, looping decorative motion: the orbit of{' '}
				<Code>AnimatedCircleIcon</Code> and the drifting discs of <Code>PersonCircles</Code>.
			</p>
		</FoundationSection>

		<FoundationSection title="Accordion">
			<p className="text-muted-foreground text-sm">
				<Code>animate-accordion-down</Code> and <Code>animate-accordion-up</Code> (200ms), used by <Code>Accordion</Code>.
			</p>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <MotionOverview />,
};
