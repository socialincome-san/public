import { UsersIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	Badge,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
	Separator,
	Typography,
} from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import { cn } from '@socialincome/ui/src/lib/utils';
import { SL } from 'country-flag-icons/react/1x1';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { ReactElement } from 'react';
import SdgIcon from '../(assets)/sdg-circle.svg';

type sdgBadgeType = {
	hoverCardOrgName: string;
	sdgNumber: number;
};

type countryBadgeType = {
	countryFlagComponent?: ReactElement;
	countryAbbreviation: string;
};

type recipientsBadgeType = {
	hoverCardOrgName: string;
	hoverCardTotalRecipients: number;
	hoverCardTotalActiveRecipients?: number;
	hoverCardTotalFormerRecipients?: number;
	hoverCardTotalSuspendedRecipients?: number;
	isInsideHoverCard?: boolean;
};

type ngoHoverCardType = {
	orgImage: StaticImageData;
	orgLongName: string;
	partnershipStart: string;
	orgDescription: string;
	quote: {
		text: string;
		color: FontColor;
	}[];
	quoteAuthor: string;
	orgFoundation: string;
	orgHeadquarter: string;
	orgWebsite?: string;
	orgFacebook?: string;
	orgInstagram?: string;
};

type NgoCardProps = {
	orgShortName: string;
	orgMission: string;
	countryBadge?: countryBadgeType;
	recipientsBadge: recipientsBadgeType;
	sdgBadges?: sdgBadgeType[];
	ngoHoverCard: ngoHoverCardType;
	lang: string;
};

export default async function NgoCard({
	orgShortName,
	orgMission,
	countryBadge,
	recipientsBadge,
	sdgBadges,
	ngoHoverCard,
	lang,
}: NgoCardProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-common', 'countries', 'website-partners'],
	});
	function RecipientsBadge({
		hoverCardOrgName,
		hoverCardTotalRecipients,
		hoverCardTotalActiveRecipients,
		hoverCardTotalSuspendedRecipients,
		hoverCardTotalFormerRecipients,
		isInsideHoverCard,
	}: recipientsBadgeType) {
		let badgeClassName = 'bg-primary hover:bg-primary text-primary bg-opacity-10 hover:bg-opacity-100 hover:text-white';
		if (isInsideHoverCard) {
			badgeClassName = cn(badgeClassName, ' py-2');
		}
		const userIconClassName = isInsideHoverCard ? 'mr-2 h-5 w-5 rounded-full' : 'mr-1 h-4 w-4 rounded-full';

		return (
			<HoverCard>
				<HoverCardTrigger>
					<Badge className={badgeClassName}>
						<UsersIcon className={userIconClassName} />
						<Typography size={isInsideHoverCard ? 'md' : 'sm'} weight="normal" className="text-inherit">
							{hoverCardTotalRecipients || 0} {isInsideHoverCard ? translator.t('badges.recipients') : ''}
						</Typography>
					</Badge>
				</HoverCardTrigger>
				<HoverCardContent className="w-auto max-w-52 p-4">
					<div>
						<Typography size="sm" weight="normal">
							{hoverCardTotalRecipients || 0} {translator.t('badges.recipients-by')} {hoverCardOrgName}
						</Typography>
					</div>
					<Separator className="bg-primary mb-3 mt-2 bg-opacity-20" />
					<div className="flex flex-col space-y-2">
						<Badge className="bg-primary text-popover-foreground hover:bg-primary hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
							<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
								{hoverCardTotalActiveRecipients || 0} {translator.t('badges.active')}
							</Typography>
						</Badge>
						<Badge className="bg-accent text-popover-foreground hover:bg-accent hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
							<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
								{hoverCardTotalFormerRecipients || 0} {translator.t('badges.former')}
							</Typography>
						</Badge>
						<Badge className="bg-secondary text-popover-foreground hover:bg-secondary hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
							<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
								{hoverCardTotalSuspendedRecipients || 0} {translator.t('badges.suspended')}
							</Typography>
						</Badge>
					</div>
				</HoverCardContent>
			</HoverCard>
		);
	}

	function SDGBadge({ hoverCardOrgName, sdgNumber }: sdgBadgeType) {
		return (
			<HoverCard>
				<HoverCardTrigger>
					<Badge className="bg-primary hover:bg-primary text-primary bg-opacity-10 hover:bg-opacity-100 hover:text-white">
						<Typography size="sm" weight="normal" className="text-inherit">
							{translator.t('sdg.sdg' + sdgNumber.toString() + '-title')}
						</Typography>
					</Badge>
				</HoverCardTrigger>
				<HoverCardContent>
					<div className="flex items-center">
						<Image className="mr-1 h-4 w-4 rounded-full" src={SdgIcon} alt="SDG Icon" />
						<Typography size="sm" weight="normal">
							{translator.t('sdg.sdg')} 1: {translator.t('sdg.sdg' + sdgNumber.toString() + '-title')}
						</Typography>
					</div>
					<Separator className="bg-primary mb-3 mt-3 bg-opacity-20" />
					<div>
						<Typography size="sm" weight="normal">
							{translator.t('sdg.sdg' + sdgNumber.toString() + '-mission-1')} {hoverCardOrgName}{' '}
							{translator.t('sdg.sdg' + sdgNumber.toString() + '-mission-2')}
						</Typography>
					</div>
				</HoverCardContent>
			</HoverCard>
		);
	}

	return (
		<Dialog>
			<DialogTrigger className="text-left">
				<Card className="hover:bg-primary max-w-lg rounded-lg border-none bg-transparent p-6 shadow-none hover:bg-opacity-10">
					<CardHeader className="p-0">
						<CardTitle className="flex items-center justify-between">
							<Typography size="2xl" weight="medium">
								{orgShortName}
							</Typography>
						</CardTitle>
					</CardHeader>
					<Separator className="bg-primary mt-4 bg-opacity-30" />
					<CardContent className="my-4 p-0">
						<Typography size="lg">{orgMission}</Typography>
					</CardContent>
					<CardFooter className="gap-2 p-0 pt-2">
						<HoverCard>
							<HoverCardTrigger>
								{countryBadge?.countryFlagComponent || <SL className="h-5 w-5 rounded-full" />}
							</HoverCardTrigger>
							<HoverCardContent className="inline-flex w-auto items-center">
								<div className="mr-3">
									{countryBadge?.countryFlagComponent || <SL className="mr-2 h-5 w-5 rounded-full" />}
								</div>
								<Typography size="sm" weight="normal" className="text-inherit">
									{countryBadge?.countryAbbreviation || ''}
								</Typography>
							</HoverCardContent>
						</HoverCard>
						<RecipientsBadge {...recipientsBadge} />
						{sdgBadges?.map((sdgBadge, index) => <SDGBadge {...sdgBadge} key={index} />)}
					</CardFooter>
				</Card>
			</DialogTrigger>
			<DialogContent className="bg-background mx-0 mt-4 h-[98vh] max-h-[98vh] w-11/12 overflow-y-auto rounded-3xl border-none p-0 sm:min-w-[600px] md:min-w-[750px]">
				{' '}
				<DialogHeader className="relative">
					<Image className="h-auto w-full rounded-t-lg" src={ngoHoverCard.orgImage} alt="NGO Photo" />
					<div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black to-transparent">
						<DialogTitle className="text-accent absolute bottom-0 left-0 px-8 py-4">
							<Typography size="5xl" weight="medium">
								{ngoHoverCard.orgLongName}
							</Typography>
						</DialogTitle>
					</div>
				</DialogHeader>
				<div className="px-8 pb-10 pt-2">
					<div className="flex flex-col gap-2 p-0 pb-8 pt-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="pb-4 text-center sm:order-2 sm:flex-shrink-0 sm:pb-0 sm:text-right">
							<Typography size="md" weight="normal">
								{translator.t('ngo-generic.partner-since')} {ngoHoverCard.partnershipStart}
							</Typography>
						</div>
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							<RecipientsBadge {...recipientsBadge} isInsideHoverCard={true} />
							<Badge className="bg-primary hover:bg-primary text-primary space-x-2 bg-opacity-10 px-4 py-2 hover:bg-opacity-100 hover:text-white">
								{countryBadge?.countryFlagComponent || <SL className="h-5 w-5 rounded-full" />}
								<Typography size="md" weight="normal" className="text-inherit">
									{translator.t(countryBadge?.countryAbbreviation || 'SL')}
								</Typography>
							</Badge>
						</div>
					</div>
					<Typography size="lg">{ngoHoverCard.orgDescription}</Typography>
					<Separator className="bg-primary my-6 bg-opacity-10" />
					<div className="py-12 text-center">
						<div className="my-4 px-6">
							{ngoHoverCard.quote.map((title, index) => (
								<Typography as="span" size="3xl" weight="medium" color={title.color} key={index}>
									{title.text}{' '}
								</Typography>
							))}
						</div>
						<div className="my-4">
							<Typography size="lg">
								{ngoHoverCard.quoteAuthor}, {orgShortName}
							</Typography>
						</div>
					</div>
					<Separator className="bg-primary my-6 bg-opacity-10" />
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translator.t('ngo-generic.mission')}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{orgMission}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translator.t('ngo-generic.founded')}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{ngoHoverCard.orgFoundation}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translator.t('ngo-generic.headquarter')}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{ngoHoverCard.orgHeadquarter}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translator.t('links.more')}</Typography>
						</div>
						<div className="col-span-2">
							{ngoHoverCard.orgWebsite ? (
								<Link href={ngoHoverCard.orgWebsite} className="ml-auto inline-block pr-2 text-lg underline">
									{translator.t('links.website')}
								</Link>
							) : (
								''
							)}
							{ngoHoverCard.orgFacebook ? (
								<Link href={ngoHoverCard.orgFacebook} className="ml-auto inline-block pr-2 text-lg underline">
									{translator.t('links.facebook')}
								</Link>
							) : (
								''
							)}
							{ngoHoverCard.orgInstagram ? (
								<Link href={ngoHoverCard.orgInstagram} className="ml-auto inline-block pr-2 text-lg underline">
									{translator.t('links.instagram')}
								</Link>
							) : (
								''
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
