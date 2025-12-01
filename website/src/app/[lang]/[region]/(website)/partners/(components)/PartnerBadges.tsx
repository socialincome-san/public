import { FundRaiserBadgeType, SdgBadgeType } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import SdgIcon from '@/app/[lang]/[region]/(website)/partners/assets/sdg-circle.svg';
import { Badge, HoverCard, HoverCardContent, HoverCardTrigger, Separator, Typography } from '@socialincome/ui';
import Image from 'next/image';

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
		<Badge variant="interactive-accent">
			<Typography size="sm" weight="normal" className="text-inherit">
				{fundRaiserTranslation}
			</Typography>
		</Badge>
	);
}

export { FundraiserBadge, SDGBadge };
