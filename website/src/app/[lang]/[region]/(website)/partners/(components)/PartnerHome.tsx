'use client';
//TODO: use-client still async-await, need to figure this out
import { FundraiserBadge, RecipientsBadge } from '@/app/[lang]/[region]/(website)/partners/(components)/PartnerBadges';
import { NgoHomeProps } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { Badge, Separator, Typography } from '@socialincome/ui';
import { SL } from 'country-flag-icons/react/1x1';
import Image from 'next/image';
import Link from 'next/link';

export function PartnerHome({
	ngoHoverCard,
	recipientsBadge,
	partnerSinceTranslation,
	orgMission,
	countryLongName,
	badgeRecipientTranslation,
	badgeRecipientTranslationBy,
	badgeActiveTranslation,
	badgeFormerTranslation,
	badgeSuspendedTranslation,
	countryBadge,
	fundRaiserTranslation,
	orgShortName,
	missionTranslation,
	foundedTranslation,
	headquarterTranslation,
	moreLinksTranslation,
	websiteTranslation,
	facebookTranslation,
	instagramTranslation,
	linkedinTranslation,
	youtubeTranslation,
}: NgoHomeProps) {
	const showVisitOnline: boolean = !!(
		ngoHoverCard.orgInstagram ||
		ngoHoverCard.orgFacebook ||
		ngoHoverCard.orgWebsite ||
		ngoHoverCard.orgLinkedIn ||
		ngoHoverCard.orgYoutube
	);

	const showFundRaiser: boolean = !!ngoHoverCard.orgFundRaiserText;
	return (
		<div className="flex items-center justify-center">
			<div className="w-3/4">
				<div className="relative">
					<Image
						className="h-auto w-full rounded-t-lg"
						src={ngoHoverCard.orgImage}
						width="48"
						height="48"
						alt="Organization Photo"
						unoptimized
					/>
					<div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black to-transparent">
						<div className="text-accent absolute bottom-0 left-0 px-8 py-4">
							<Typography size="5xl" weight="medium">
								{ngoHoverCard.orgLongName}
							</Typography>
						</div>
					</div>
				</div>
				<div className="px-8 pb-10 pt-2">
					<div className="flex flex-col gap-2 p-0 pb-8 pt-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="pb-4 text-center sm:order-2 sm:flex-shrink-0 sm:pb-0 sm:text-right">
							<Typography size="md" weight="normal">
								{partnerSinceTranslation} {ngoHoverCard.partnershipStart}
							</Typography>
						</div>
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							<RecipientsBadge
								{...recipientsBadge}
								isInsideHoverCard={true}
								translatorBadgeRecipients={badgeRecipientTranslation}
								translatorBadgeRecipientsBy={badgeRecipientTranslationBy}
								translatorBadgeActive={badgeActiveTranslation}
								translatorBadgeFormer={badgeFormerTranslation}
								translatorBadgeSuspended={badgeSuspendedTranslation}
							/>
							<Badge className="bg-primary hover:bg-primary text-primary space-x-2 bg-opacity-10 px-4 py-2 hover:bg-opacity-100 hover:text-white">
								{countryBadge?.countryFlagComponent || <SL className="h-5 w-5 rounded-full" />}
								<Typography size="md" weight="normal" className="text-inherit">
									{countryLongName}
								</Typography>
							</Badge>
						</div>
					</div>
					{showFundRaiser && (
						<div className="border-primary mb-8 flex items-center justify-start space-x-5 rounded-md border-2 border-opacity-80 py-4 pl-4">
							<FundraiserBadge fundRaiserTranslation={fundRaiserTranslation} />
							<span>
								{ngoHoverCard.orgFundRaiserText?.map((fragment, index) => {
									return fragment.href ? (
										<Link href={fragment.href} key={index}>
											<Typography as="span" size="md" color="primary">
												{fragment.text}
											</Typography>
										</Link>
									) : (
										<Typography as="span" size="md" key={index}>
											{fragment.text}
										</Typography>
									);
								})}
							</span>
						</div>
					)}
					{ngoHoverCard.orgDescriptionParagraphs.map((paragraph, index) => {
						return (
							<div key={index} className="mb-4">
								{paragraph.map((fragment, index2) => {
									return fragment.href ? (
										<Link href={fragment.href} key={index2}>
											<Typography as="span" size="lg" color="primary">
												{fragment.text}
											</Typography>
										</Link>
									) : (
										<Typography as="span" size="lg" key={index}>
											{fragment.text}
										</Typography>
									);
								})}
							</div>
						);
					})}
					<Separator className="bg-primary my-6 bg-opacity-10" />
					{ngoHoverCard.quote && ngoHoverCard.quoteAuthor ? (
						<>
							<div className="py-12 text-center">
								<div className="my-4 px-6">
									{ngoHoverCard.quote.map((title, index) => (
										<Typography as="span" size="3xl" weight="medium" color={title.color} key={index}>
											{title.text}{' '}
										</Typography>
									))}
								</div>
								<div className="my-4 flex items-center justify-center space-x-3">
									{ngoHoverCard.quotePhoto && (
										<Image
											src={ngoHoverCard.quotePhoto}
											alt={ngoHoverCard.quoteAuthor}
											width="48"
											height="48"
											className="my-3 h-auto w-12"
										/>
									)}
									<Typography size="lg">
										{ngoHoverCard.quoteAuthor}, {orgShortName}
									</Typography>
								</div>
							</div>
							<Separator className="bg-primary my-6 bg-opacity-10" />
						</>
					) : (
						''
					)}
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{missionTranslation}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{orgMission}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{foundedTranslation}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{ngoHoverCard.orgFoundation}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{headquarterTranslation}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{ngoHoverCard.orgHeadquarter}</Typography>
						</div>
					</div>
					{showVisitOnline && (
						<div className="grid grid-cols-3 gap-4">
							<div className="col-span-1">
								<Typography size="lg">{moreLinksTranslation}</Typography>
							</div>
							<div className="col-span-2">
								{ngoHoverCard.orgWebsite && (
									<Link href={ngoHoverCard.orgWebsite} className="ml-auto inline-block pr-2 text-lg underline">
										{websiteTranslation}
									</Link>
								)}
								{ngoHoverCard.orgFacebook && (
									<Link href={ngoHoverCard.orgFacebook} className="ml-auto inline-block pr-2 text-lg underline">
										{facebookTranslation}
									</Link>
								)}
								{ngoHoverCard.orgInstagram && (
									<Link href={ngoHoverCard.orgInstagram} className="ml-auto inline-block pr-2 text-lg underline">
										{instagramTranslation}
									</Link>
								)}
								{ngoHoverCard.orgLinkedIn && (
									<Link href={ngoHoverCard.orgLinkedIn} className="ml-auto inline-block pr-2 text-lg underline">
										{linkedinTranslation}
									</Link>
								)}
								{ngoHoverCard.orgYoutube && (
									<Link href={ngoHoverCard.orgYoutube} className="ml-auto inline-block pr-2 text-lg underline">
										{youtubeTranslation}
									</Link>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
