import SdgIcon from '@/app/[lang]/[region]/(website)/partners/(assets)/sdg-circle.svg';
import {
	FundRaiserBadgeType,
	RecipientsBadgeType,
	SdgBadgeType,
} from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import { UsersIcon } from '@heroicons/react/24/solid';
import { Badge, HoverCard, HoverCardContent, HoverCardTrigger, Separator, Typography } from '@socialincome/ui';
import { cn } from '@socialincome/ui/src/lib/utils';
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
					<Badge className="bg-primary text-popover-foreground hover:bg-primary hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
						<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
							{hoverCardTotalActiveRecipients || 0} {translatorBadgeActive}
						</Typography>
					</Badge>
					<Badge className="bg-accent text-popover-foreground hover:bg-accent hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
						<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
							{hoverCardTotalFormerRecipients || 0} {translatorBadgeFormer}
						</Typography>
					</Badge>
					<Badge className="bg-secondary text-popover-foreground hover:bg-secondary hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
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
				<Badge className="bg-primary hover:bg-primary text-primary bg-opacity-10 hover:bg-opacity-100 hover:text-white">
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
				<Badge className="bg-accent text-primary hover:bg-accent bg-opacity-50 hover:bg-opacity-100 hover:text-white">
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
