import NextImage from 'next/image';
import { type ReactNode } from 'react';
import { cn } from '../../../cn';
import { SectionHeading } from '../../layout/section-heading/section-heading';
import { Badge } from '../badge/badge';

type TimelineItem = {
	// Unique within the timeline, such as the id of the CMS entry
	id: string;
	title: string;
	description?: string;
	// Short context above the title, such as where the step happens
	eyebrow?: string;
	// A short fact that backs the step up
	badge?: string;
	// Decorative illustration above the text
	imageSrc?: string;
};

type TimelineProps = {
	// Wrap the words to emphasise in <strong>
	title?: ReactNode;
	description?: string;
	items: TimelineItem[];
};

// The dot of each card sits at the same height in every card and each line segment runs down to the next dot.
// Small screens: one column with the line on the left; the cards differ in height, so the dot keeps a fixed
// distance from the top. From md: the cards alternate around a middle line and all have the same height, each
// spanning two grid rows and starting one row below the previous card.
const markerTop = 'top-20 md:top-1/2';
const markerX =
	'-left-6 -translate-x-1/2 md:group-odd:-right-14 md:group-odd:left-auto md:group-odd:translate-x-1/2 md:group-even:-left-14';

export const Timeline = ({ title, description, items }: TimelineProps) => (
	<div className="flex flex-col gap-10 md:gap-16">
		{title || description ? (
			<div className="flex flex-col gap-5">
				{title ? <SectionHeading align="left">{title}</SectionHeading> : null}
				{description ? <p className="text-muted-foreground max-w-2xl text-lg">{description}</p> : null}
			</div>
		) : null}
		<ol className="flex flex-col gap-14 md:grid md:auto-rows-fr md:grid-cols-[1fr_7rem_1fr] md:gap-x-0 md:gap-y-44">
			{items.map((item, index) => (
				<li
					key={item.id}
					style={{ gridRowStart: index + 1 }}
					className="group bg-card shadow-card relative ml-8 flex flex-col rounded-3xl p-2.5 md:row-span-2 md:ml-0 md:odd:col-start-1 md:even:col-start-3"
				>
					<span
						aria-hidden
						className={cn(
							'bg-card absolute -left-2 size-4 -translate-y-1/2 rotate-45 rounded-sm md:group-odd:-right-2 md:group-odd:left-auto',
							markerTop,
						)}
					/>
					<span
						aria-hidden
						className={cn(
							'bg-primary/20 absolute h-[calc(100%+3.5rem)] w-px group-last:hidden md:h-[calc(50%+5.5rem)]',
							markerTop,
							markerX,
						)}
					/>
					<span
						aria-hidden
						className={cn('bg-primary/55 absolute z-10 size-2 -translate-y-1/2 rounded-full', markerTop, markerX)}
					/>
					{item.imageSrc ? (
						<div className="px-3 pt-3">
							<div className="relative aspect-video">
								<NextImage
									src={item.imageSrc}
									alt=""
									fill
									sizes="(min-width: 768px) 45vw, 100vw"
									className="object-contain"
								/>
							</div>
						</div>
					) : null}
					<div className="flex flex-col items-start gap-2.5 p-5">
						{item.eyebrow ? <span className="text-muted-foreground text-sm font-medium">{item.eyebrow}</span> : null}
						<h3 className="text-primary text-2xl leading-tight font-medium">{item.title}</h3>
						{item.description ? <p className="text-muted-foreground text-base sm:text-lg">{item.description}</p> : null}
						{item.badge ? (
							<div className="pt-1">
								<Badge size="lg">{item.badge}</Badge>
							</div>
						) : null}
					</div>
				</li>
			))}
		</ol>
	</div>
);
