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
	const hasCmsHeader = Boolean(title?.trim()) || Boolean(text?.trim());

	return (
		<div className="flex w-full flex-col gap-8">
			{hasCmsHeader ? (
				<div className="flex flex-col gap-4">
					{title?.trim() ? <h1 className="font-sans text-5xl font-normal text-cyan-900">{title.trim()}</h1> : null}
					{text?.trim() ? <p className="text-foreground font-sans text-lg font-normal not-italic">{text.trim()}</p> : null}
				</div>
			) : null}
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
