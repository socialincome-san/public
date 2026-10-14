import { type ReactNode, useId } from 'react';

type IconListItem = {
	id: string;
	icon: ReactNode;
	title: string;
	description?: string;
};

type IconListProps = {
	title?: string;
	items: IconListItem[];
};

export const IconList = ({ title, items }: IconListProps) => {
	const titleId = useId();

	return (
		<div className="flex flex-col gap-3">
			{title ? (
				<p id={titleId} className="text-muted-foreground text-xs font-medium">
					{title}
				</p>
			) : null}
			<ul className="flex flex-col gap-3" aria-labelledby={title ? titleId : undefined}>
				{items.map((item) => (
					<li key={item.id} className="flex items-center gap-3">
						<span
							className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl [&_svg]:size-4"
							aria-hidden
						>
							{item.icon}
						</span>
						<span className="flex min-w-0 flex-col">
							<span className="text-foreground text-sm font-medium">{item.title}</span>
							{item.description ? <span className="text-muted-foreground text-xs">{item.description}</span> : null}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
};
