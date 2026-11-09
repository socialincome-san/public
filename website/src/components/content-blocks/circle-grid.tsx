import { blockMargins } from '@/components/content-blocks/block-margins';
import type { CircleGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { createWebsiteCirclePath } from '@/lib/storyblok/storyblok-utils';
import { getCircleSummariesAction } from '@/modules/circles/circle.actions';
import {
	CircleCard,
	CircleCardLegend,
	CircleCardList,
} from '@socialincome/design-system/data-display/circle-card/circle-card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: CircleGrid;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CircleGridBlock = async ({ blok, lang, currency }: Props) => {
	const [t, circlesResult] = await Promise.all([getTranslations('website-common'), getCircleSummariesAction(lang)]);
	if (!circlesResult.success) {
		return null;
	}

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<div className="mx-auto flex max-w-6xl flex-col gap-8">
				<div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
					{blok.title ? (
						<SectionHeading align="left" size={2}>
							{blok.title}
						</SectionHeading>
					) : null}
					{/* Stays on the right, also when it wraps below the heading */}
					<div className="ml-auto">
						<CircleCardLegend
							activeLabel={t('circles.legend-active')}
							activeDescription={t('circles.legend-active-info')}
							interestedLabel={t('circles.legend-interested')}
							interestedDescription={t('circles.legend-interested-info')}
						/>
					</div>
				</div>
				<CircleCardList
					items={circlesResult.data}
					getKey={(circle) => circle.slug}
					emptyMessage={t('circles.empty')}
					renderItem={(circle) => (
						<CircleCard
							title={circle.label}
							href={createWebsiteCirclePath(circle.slug, lang, currency)}
							activeCount={circle.activeCount}
							interestedCount={circle.interestedCount}
							activeLabel={t('circles.active-count', { count: circle.activeCount })}
							interestedLabel={t('circles.interested-count', { count: circle.interestedCount })}
						/>
					)}
				/>
			</div>
		</BlockWrapper>
	);
};
