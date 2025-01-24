import SdgIcon from '@/app/[lang]/[region]/(website)/partners/(assets)/sdg-circle.svg';
import {
	FundRaiserBadgeType,
	RecipientsBadgeType,
	SdgBadgeType,
} from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import { UsersIcon } from '@heroicons/react/24/solid';
import { Badge, HoverCard, HoverCardContent, HoverCardTrigger, Separator, Typography } from '@socialincome/ui';
import Image from 'next/image';

function RecipientsBadge({
	hoverCardOrgName,
	hoverCardTotalRecipients,
	hoverCardTotalActiveRecipients,
	hoverCardTotalSuspendedRecipients,
	hoverCardTotalFormerRecipients,
	isInsideHoverCard,
	translatorBadgeRecipients,
	translatorBadgeRecipientsBy,
	translatorBadgeActive,
	translatorBadgeFormer,
	translatorBadgeSuspended,
}: RecipientsBadgeType) {
	const size = isInsideHoverCard ? 'md' : 'sm';
	const userIconClassName = isInsideHoverCard ? 'mr-2 h-5 w-5 rounded-full' : 'mr-1 h-4 w-4 rounded-full';

	return (
		<HoverCard>
			<HoverCardTrigger>
				<Badge variant="interactive" size={size}>
					<UsersIcon className={userIconClassName} />
					<Typography size={size} weight="normal" className="text-inherit">
						{hoverCardTotalRecipients || 0} {isInsideHoverCard ? translatorBadgeRecipients : ''}
					</Typography>
				</Badge>
			</HoverCardTrigger>
			<HoverCardContent className="w-auto max-w-52 p-4">
				<div>
					<Typography size="sm" weight="normal">
						{hoverCardTotalRecipients || 0} {translatorBadgeRecipientsBy} {hoverCardOrgName}
					</Typography>
				</div>
				<Separator className="bg-primary mb-3 mt-2 bg-opacity-20" />
				<div className="flex flex-col space-y-2">
					<Badge variant="faded" className="text-popover-foreground">
						<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
							{hoverCardTotalActiveRecipients || 0} {translatorBadgeActive}
						</Typography>
					</Badge>
					<Badge variant="accent" className="text-popover-foreground bg-opacity-10">
						<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
							{hoverCardTotalFormerRecipients || 0} {translatorBadgeFormer}
						</Typography>
					</Badge>
					<Badge variant="secondary" className="text-popover-foreground bg-opacity-10">
						<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
							{hoverCardTotalSuspendedRecipients || 0} {translatorBadgeSuspended}
						</Typography>
					</Badge>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}

function SDGBadge({
	hoverCardOrgName,
	sdgNumber,
	translatorSdg,
	translatorSdgTitle,
	translatorSdgMission1,
	translatorSdgMission2,
}: SdgBadgeType) {
	return (
		<HoverCard>
			<HoverCardTrigger>
				<Badge variant="interactive">
					<Typography size="sm" weight="normal" className="text-inherit">
						{translatorSdgTitle}
					</Typography>
				</Badge>
			</HoverCardTrigger>
			<HoverCardContent>
				<div className="flex items-center">
					<Image className="mr-1 h-4 w-4 rounded-full" src={SdgIcon} alt="SDG Icon" />
					<Typography size="sm" weight="normal">
						{translatorSdg} {sdgNumber?.toString() || ''}: {translatorSdgTitle}
					</Typography>
				</div>
				<Separator className="bg-primary mb-3 mt-3 bg-opacity-20" />
				<div>
					<Typography size="sm" weight="normal">
						{translatorSdgMission1} {hoverCardOrgName} {translatorSdgMission2}
					</Typography>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}

function FundraiserBadge({ fundRaiserTranslation }: FundRaiserBadgeType) {
	return (
		<HoverCard>
			<HoverCardTrigger>
				<Badge variant="interactive-accent">
					<Typography size="sm" weight="normal" className="text-inherit">
						{fundRaiserTranslation}
					</Typography>
				</Badge>
			</HoverCardTrigger>
			{/*<HoverCardContent>*/}
			{/*TODO: Should anything go here?*/}
			{/*</HoverCardContent>*/}
		</HoverCard>
	);
}

export { FundraiserBadge, RecipientsBadge, SDGBadge };
