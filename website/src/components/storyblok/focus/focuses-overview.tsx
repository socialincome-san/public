import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import Link from 'next/link';
import type { FocusStory } from './focus.types';
import { getFocusSlug, getFocusTitle } from './focus.utils';

type Props = {
	focuses: FocusStory[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	title?: string;
	text?: string;
};

export const FocusesOverview = async ({ focuses, lang, region, title, text }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="flex w-full flex-col gap-8">
			<CmsHeader title={title} text={text} />
			{focuses.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('focuses-page.empty')}</p>
			) : (
				<ul>
					{focuses.map((focus) => {
						const focusSlug = getFocusSlug(focus);
						const focusTitle = getFocusTitle(focus.content);

						return (
							<li key={focus.uuid}>
								<Link href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/focuses/${focusSlug}`}>{focusTitle}</Link>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
