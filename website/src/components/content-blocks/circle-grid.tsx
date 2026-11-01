import { blockMargins } from '@/components/content-blocks/block-margins';
import type { CircleGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { createWebsiteCirclePath } from '@/lib/storyblok/storyblok-utils';
import { getCircleSummariesAction } from '@/modules/circles/circle.actions';
import { DotCircleCard } from '@socialincome/design-system/data-display/dot-circle-card/dot-circle-card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { CardGrid, CardGridItem } from '@socialincome/design-system/layout/card-grid/card-grid';
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
			<div className="space-y-8">
				{blok.title ? (
					<SectionHeading align="left" size={4} bold>
						{blok.title}
					</SectionHeading>
				) : null}
				<CardGrid emptyMessage={t('circles.empty')}>
					{circlesResult.data.map((circle) => (
						<CardGridItem key={circle.slug}>
							<DotCircleCard
								title={circle.label}
								description={
									circle.activeCount + circle.interestedCount === 0
										? t('circles.members-empty')
										: t('circles.member-summary', { active: circle.activeCount, interested: circle.interestedCount })
								}
								solidCount={circle.activeCount}
								outlinedCount={circle.interestedCount}
								href={createWebsiteCirclePath(circle.slug, lang, currency)}
							/>
						</CardGridItem>
					))}
				</CardGrid>
			</div>
		</BlockWrapper>
	);
};
