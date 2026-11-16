import type { Table as TableBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@socialincome/design-system/cn';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@socialincome/design-system/data-display/table/table';

// Breaks the table out of the article's max-w-2xl text column, keeping a gutter on viewports narrower than 64rem.
const WIDE_BREAKOUT_CLASSES = 'lg:relative lg:left-1/2 lg:w-[min(64rem,calc(100vw-3rem))] lg:-translate-x-1/2';

export const TableBlock = ({
	table,
	caption,
	layout,
	background,
	firstColumnHeader,
	headerTextSize,
	bodyTextSize,
}: TableBlok) => {
	if (!table?.tbody?.length) {
		return null;
	}

	const hasHeader = table.thead.some((cell) => cell.value.trim());

	return (
		<div className={cn('not-prose text-foreground my-8', layout === 'wide' && WIDE_BREAKOUT_CLASSES)}>
			<Table surface={background === 'white' ? 'card' : 'none'} caption={caption}>
				{hasHeader && (
					<TableHeader variant="content" textSize={headerTextSize === 'lg' ? 'lg' : 'default'}>
						<TableRow>
							{table.thead.map((cell) => (
								<TableHead key={cell._uid} variant="content" verticalAlign="top" scope="col">
									<span className="whitespace-pre-line">{cell.value}</span>
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
				)}
				<TableBody textSize={bodyTextSize === 'lg' ? 'lg' : 'default'}>
					{table.tbody.map((row) => (
						<TableRow key={row._uid}>
							{row.body.map((cell, index) =>
								firstColumnHeader && index === 0 ? (
									<TableHead key={cell._uid} variant="contentRow" verticalAlign="top" scope="row">
										<span className="whitespace-pre-line">{cell.value}</span>
									</TableHead>
								) : (
									<TableCell key={cell._uid} verticalAlign="top">
										<span className="whitespace-pre-line">{cell.value}</span>
									</TableCell>
								),
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
