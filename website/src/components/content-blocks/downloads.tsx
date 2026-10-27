import type { AnySearchParams } from '@/app/page-props';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterSearch } from '@/components/filters/filter-search';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { Document, Downloads, Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteBasePath, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import {
	createWebsitePersonLink,
	getPersonAvatarSrc,
	getPersonDisplayName,
	resolveStoryblokLink,
} from '@/lib/storyblok/storyblok-utils';
import { getPersonsByUuidsAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { FilterBar } from '@socialincome/design-system/layout/filter-bar/filter-bar';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';
import { DOCUMENT_CATEGORIES, type DownloadDocument, DownloadsList } from './downloads-list';

type Props = {
	blok: Downloads;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	searchParams?: Promise<AnySearchParams>;
};

const YEAR_QUERY_KEY = 'year';
const DOCUMENT_QUERY_KEY = 'document';
const SEARCH_QUERY_KEY = 'search';

// Storyblok doesn't resolve relations nested inside resolved relations, so authors arrive as uuids and the people are
// loaded separately
const getAuthorUuids = (document: ISbStoryData<Document>) =>
	document.content.authors?.filter((author) => typeof author === 'string').slice(0, 3) ?? [];

type DocumentAuthor = DownloadDocument['authors'][number];

const toAuthor = (person: ISbStoryData<Person>, lang: WebsiteLanguage, currency: WebsiteCurrency): DocumentAuthor => {
	const name = getPersonDisplayName(person);

	return {
		name,
		firstName: person.content.firstName || name.split(' ')[0],
		avatarUrl: getPersonAvatarSrc(person) ?? undefined,
		href: createWebsitePersonLink(person.slug, lang, currency),
	};
};

// Storyblok sends an empty field as ""
const nonEmpty = (value?: string) => (value?.length ? value : undefined);

// Year is meant to be required; until every document has one, the publish date stands in
const getYear = ({ content, first_published_at }: ISbStoryData<Document>) =>
	Number(nonEmpty(content.year) ?? (nonEmpty(content.publishedAt) ?? first_published_at ?? '').slice(0, 4));

const toDownloadDocument = (document: ISbStoryData<Document>, authors: DocumentAuthor[]): DownloadDocument => ({
	id: document.uuid,
	title: document.content.title ?? document.name,
	note: nonEmpty(document.content.note),
	category: document.content.category,
	year: getYear(document),
	thumbnailUrl: document.content.thumbnail?.filename ?? undefined,
	authors,
	boardApproved: document.content.boardApproved === true,
	files: (document.content.files ?? []).flatMap(({ file, language }) =>
		file.filename ? [{ language, url: file.filename }] : [],
	),
});

const getQueryValue = (searchParams: AnySearchParams, key: string) => {
	const value = searchParams[key];
	const firstValue = Array.isArray(value) ? value.at(0) : value;

	return typeof firstValue === 'string' ? firstValue.trim() : '';
};

export const DownloadsBlock = async ({ blok, lang, currency, searchParams }: Props) => {
	const storyDocuments = blok.documents.filter((document) => typeof document !== 'string');

	if (!storyDocuments.length) {
		return null;
	}

	const authorUuids = [...new Set(storyDocuments.flatMap(getAuthorUuids))];
	const [t, resolvedSearchParams, personsResult] = await Promise.all([
		getTranslations('website-common'),
		searchParams,
		authorUuids.length ? getPersonsByUuidsAction({ language: lang, values: authorUuids }) : undefined,
	]);
	const authorsByUuid = new Map(
		(personsResult?.success ? personsResult.data : []).map((person) => [person.uuid, toAuthor(person, lang, currency)]),
	);
	const documents = storyDocuments
		.map((document) =>
			toDownloadDocument(
				document,
				getAuthorUuids(document)
					.map((uuid) => authorsByUuid.get(uuid))
					.filter((author) => author !== undefined),
			),
		)
		// A document without files has nothing to download, e.g. a language version that was merged into another document
		.filter((document) => document.files.length > 0);
	const query = resolvedSearchParams ?? {};
	const yearOptions = [...new Set(documents.map((document) => String(document.year)))]
		.sort((a, b) => b.localeCompare(a))
		.map((year) => ({ value: year, label: year }));
	const categoryOptions = DOCUMENT_CATEGORIES.filter((category) =>
		documents.some((document) => document.category === category),
	).map((category) => ({ value: category, label: t(`downloads.categories.${category}`) }));
	const yearQuery = getQueryValue(query, YEAR_QUERY_KEY);
	const categoryQuery = getQueryValue(query, DOCUMENT_QUERY_KEY);
	const searchQuery = getQueryValue(query, SEARCH_QUERY_KEY).toLowerCase();
	const selectedYear = yearOptions.some((option) => option.value === yearQuery) ? yearQuery : undefined;
	const selectedCategory = categoryOptions.some((option) => option.value === categoryQuery) ? categoryQuery : undefined;
	const visibleDocuments = documents.filter(
		(document) =>
			(!selectedYear || String(document.year) === selectedYear) &&
			(!selectedCategory || document.category === selectedCategory) &&
			(!searchQuery || document.title.toLowerCase().includes(searchQuery)),
	);

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<div className="space-y-6">
				{blok.heading && (
					<SectionHeading align="left">
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				)}
				<div className="mx-auto max-w-220 space-y-8">
					<FilterBar
						filters={
							<>
								<FilterDropdown
									allLabel={t('downloads.all-years', { count: yearOptions.length })}
									options={yearOptions}
									queryKey={YEAR_QUERY_KEY}
									selectedValue={selectedYear}
								/>
								<FilterDropdown
									allLabel={t('downloads.all-documents', { count: categoryOptions.length })}
									options={categoryOptions}
									queryKey={DOCUMENT_QUERY_KEY}
									selectedValue={selectedCategory}
								/>
							</>
						}
						summary={t('downloads.document-count', { count: visibleDocuments.length })}
						search={
							<FilterSearch
								queryKey={SEARCH_QUERY_KEY}
								label={t('downloads.search-label')}
								placeholder={t('downloads.search-placeholder')}
							/>
						}
					/>
					<DownloadsList
						documents={visibleDocuments}
						// There is no board page yet; the people page introduces the board
						boardHref={
							blok.boardLink?.cached_url || blok.boardLink?.url
								? resolveStoryblokLink(blok.boardLink, lang, currency)
								: `${getWebsiteBasePath(lang, currency)}/people`
						}
					/>
				</div>
			</div>
		</BlockWrapper>
	);
};
