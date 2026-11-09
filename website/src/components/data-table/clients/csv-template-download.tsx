'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { useTranslations } from 'next-intl';

type Props = {
	template: {
		headers: string[];
		exampleRow: string[];
		filename: string;
	};
};

export const CsvTemplateDownload = ({ template }: Props) => {
	const t = useTranslations('portal-shared');
	const handleDownload = () => {
		const csvContent = [template.headers.join(','), template.exampleRow.join(',')].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = template.filename;
		link.click();

		URL.revokeObjectURL(url);
	};

	return (
		<div className="bg-muted/30 flex items-center justify-between rounded-md border px-3 py-2">
			<p className="text-muted-foreground text-sm">{t('csv.templateHelp')}</p>
			<Button variant="ghost" size="sm" onClick={handleDownload}>
				{t('csv.downloadTemplate')}
			</Button>
		</div>
	);
};
