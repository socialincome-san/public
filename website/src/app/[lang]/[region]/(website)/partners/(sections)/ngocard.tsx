import { FundraiserBadge, SDGBadge } from '@/app/[lang]/[region]/(website)/partners/(components)/PartnerBadges';
import { NgoCardProps } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
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
import { SL } from 'country-flag-icons/react/1x1';
import Image from 'next/image';
import Link from 'next/link';

export default async function NgoCard({
	orgShortName,
	orgMission,
	countryBadge,
	sdgBadges,
	ngoHoverCard,
	lang,
	region,
}: NgoCardProps) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-common', 'countries', 'website-partners'],
	});

	const showVisitOnline: boolean = !!(
		ngoHoverCard.orgInstagram ||
		ngoHoverCard.orgFacebook ||
		ngoHoverCard.orgWebsite ||
		ngoHoverCard.orgLinkedIn ||
		ngoHoverCard.orgYoutube
	);

	const showFundRaiser: boolean = !!ngoHoverCard.orgFundRaiserText;

	const SL_flag = SL as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;

	return (
		<Dialog>
			<DialogTrigger className="text-left">
				<Card className="hover:bg-primary max-w-lg rounded-lg p-6 shadow-none hover:bg-opacity-10">
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
					<CardFooter className="flex-row flex-wrap gap-2 p-0 pt-2">
						<HoverCard>
							<HoverCardTrigger>
								{countryBadge?.countryFlagComponent || <SL_flag className="h-5 w-5 rounded-full" />}
							</HoverCardTrigger>
							<HoverCardContent className="inline-flex w-auto items-center">
								<div className="mr-3">
									{countryBadge?.countryFlagComponent || <SL_flag className="mr-2 h-5 w-5 rounded-full" />}
								</div>
								<Typography size="sm" weight="normal" className="text-inherit">
									{translator.t(countryBadge?.countryAbbreviation || 'SL')}
								</Typography>
							</HoverCardContent>
						</HoverCard>
						{sdgBadges?.map((sdgBadge, index) => (
							<SDGBadge
								{...sdgBadge}
								key={index}
								translatorSdg={translator.t('sdg.sdg')}
								translatorSdgTitle={translator.t('sdg.sdg' + sdgBadge.sdgNumber.toString() + '-title')}
								translatorSdgMission1={translator.t('sdg.sdg' + sdgBadge.sdgNumber.toString() + '-mission-1')}
								translatorSdgMission2={translator.t('sdg.sdg' + sdgBadge.sdgNumber.toString() + '-mission-2')}
							/>
						))}
						{showFundRaiser && <FundraiserBadge fundRaiserTranslation={translator.t('ngo-generic.fundraiser')} />}
					</CardFooter>
				</Card>
			</DialogTrigger>
			<DialogContent className="bg-background h-[90vh] w-11/12 overflow-y-auto rounded-3xl border-none p-0 sm:min-w-[600px] md:min-w-[750px]">
				<DialogHeader className="relative -top-4">
					<Image
						className="h-auto w-full rounded-t-lg"
						src={ngoHoverCard.orgImage}
						width="48"
						height="48"
						alt="Organization Photo"
						unoptimized
					/>
					<div className="absolute bottom-0 left-0 h-32 w-full bg-linear-to-t from-black to-transparent">
						<DialogTitle className="text-accent absolute bottom-0 left-0 px-8 py-4">
							<Typography size="5xl" weight="medium">
								{ngoHoverCard.orgLongName}
							</Typography>
						</DialogTitle>
					</div>
				</DialogHeader>
				<div className="px-8 pb-10">
					<div className="flex flex-col gap-2 p-0 pb-8 pt-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="pb-4 text-center sm:order-2 sm:shrink-0 sm:pb-0 sm:text-right">
							<Typography size="md" weight="normal">
								{translator.t('ngo-generic.partner-since')} {ngoHoverCard.partnershipStart}
							</Typography>
						</div>
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							<Badge className="bg-primary hover:bg-primary text-primary space-x-2 bg-opacity-10 px-4 py-2 hover:bg-opacity-100 hover:text-white">
								{countryBadge?.countryFlagComponent || <SL_flag className="h-5 w-5 rounded-full" />}
								<Typography size="md" weight="normal" className="text-inherit">
									{translator.t(countryBadge?.countryAbbreviation || 'SL')}
								</Typography>
							</Badge>
						</div>
					</div>
					{showFundRaiser && (
						<div className="border-primary mb-8 flex items-center justify-start space-x-5 rounded-md border-2 border-opacity-80 py-4 pl-4">
							<FundraiserBadge fundRaiserTranslation={translator.t('ngo-generic.fundraiser')} />
							<span>
								{ngoHoverCard.orgFundRaiserText?.map((fragment, index) => {
									return fragment.href ? (
										<Link href={fragment.href} key={index}>
											<Typography as="span" size="md" color="primary" className="underline">
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
											className="my-3 h-12 w-12 rounded-full"
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
					<div className="grid grid-cols-3 gap-12 sm:gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translator.t('ngo-generic.mission')}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{orgMission}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-12 sm:gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translator.t('ngo-generic.founded')}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{ngoHoverCard.orgFoundation}</Typography>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-12 sm:gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translator.t('ngo-generic.headquarter')}</Typography>
						</div>
						<div className="col-span-2">
							<Typography size="lg">{ngoHoverCard.orgHeadquarter}</Typography>
						</div>
					</div>
					{showVisitOnline && (
						<div className="grid grid-cols-3 gap-12 sm:gap-4">
							<div className="col-span-1">
								<Typography size="lg">{translator.t('links.more')}</Typography>
							</div>
							<div className="col-span-2">
								{ngoHoverCard.orgWebsite && (
									<Link
										href={ngoHoverCard.orgWebsite}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translator.t('links.website')}
									</Link>
								)}
								{ngoHoverCard.orgFacebook && (
									<Link
										href={ngoHoverCard.orgFacebook}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translator.t('links.facebook')}
									</Link>
								)}
								{ngoHoverCard.orgInstagram && (
									<Link
										href={ngoHoverCard.orgInstagram}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translator.t('links.instagram')}
									</Link>
								)}
								{ngoHoverCard.orgLinkedIn && (
									<Link
										href={ngoHoverCard.orgLinkedIn}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translator.t('links.linkedin')}
									</Link>
								)}
								{ngoHoverCard.orgYoutube && (
									<Link
										href={ngoHoverCard.orgYoutube}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translator.t('links.youtube')}
									</Link>
								)}
							</div>
						</div>
					)}
					<div className="grid grid-cols-3 gap-12 sm:gap-4">
						<div className="col-span-1">
							<Typography size="lg">{translator.t('ngo-generic.permalink')}</Typography>
						</div>
						<div className="col-span-2">
							<Link href={`/${lang}/${region}/partners/${ngoHoverCard.orgSlug}`}>
								<Typography size="lg" className="wrap-break-word underline">
									{`socialincome.org/partners/${ngoHoverCard.orgSlug}`}
								</Typography>
							</Link>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
