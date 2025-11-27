'use client';

import { FundraiserBadge } from '@/app/[lang]/[region]/(website)/partners/(components)/PartnerBadges';
import { CountryBadgeType } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import { NgoHomeProps, NgoHoverCardType } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { Badge, Separator, Typography } from '@socialincome/ui';
import { CH, SL } from 'country-flag-icons/react/1x1';
import Image from 'next/image';
import Link from 'next/link';
import { ReactElement } from 'react';

const country_abbreviations_to_flag_map: Record<string, ReactElement> = {
	SL: <SL className="h-5 w-5 rounded-full" />,
	CH: <CH className="h-5 w-5 rounded-full" />,
};

function getFlag(abbreviation: string): ReactElement {
	return country_abbreviations_to_flag_map[abbreviation] || <SL className="h-5 w-5 rounded-full" />;
}

export function PartnerHome({ currentNgo, currentNgoCountry, translations, lang, region }: NgoHomeProps) {
	const image_base_path = '/assets/partners/';

	const countryBadge: CountryBadgeType = {
		countryAbbreviation: currentNgo!['org-country'],
		countryFlagComponent: getFlag(currentNgo!['org-country']),
	};
	const ngoHoverCard: NgoHoverCardType = {
		orgImage: image_base_path.concat(currentNgo!['org-image']),
		orgLongName: currentNgo!['org-long-name'],
		partnershipStart: currentNgo!['partnership-start'],
		orgDescriptionParagraphs: currentNgo!['org-description-paragraphs'],
		quote: currentNgo!['org-quote'] ?? null,
		quoteAuthor: currentNgo!['org-quote-author'] ?? null,
		quotePhoto: currentNgo!['org-quote-photo'] ? image_base_path.concat(currentNgo!['org-quote-photo']) : null,
		orgFoundation: currentNgo!['org-foundation'],
		orgHeadquarter: currentNgo!['org-headquarter'],
		orgWebsite: currentNgo!['org-website'] ?? null,
		orgFacebook: currentNgo!['org-facebook'] ?? null,
		orgInstagram: currentNgo!['org-instagram'] ?? null,
		orgLinkedIn: currentNgo!['org-linkedin'] ?? null,
		orgYoutube: currentNgo!['org-youtube'] ?? null,
		orgFundRaiserText: currentNgo!['org-fundraiser-text'] ?? null,
		orgSlug: currentNgo!['org-slug'],
	};
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
			<div className="sm:w-3/4">
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
								{translations.partnerSince} {ngoHoverCard.partnershipStart}
							</Typography>
						</div>
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							<Badge variant="interactive" size="md" className="space-x-2">
								{countryBadge?.countryFlagComponent || <SL className="h-5 w-5 rounded-full" />}
								<Typography size="md" weight="normal" className="text-inherit">
									{currentNgoCountry}
								</Typography>
							</Badge>
						</div>
					</div>
					{showFundRaiser && (
						<div className="border-primary mb-8 flex items-center justify-start space-x-5 rounded-md border-2 border-opacity-80 py-4 pl-4">
							<FundraiserBadge fundRaiserTranslation={translations.fundRaiser} />
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
					{ngoHoverCard.orgDescriptionParagraphs?.map((paragraph, index) => {
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
											className="my-3 h-12 w-12 rounded-full"
										/>
									)}
									<Typography size="lg">
										{ngoHoverCard.quoteAuthor}, {currentNgo['org-short-name']}
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
							<Typography size="lg">{translations.mission}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{currentNgo!['org-mission']}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translations.founded}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{ngoHoverCard.orgFoundation}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translations.headquarter}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{ngoHoverCard.orgHeadquarter}</Typography>
						</div>
					</div>
					{showVisitOnline && (
						<div className="grid grid-cols-3 gap-4">
							<div className="col-span-1">
								<Typography size="lg">{translations.moreLinks}</Typography>
							</div>
							<div className="col-span-2">
								{ngoHoverCard.orgWebsite && (
									<Link
										href={ngoHoverCard.orgWebsite}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translations.website}
									</Link>
								)}
								{ngoHoverCard.orgFacebook && (
									<Link
										href={ngoHoverCard.orgFacebook}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translations.facebook}
									</Link>
								)}
								{ngoHoverCard.orgInstagram && (
									<Link
										href={ngoHoverCard.orgInstagram}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translations.instagram}
									</Link>
								)}
								{ngoHoverCard.orgLinkedIn && (
									<Link
										href={ngoHoverCard.orgLinkedIn}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translations.linkedin}
									</Link>
								)}
								{ngoHoverCard.orgYoutube && (
									<Link
										href={ngoHoverCard.orgYoutube}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translations.youtube}
									</Link>
								)}
							</div>
						</div>
					)}
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translations.permalink}</Typography>
						</div>
						<div className="col-span-2">
							<Link href={`/${lang}/${region}/partners/${ngoHoverCard.orgSlug}`}>
								<Typography size="lg" className="break-words underline">
									{`socialincome.org/partners/${ngoHoverCard.orgSlug}`}
								</Typography>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
