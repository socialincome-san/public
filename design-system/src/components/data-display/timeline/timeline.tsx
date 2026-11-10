import Image from 'next/image';
import { type ReactNode } from 'react';
import { cn } from '../../../cn';
import { SectionHeading } from '../../layout/section-heading/section-heading';

// Static class names so Tailwind generates them; every card spans two rows and starts one row below the previous card
const ROW_STARTS = [
	'md:row-start-1',
	'md:row-start-2',
	'md:row-start-3',
	'md:row-start-4',
	'md:row-start-5',
	'md:row-start-6',
	'md:row-start-7',
	'md:row-start-8',
	'md:row-start-9',
	'md:row-start-10',
];

type TimelineItem = {
	title: string;
	text: string;
	// Decorative 16:9 illustration above the text
	imageSrc: string;
	// Short context above the title, e.g. where the step happens
	eyebrow?: string;
	// A short fact that backs the step up
	proof?: string;
};

type TimelineProps = {
	// Wrap the words to emphasise in <strong>
	title?: ReactNode;
	description?: string;
	items: TimelineItem[];
};

export const Timeline = ({ title, description, items }: TimelineProps) => (
	<div className="flex flex-col gap-8 md:gap-16">
		{title || description ? (
			<div className="flex flex-col gap-5">
				{title ? <SectionHeading align="left">{title}</SectionHeading> : null}
				{description ? <p className="text-muted-foreground text-lg leading-7">{description}</p> : null}
			</div>
		) : null}
		{/* Small screens: one column with the line on the left. From md: cards alternate around a middle line, each starting halfway down the previous one */}
		{/* The negative bottom margin cancels the spacing below the last card */}
		<ol className="@container flex flex-col gap-14 md:-mb-44 md:grid md:auto-rows-fr md:grid-cols-[1fr_112px_1fr] md:gap-0">
			{items.map((item, index) => {
				const isRight = index % 2 === 1;
				const isLast = index === items.length - 1;

				return (
					<li
						key={item.title}
						className={cn(
							'bg-card shadow-card relative ml-6 flex flex-col rounded-3xl p-2.5 md:row-span-2 md:mb-44 md:ml-0',
							ROW_STARTS[Math.min(index, ROW_STARTS.length - 1)],
							// The dot sits at the vertical middle of the image: card padding, image padding and half the 16:9 image height
							'[--card-width:calc(100cqw-24px)] [--dot-top:calc(22px+(var(--card-width)-44px)*0.28125)] md:[--card-width:calc((100cqw-112px)/2)]',
							isRight ? 'md:col-start-3' : 'md:col-start-1',
						)}
					>
						<span
							aria-hidden
							className={cn(
								'bg-card absolute top-[calc(var(--dot-top)-9px)] -left-2 size-[18px] rotate-45 rounded-sm',
								!isRight && 'md:right-[-8px] md:left-auto',
							)}
						/>
						{isLast ? null : (
							<span
								aria-hidden
								className={cn(
									'bg-primary/20 absolute top-(--dot-top) bottom-[calc(-56px-var(--dot-top))] left-[-24.5px] w-px',
									// From md the next dot is exactly one row lower: half the card plus half its bottom margin
									'md:bottom-auto md:h-[calc(50%+88px)]',
									isRight ? 'md:left-[-56.5px]' : 'md:right-[-56.5px] md:left-auto',
								)}
							/>
						)}
						<span
							aria-hidden
							className={cn(
								'bg-primary/55 absolute top-(--dot-top) left-[-24px] z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
								isRight ? 'md:left-[-56px]' : 'md:right-[-56px] md:left-auto md:translate-x-1/2',
							)}
						/>
						<div className="px-3 pt-3">
							<div className="relative aspect-video">
								<Image src={item.imageSrc} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-contain" />
							</div>
						</div>
						<div className="flex flex-col gap-2.5 p-5">
							{item.eyebrow ? (
								<span className="text-muted-foreground text-sm leading-5 font-medium">{item.eyebrow}</span>
							) : null}
							<h3 className="text-primary text-2xl leading-tight font-medium">{item.title}</h3>
							<p className="text-muted-foreground text-base leading-6 sm:text-lg sm:leading-7">{item.text}</p>
							{item.proof ? (
								<p className="bg-muted text-foreground mt-1 w-fit rounded-lg px-2.5 py-1 text-xs leading-4 font-medium">
									{item.proof}
								</p>
							) : null}
						</div>
					</li>
				);
			})}
		</ol>
	</div>
);
