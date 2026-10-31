import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import {
	createWebsitePersonLink,
	formatArticleAuthorNames,
	getPersonAvatarSrc,
	getPersonDisplayName,
} from '@/lib/storyblok/storyblok-utils';
import { AvatarStack } from '@socialincome/design-system/data-display/avatar-stack/avatar-stack';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';

const toStackPerson = (author: ISbStoryData<Person>) => ({
	name: getPersonDisplayName(author),
	imageSrc: getPersonAvatarSrc(author) ?? undefined,
});

type Props = {
	authors: ISbStoryData<Person>[];
	lang: string;
};

export const ArticleAuthors = ({ authors, lang }: Props) => (
	<div className="flex min-w-0 items-center gap-2">
		<AvatarStack people={authors.map(toStackPerson)} size="default" />
		<span className="truncate text-sm font-bold">{formatArticleAuthorNames(authors, lang)}</span>
	</div>
);

export const ArticleAuthorLinks = ({ authors, lang, currency }: Props & { currency: WebsiteCurrency }) => {
	const parts = new Intl.ListFormat(lang, { type: 'conjunction' }).formatToParts(authors.map(getPersonDisplayName));

	return (
		<div className="flex items-center gap-3">
			<AvatarStack people={authors.map(toStackPerson)} size="xl" />
			<p className="text-lg font-medium">
				{parts.map((part, index) => {
					if (part.type === 'literal') {
						return part.value;
					}
					const author = authors[parts.slice(0, index).filter(({ type }) => type === 'element').length];

					return (
						<Link
							key={author.uuid}
							href={createWebsitePersonLink(author.slug, lang, currency)}
							className="transition-opacity hover:opacity-80"
						>
							{part.value}
						</Link>
					);
				})}
			</p>
		</div>
	);
};
