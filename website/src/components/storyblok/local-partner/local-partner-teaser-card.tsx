import { CountryFlag } from '@/components/country-flag';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { StatusCard } from '@socialincome/design-system/data-display/status-card/status-card';
import { type CardAlertFooterVariant } from '@socialincome/design-system/feedback/card-alert-footer/card-alert-footer';
import { type useTranslations } from 'next-intl';
import NextImage from 'next/image';
import type { LocalPartnerStory } from './local-partner.types';
import {
	getLocalPartnerDescription,
	getLocalPartnerIsoCode,
	getLocalPartnerSlug,
	getLocalPartnerTitle,
} from './local-partner.utils';

const CARD_IMAGE_WIDTH = 400;
const CARD_IMAGE_HEIGHT = 240;

export const getLocalPartnerCandidateFooter = (
	t: ReturnType<typeof useTranslations<'website-common'>>,
	candidatesCount: number,
) => {
	if (candidatesCount > 0) {
		return {
			candidatesLabel: t('local-partners-page.candidates-ready-to-enroll', { count: candidatesCount }),
			alertVariant: 'confirm' as const satisfies CardAlertFooterVariant,
		};
	}

	return {
		candidatesLabel: t('local-partners-page.no-candidates'),
		alertVariant: 'secondary' as const satisfies CardAlertFooterVariant,
	};
};

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	recipientsCount: number;
	recipientsLabel: string;
	candidatesLabel: string;
	alertVariant: CardAlertFooterVariant;
};

export const LocalPartnerTeaserCard = ({
	localPartner,
	lang,
	region,
	recipientsCount,
	recipientsLabel,
	candidatesLabel,
	alertVariant,
}: Props) => {
	const title = getLocalPartnerTitle(localPartner.content);
	const description = getLocalPartnerDescription(localPartner.content);
	const slug = getLocalPartnerSlug(localPartner);
	const href = `/${lang}/${region}/local-partners/${slug}`;
	const normalizedIsoCode = getLocalPartnerIsoCode(localPartner.content)?.toUpperCase();
	const countryCode = normalizedIsoCode && isValidCountryCode(normalizedIsoCode) ? normalizedIsoCode : undefined;
	const heroImage = localPartner.content.heroImage;
	const imageSource = heroImage?.filename
		? formatStoryblokUrl(heroImage.filename, CARD_IMAGE_WIDTH, CARD_IMAGE_HEIGHT, heroImage.focus)
		: null;

	return (
		<StatusCard href={href} inset="sm" status={{ text: candidatesLabel, variant: alertVariant }}>
			<div className="bg-muted relative aspect-[280/180] w-full overflow-hidden rounded-lg">
				{imageSource ? (
					<NextImage
						src={imageSource}
						alt={heroImage?.alt ?? title}
						fill
						sizes="(min-width: 1280px) 281px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
						className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
					/>
				) : null}
			</div>
			<div className="flex flex-1 flex-col gap-3 px-2 pt-4 pb-2">
				<h2 className="text-foreground text-xl leading-7 font-bold">{title}</h2>
				{description ? <p className="text-muted-foreground line-clamp-4 flex-1 text-sm leading-6">{description}</p> : null}
				<div className="mt-auto flex flex-wrap gap-2">
					{countryCode ? (
						<Badge variant="country">
							<CountryFlag country={countryCode} size="sm" />
							<span>{getCountryNameByCode(countryCode)}</span>
						</Badge>
					) : null}
					<Badge variant="country">
						<span>
							{recipientsCount} {recipientsLabel}
						</span>
					</Badge>
				</div>
			</div>
		</StatusCard>
	);
};
