import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	BaseContainer,
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Typography,
} from '@socialincome/ui';
import Link from 'next/link';

export async function generateMetadata({ params }: DefaultPageProps) {
	return getMetadata(params.lang, 'website-reporting');
}

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-reporting'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-3xl flex-col space-y-12">
			<Typography size="4xl" weight="bold">
				{translator.t('title')}
			</Typography>
			<Table>
				<TableCaption>{translator.t('table-caption')}</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>{translator.t('table-columns.title')}</TableHead>
						<TableHead>{translator.t('table-columns.language')}</TableHead>
						<TableHead className="text-right">{translator.t('table-columns.href')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{translator.t<{ title: string; href: string; language: string }[]>('reports').map((report, index) => (
						<TableRow key={index}>
							<TableCell className="font-medium">{report.title}</TableCell>
							<TableCell>{report.language}</TableCell>
							<TableCell className="text-right">
								<Link href={report.href} target="_blank" className="text-primary underline">
									{translator.t('download-pdf')}
								</Link>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</BaseContainer>
	);
}
