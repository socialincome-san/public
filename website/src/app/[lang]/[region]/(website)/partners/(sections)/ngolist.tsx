import { DefaultParams } from '@/app/[lang]/[region]';
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
import { SL } from 'country-flag-icons/react/1x1';
import Image from 'next/image';
import Link from 'next/link';
import Ngo1 from '../(assets)/aurora.png';
import SdgIcon from '../(assets)/sdg-circle.svg';
export async function NgoList({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partners', 'website-common', 'countries'],
	});

	return (
		<div className="mx-auto max-w-6xl">
			<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-2">
				<Dialog>
					<DialogTrigger className="text-left">
						<Card className="hover:bg-primary max-w-lg rounded-lg border-none bg-transparent p-6 shadow-none hover:bg-opacity-10">
							<CardHeader className="p-0">
								<CardTitle className="flex items-center justify-between">
									<Typography size="2xl" weight="medium">
										{translator.t('ngo-1.org-short-name')}
									</Typography>
								</CardTitle>
							</CardHeader>
							<Separator className="bg-primary mt-4 bg-opacity-30" />
							<CardContent className="my-4 p-0">
								<Typography size="lg">{translator.t('ngo-1.org-mission')}</Typography>
							</CardContent>
							<CardFooter className="gap-2 p-0 pt-2">
								<HoverCard>
									<HoverCardTrigger>
										<SL className="h-5 w-5 rounded-full" />
									</HoverCardTrigger>
									<HoverCardContent className="inline-flex w-auto items-center">
										<div className="mr-3">
											<SL className="h-9 w-9 rounded-full" />
										</div>
										<Typography size="sm" weight="normal" className="text-inherit">
											{translator.t('SL')}
										</Typography>
									</HoverCardContent>
								</HoverCard>
								<HoverCard>
									<HoverCardTrigger>
										<Badge className="bg-primary hover:bg-primary text-primary bg-opacity-10 hover:bg-opacity-100 hover:text-white">
											<UsersIcon className="mr-1 h-4 w-4 rounded-full" />
											<Typography size="sm" weight="normal" className="text-inherit">
												{translator.t('ngo-1.recipients-total')}
											</Typography>
										</Badge>
									</HoverCardTrigger>
									<HoverCardContent className="w-auto max-w-52 p-4">
										<div>
											<Typography size="sm" weight="normal">
												{translator.t('ngo-1.recipients-total')} {translator.t('badges.recipients-by')}{' '}
												{translator.t('ngo-1.org-short-name')}
											</Typography>
										</div>
										<Separator className="bg-primary mb-3 mt-2 bg-opacity-20" />
										<div className="flex flex-col space-y-2">
											<Badge className="bg-primary text-popover-foreground hover:bg-primary hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
												<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
													{translator.t('ngo-1.recipients-active')} {translator.t('badges.active')}
												</Typography>
											</Badge>
											<Badge className="bg-accent text-popover-foreground hover:bg-accent hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
												<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
													{translator.t('ngo-1.recipients-former')} {translator.t('badges.former')}
												</Typography>
											</Badge>
											<Badge className="bg-secondary text-popover-foreground hover:bg-secondary hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
												<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
													{translator.t('ngo-1.recipients-suspended')} {translator.t('badges.suspended')}
												</Typography>
											</Badge>
										</div>
									</HoverCardContent>
								</HoverCard>
								<HoverCard>
									<HoverCardTrigger>
										<Badge className="bg-primary hover:bg-primary text-primary bg-opacity-10 hover:bg-opacity-100 hover:text-white">
											<Typography size="sm" weight="normal" className="text-inherit">
												{translator.t('sdg.sdg1-title')}
											</Typography>
										</Badge>
									</HoverCardTrigger>
									<HoverCardContent>
										<div className="flex items-center">
											<Image className="mr-1 h-4 w-4 rounded-full" src={SdgIcon} alt="SDG Icon" />
											<Typography size="sm" weight="normal">
												{translator.t('sdg.sdg')} 1: {translator.t('sdg.sdg1-title')}
											</Typography>
										</div>
										<Separator className="bg-primary mb-3 mt-3 bg-opacity-20" />
										<div>
											<Typography size="sm" weight="normal">
												{translator.t('sdg.sdg1-mission-1')} {translator.t('ngo-1.org-short-name')}{' '}
												{translator.t('sdg.sdg1-mission-2')}
											</Typography>
										</div>
									</HoverCardContent>
								</HoverCard>
								<HoverCard>
									<HoverCardTrigger>
										<Badge className="bg-primary hover:bg-primary text-primary bg-opacity-10 hover:bg-opacity-100 hover:text-white">
											<Typography size="sm" weight="normal" className="text-inherit">
												{translator.t('sdg.sdg8-title')}
											</Typography>
										</Badge>
									</HoverCardTrigger>
									<HoverCardContent>
										<div className="flex items-center">
											<Image className="mr-1 h-4 w-4 rounded-full" src={SdgIcon} alt="SDG Icon" />
											<Typography size="sm" weight="normal">
												{translator.t('sdg.sdg')} 8: {translator.t('sdg.sdg8-title')}
											</Typography>
										</div>
										<Separator className="bg-primary mb-3 mt-3 bg-opacity-20" />
										<div>
											<Typography size="sm" weight="normal">
												{translator.t('sdg.sdg8-mission-1')} {translator.t('ngo-1.org-short-name')}{' '}
												{translator.t('sdg.sdg8-mission-2')}
											</Typography>
										</div>
									</HoverCardContent>
								</HoverCard>
							</CardFooter>
						</Card>
					</DialogTrigger>
					<DialogContent className="bg-background mx-0 mt-4 h-[98vh] max-h-[98vh] w-11/12 overflow-y-auto rounded-3xl border-none p-0 sm:min-w-[600px] md:min-w-[750px]">
						{' '}
						<DialogHeader className="relative">
							<Image className="h-auto w-full rounded-t-lg" src={Ngo1} alt="NGO Photo" />
							<div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black to-transparent">
								<DialogTitle className="text-accent absolute bottom-0 left-0 px-8 py-4">
									<Typography size="5xl" weight="medium">
										{translator.t('ngo-1.org-long-name')}
									</Typography>
								</DialogTitle>
							</div>
						</DialogHeader>
						<div className="px-8 pb-10 pt-2">
							<div className="flex flex-col gap-2 p-0 pb-8 pt-2 sm:flex-row sm:items-center sm:justify-between">
								<div className="pb-4 text-center sm:order-2 sm:flex-shrink-0 sm:pb-0 sm:text-right">
									<Typography size="md" weight="normal">
										{translator.t('ngo-generic.partner-since')} {translator.t('ngo-1.partnership-start')}
									</Typography>
								</div>
								<div className="flex flex-wrap justify-center gap-2 sm:justify-start">
									<HoverCard>
										<HoverCardTrigger>
											<Badge className="bg-primary hover:bg-primary text-primary bg-opacity-10 px-4 py-2 hover:bg-opacity-100 hover:text-white">
												<UsersIcon className="mr-2 h-5 w-5 rounded-full" />
												<Typography size="md" weight="normal" className="text-inherit">
													{translator.t('ngo-1.recipients-total')} {translator.t('badges.recipients')}
												</Typography>
											</Badge>
										</HoverCardTrigger>
										<HoverCardContent className="w-auto max-w-52 p-4">
											<div>
												<Typography size="sm" weight="normal">
													{translator.t('ngo-1.recipients-total')} {translator.t('badges.recipients-by')}{' '}
													{translator.t('ngo-1.org-short-name')}
												</Typography>
											</div>
											<Separator className="bg-primary mb-3 mt-2 bg-opacity-20" />
											<div className="flex flex-col space-y-2">
												<Badge className="bg-primary text-popover-foreground hover:bg-primary hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
													<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
														{translator.t('ngo-1.recipients-active')} {translator.t('badges.active')}
													</Typography>
												</Badge>
												<Badge className="bg-accent text-popover-foreground hover:bg-accent hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
													<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
														{translator.t('ngo-1.recipients-former')} {translator.t('badges.former')}
													</Typography>
												</Badge>
												<Badge className="bg-secondary text-popover-foreground hover:bg-secondary hover:text-popover-foreground bg-opacity-10 hover:bg-opacity-20">
													<Typography size="sm" weight="normal" className="whitespace-nowrap text-inherit">
														{translator.t('ngo-1.recipients-suspended')} {translator.t('badges.suspended')}
													</Typography>
												</Badge>
											</div>
										</HoverCardContent>
									</HoverCard>
									<Badge className="bg-primary hover:bg-primary text-primary bg-opacity-10 px-4 py-2 hover:bg-opacity-100 hover:text-white">
										<SL className="mr-2 h-5 w-5 rounded-full" />
										<Typography size="md" weight="normal" className="text-inherit">
											{translator.t('SL')}
										</Typography>
									</Badge>
								</div>
							</div>
							<Typography size="lg">{translator.t('ngo-1.org-description')}</Typography>
							<Separator className="bg-primary my-6 bg-opacity-10" />
							<div className="py-12 text-center">
								<div className="my-4 px-6">
									{translator.t<{ text: string; color?: FontColor }[]>('ngo-1.org-quote').map((title, index) => (
										<Typography as="span" size="3xl" weight="medium" color={title.color} key={index}>
											{title.text}{' '}
										</Typography>
									))}
								</div>
								<div className="my-4">
									<Typography size="lg">
										{translator.t('ngo-1.org-quote-author')}, {translator.t('ngo-1.org-short-name')}
									</Typography>
								</div>
							</div>
							<Separator className="bg-primary my-6 bg-opacity-10" />
							<div className="grid grid-cols-3 gap-4">
								<div className="col-span-1">
									<Typography size="lg">{translator.t('ngo-generic.mission')}</Typography>
								</div>
								<div className="col-span-2">
									<Typography size="lg">{translator.t('ngo-1.org-mission')}</Typography>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="col-span-1">
									<Typography size="lg">{translator.t('ngo-generic.founded')}</Typography>
								</div>
								<div className="col-span-2">
									<Typography size="lg">{translator.t('ngo-1.org-foundation')}</Typography>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="col-span-1">
									<Typography size="lg">{translator.t('ngo-generic.headquarter')}</Typography>
								</div>
								<div className="col-span-2">
									<Typography size="lg">{translator.t('ngo-1.org-headquarter')}</Typography>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="col-span-1">
									<Typography size="lg">{translator.t('links.more')}</Typography>
								</div>
								<div className="col-span-2">
									<Link
										href="{translator.t('ngo-1.org-website')}"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translator.t('links.website')}
									</Link>
									<Link
										href="{translator.t('ngo-1.org-facebook')}"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translator.t('links.facebook')}
									</Link>
									<Link
										href="{translator.t('ngo-1.org-instagram')}"
										className="ml-auto inline-block pr-2 text-lg underline"
									>
										{translator.t('links.instagram')}
									</Link>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
				<div className="max-w-lg rounded bg-red-500 p-6 text-white">Card 2 (should be ngo-2 in lang file)</div>
				<div className="max-w-lg rounded bg-red-500 p-6 text-white">Card 3 (should be ngo-3 in lang file)</div>
				<div className="max-w-lg rounded bg-red-500 p-6 text-white">Card 4</div>
				<div className="max-w-lg rounded bg-red-500 p-6 text-white">Card 5</div>
				<div className="max-w-lg rounded bg-red-500 p-6 text-white">Card 6</div>
			</div>
		</div>
	);
}
