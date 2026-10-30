import { ShowMoreToggle } from '../../actions/show-more-toggle/show-more-toggle';
import { Card } from '../card/card';

type TaskCardGridItem = {
	title: string;
	description?: string;
};

type TaskCardGridProps = {
	items: TaskCardGridItem[];
	// Items beyond this count are revealed by the show more button
	initialCount?: number;
	showMoreLabel: string;
	showLessLabel: string;
};

export const TaskCardGrid = ({ items, initialCount = 6, showMoreLabel, showLessLabel }: TaskCardGridProps) => (
	<ShowMoreToggle layout="grid" initialCount={initialCount} showMoreLabel={showMoreLabel} showLessLabel={showLessLabel}>
		{items.map((item, index) => (
			<Card key={`${index}-${item.title}`} elevation="flat" padding="compact" fullHeight>
				<div className="flex gap-4">
					<span
						className="bg-muted text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold tabular-nums"
						aria-hidden
					>
						{String(index + 1).padStart(2, '0')}
					</span>
					<div className="flex min-w-0 flex-col gap-1">
						<p className="text-foreground text-lg leading-snug font-bold">{item.title}</p>
						{item.description ? <p className="text-muted-foreground">{item.description}</p> : null}
					</div>
				</div>
			</Card>
		))}
	</ShowMoreToggle>
);
