import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Card, CardContent } from '../components/card';
import { Carousel, CarouselContent } from '../components/carousel';

const meta = {
	title: 'Components/Carousel',
	component: Carousel,
	tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof Carousel>;

// Helper component for demo slides
const DemoSlide = ({ children }: { children: React.ReactNode }) => (
	<Card className="m-1">
		<CardContent className="flex aspect-square items-center justify-center p-6">
			<span className="text-4xl font-semibold">{children}</span>
		</CardContent>
	</Card>
);

// Basic Carousel
export const Basic: Story = {
	render: () => (
		<Carousel className="w-full max-w-xs">
			<CarouselContent>
				<DemoSlide>1</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>2</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>3</DemoSlide>
			</CarouselContent>
		</Carousel>
	),
};

// With Controls
export const WithControls: Story = {
	render: () => (
		<Carousel className="w-full max-w-xs" showControls>
			<CarouselContent>
				<DemoSlide>1</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>2</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>3</DemoSlide>
			</CarouselContent>
		</Carousel>
	),
};

// With Dots
export const WithDots: Story = {
	render: () => (
		<Carousel className="w-full max-w-xs" showDots>
			<CarouselContent>
				<DemoSlide>1</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>2</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>3</DemoSlide>
			</CarouselContent>
		</Carousel>
	),
};

// With Both Controls and Dots
export const WithControlsAndDots: Story = {
	render: () => (
		<Carousel className="w-full max-w-xs" showControls showDots>
			<CarouselContent>
				<DemoSlide>1</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>2</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>3</DemoSlide>
			</CarouselContent>
		</Carousel>
	),
};

// Multiple Slides
export const MultipleSlides: Story = {
	render: () => (
		<Carousel className="w-full max-w-4xl" options={{ slidesToScroll: 2 }} showControls showDots>
			{[1, 2, 3, 4, 5, 6].map((num) => (
				<CarouselContent key={num}>
					<DemoSlide>{num}</DemoSlide>
				</CarouselContent>
			))}
		</Carousel>
	),
};

// Autoplay
export const Autoplay: Story = {
	render: () => (
		<Carousel
			className="w-full max-w-xs"
			options={{
				autoPlay: {
					enabled: true,
					delay: 3000,
				},
			}}
			showDots
		>
			<CarouselContent>
				<DemoSlide>1</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>2</DemoSlide>
			</CarouselContent>
			<CarouselContent>
				<DemoSlide>3</DemoSlide>
			</CarouselContent>
		</Carousel>
	),
};

// Custom Content
export const CustomContent: Story = {
	render: () => (
		<Carousel className="w-full max-w-4xl" showControls showDots>
			<CarouselContent>
				<div className="p-1">
					<div className="bg-primary-muted flex aspect-square items-center justify-center rounded-lg p-6">
						<span className="text-primary-foreground text-4xl font-semibold">Custom 1</span>
					</div>
				</div>
			</CarouselContent>
			<CarouselContent>
				<div className="p-1">
					<div className="bg-secondary-muted flex aspect-square items-center justify-center rounded-lg p-6">
						<span className="text-secondary-foreground text-4xl font-semibold">Custom 2</span>
					</div>
				</div>
			</CarouselContent>
			<CarouselContent>
				<div className="p-1">
					<div className="bg-accent-muted flex aspect-square items-center justify-center rounded-lg p-6">
						<span className="text-accent-foreground text-4xl font-semibold">Custom 3</span>
					</div>
				</div>
			</CarouselContent>
		</Carousel>
	),
};
