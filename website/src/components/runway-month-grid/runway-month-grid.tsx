import { RunwayMonth } from '@/components/runway-month/runway-month';

type Props = {
	numberOfMonths: number;
};

export const RunwayMonthGrid = ({ numberOfMonths }: Props) => {
	const startDate = new Date(new Date().getFullYear(), 0, 1);
	const months = Array.from({ length: numberOfMonths }, (_, index) => {
		const date = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);

		return {
			month: date.toLocaleString('en-US', { month: 'long' }),
			year: date.getFullYear(),
		};
	});
	return (
		<section className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-primary text-xl font-semibold">Months of runway</h2>
				<p className="text-muted-foreground">How long Social Income can continue supporting recipients.</p>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
				{months.map(({ month, year }) => (
					<RunwayMonth key={`${month}-${year}`} month={month} year={year} />
				))}
			</div>

			<div className="flex items-center gap-2 text-sm">
				<span className="relative flex size-2 shrink-0" aria-hidden>
					<span className="bg-confirm animation-duration-[2s] absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
					<span className="bg-confirm relative inline-flex size-2 rounded-full" />
				</span>{' '}
				<span>In line with ZEWO</span>
			</div>
		</section>
	);
};
