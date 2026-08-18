import { RunwayMonth } from '@/components/runway-month/runway-month';
import type { WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	numberOfMonths: number;
	language?: Exclude<WebsiteLanguage, 'kri'>;
};

export const RunwayMonthGrid = ({ numberOfMonths, language = 'en' }: Props) => {
	const startDate = new Date();
	const months = Array.from({ length: numberOfMonths }, (_, index) => {
		const date = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);

		return {
			month: date.toLocaleString(language, { month: 'long' }),
			year: date.getFullYear(),
		};
	});

	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
			{months.map(({ month, year }) => (
				<RunwayMonth key={`${month}-${year}`} month={month} year={year} />
			))}
		</div>
	);
};
