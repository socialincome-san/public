import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Carousel, CarouselContent, CarouselItem, CarouselScrollNextButton } from './carousel';

const meta = {
	title: 'Components/Carousel',
	component: Carousel,
	tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="w-80">
			<Carousel>
				<CarouselContent>
					<CarouselItem>
						<div className="bg-muted grid h-32 place-items-center rounded-xl">One</div>
					</CarouselItem>
					<CarouselItem>
						<div className="bg-muted grid h-32 place-items-center rounded-xl">Two</div>
					</CarouselItem>
					<CarouselItem>
						<div className="bg-muted grid h-32 place-items-center rounded-xl">Three</div>
					</CarouselItem>
				</CarouselContent>
				<CarouselScrollNextButton aria-label="Next slide" />
			</Carousel>
		</div>
	),
};

export const Cards: Story = {
	render: () => (
		<Carousel gap="lg">
			<CarouselContent scrollFade>
				{['One', 'Two', 'Three', 'Four', 'Five'].map((label) => (
					<CarouselItem key={label} size="card">
						<div className="bg-muted grid h-64 place-items-center rounded-xl">{label}</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselScrollNextButton aria-label="Next slide" />
		</Carousel>
	),
};
