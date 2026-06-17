import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { ChevronRightIcon } from 'lucide-react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerDescription, getLocalPartnerSlug, getLocalPartnerTitle } from './local-partner.utils';

const CARD_IMAGE_WIDTH = 400;
const CARD_IMAGE_HEIGHT = 240;

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	viewDetailsLabel: string;
	className?: string;
};

export const LocalPartnerTeaserCard = ({ localPartner, lang, region, viewDetailsLabel, className }: Props) => {
	const title = getLocalPartnerTitle(localPartner.content);
	const description = getLocalPartnerDescription(localPartner.content);
	const slug = getLocalPartnerSlug(localPartner);
	const href = `/${lang}/${region}/local-partners/${slug}`;
	const heroImage = localPartner.content.heroImage;
	const imageSource = heroImage?.filename
		? formatStoryblokUrl(heroImage.filename, CARD_IMAGE_WIDTH, CARD_IMAGE_HEIGHT, heroImage.focus)
		: null;

	return (
		<NextLink
			href={href}
			aria-label={`${title}, ${viewDetailsLabel}`}
			className={cn(
				'group flex h-full w-full max-w-[305px] flex-col overflow-hidden rounded-xl bg-white p-3',
				className,
				'shadow-[0px_4px_28px_0px_rgba(0,30,101,0.07)]',
				'transition-[box-shadow,transform] duration-200 ease-out',
				'hover:-translate-y-0.5 hover:shadow-[0px_8px_32px_0px_rgba(0,30,101,0.12)]',
				'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
			)}
		>
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
				<h3 className="text-foreground text-xl leading-7 font-bold">{title}</h3>
				{description ? <p className="text-muted-foreground line-clamp-4 flex-1 text-sm leading-6">{description}</p> : null}
				<span className="text-foreground mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pr-2 pl-3 text-xs leading-none font-bold transition-colors group-hover:bg-slate-200/80">
					{viewDetailsLabel}
					<ChevronRightIcon className="size-[15px] shrink-0" aria-hidden="true" />
				</span>
			</div>
		</NextLink>
	);
};
