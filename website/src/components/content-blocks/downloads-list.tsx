import type { Document, DocumentFile } from '@/generated/storyblok/types/109655/storyblok-components';
import {
	DocumentListEmpty,
	DocumentListGroup,
	DocumentListGroupFooter,
	DocumentListItem,
} from '@socialincome/design-system/data-display/document-list/document-list';
import { getTranslations } from 'next-intl/server';

export const DOCUMENT_CATEGORIES: Document['category'][] = [
	'annual-report',
	'financial-statement',
	'audit-report',
	'certification',
];

export type DownloadDocument = {
	id: string;
	title: string;
	note?: string;
	category: Document['category'];
	year: number;
	thumbnailUrl?: string;
	authors: { name: string; firstName: string; avatarUrl?: string; href: string }[];
	boardApproved: boolean;
	files: { language: DocumentFile['language']; url: string }[];
};

const groupByYear = (documents: DownloadDocument[]) => {
	const groups = new Map<number, DownloadDocument[]>();
	documents.forEach((document) => groups.set(document.year, [...(groups.get(document.year) ?? []), document]));

	return [...groups.entries()].sort(([a], [b]) => b - a);
};

type Props = {
	documents: DownloadDocument[];
	boardHref: string;
};

export const DownloadsList = async ({ documents, boardHref }: Props) => {
	const t = await getTranslations('website-common');

	if (documents.length === 0) {
		return <DocumentListEmpty message={t('downloads.no-results')} />;
	}

	return groupByYear(documents).map(([year, yearDocuments]) => {
		const approvedCount = yearDocuments.filter((document) => document.boardApproved).length;

		return (
			<DocumentListGroup
				key={year}
				title={year}
				footer={
					approvedCount > 0 ? (
						<DocumentListGroupFooter
							message={t('downloads.board-approval.message', { count: approvedCount })}
							linkLabel={t('downloads.board-approval.link')}
							linkHref={boardHref}
						/>
					) : null
				}
			>
				{yearDocuments.map((document) => (
					<DocumentListItem
						key={document.id}
						title={document.title}
						note={document.note}
						thumbnailSrc={document.thumbnailUrl}
						checkLabel={document.boardApproved ? t('downloads.board-approval.approved') : undefined}
						authors={document.authors.map((author) => ({
							name: author.name,
							firstName: author.firstName,
							avatarSrc: author.avatarUrl,
							href: author.href,
						}))}
						downloads={document.files.map((file) => {
							const language = t(`downloads.languages.${file.language}`);

							return {
								label: language,
								shortLabel: t(`downloads.languages-short.${file.language}`),
								href: file.url,
								ariaLabel: t('downloads.download-label', { title: document.title, language }),
								tooltip: language,
							};
						})}
					/>
				))}
			</DocumentListGroup>
		);
	});
};
