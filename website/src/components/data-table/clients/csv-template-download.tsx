'use client';

import { usePortalSharedTranslations } from '@/components/portal-shared-translations';
import { Button } from '@socialincome/design-system/actions/button/button';

type Props = {
	template: {
		headers: string[];
		exampleRow: string[];
		filename: string;
	};
};

export const CsvTemplateDownload = ({ template }: Props) => {
	const { t } = usePortalSharedTranslations();
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
			<p className="text-muted-foreground text-sm">{t('csv.templateHelp', 'Need help formatting your CSV?')}</p>
			<Button variant="ghost" size="sm" onClick={handleDownload}>
				{t('csv.downloadTemplate', 'Download CSV template')}
			</Button>
		</div>
	);
};
