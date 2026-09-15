import { Badge } from '@/components/badge/badge';
import { CardAlertFooter } from '@/components/card-alert-footer';
import { CountryFlag } from '@/components/country-flag';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';
import { cn } from '@/lib/utils/cn';
import NextImage from 'next/image';
import NextLink from 'next/link';
import type { LocalPartnerStory } from './local-partner.types';
import {
	getLocalPartnerDescription,
	getLocalPartnerIsoCode,
	getLocalPartnerSlug,
	getLocalPartnerTitle,
} from './local-partner.utils';

const CARD_IMAGE_WIDTH = 400;
const CARD_IMAGE_HEIGHT = 240;

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	viewDetailsLabel: string;
	recipientsCount: number;
	recipientsLabel: string;
	candidatesLabel: string;
	createProgramLabel: string;
	className?: string;
};

export const LocalPartnerTeaserCard = ({
	localPartner,
	lang,
	region,
	viewDetailsLabel,
	recipientsCount,
	recipientsLabel,
	candidatesLabel,
	createProgramLabel,
	className,
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
		<NextLink
			href={href}
			aria-label={`${title}, ${viewDetailsLabel}`}
			className={cn(
				'bg-confirm-foreground group flex h-full w-full max-w-[305px] flex-col overflow-hidden rounded-xl',
				className,
				'drop-shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5',
				'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
			)}
		>
			<div className="border-border bg-card flex flex-1 flex-col rounded-xl border p-3">
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
							<Badge
								variant="country"
								className="gap-2 border-slate-300 bg-white px-2 py-1 leading-none font-medium text-cyan-900"
							>
								<CountryFlag country={countryCode} size="sm" />
								<span>{getCountryNameByCode(countryCode)}</span>
							</Badge>
						) : null}
						<Badge variant="country" className="border-slate-300 bg-white px-2 py-1 leading-none font-medium text-cyan-900">
							<span>
								{recipientsCount} {recipientsLabel}
							</span>
						</Badge>
					</div>
				</div>
			</div>
			<CardAlertFooter text={candidatesLabel} trailingText={createProgramLabel} variant="confirm" />
		</NextLink>
	);
};
