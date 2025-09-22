import { DefaultPageProps } from '@/app/[lang]/[region]';
import { OrgsPartnershipCarousel } from '@/app/[lang]/[region]/(website)/partnership/(sections)/orgs-partnership-carousel';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, BaseContainer, CardContent, CardHeader, GlowHoverCard, linkCn, Typography } from '@socialincome/ui';
import {
	ContributorsOrgsCarousel
} from '@/app/[lang]/[region]/(website)/our-work/(sections)/contributors-orgs-carousel';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-partnership'] });

	return (
		<BaseContainer className="flex flex-col space-y-12 pt-16">
			{/* ===== Hero / Intro ===== */}
			<section className="space-y-6">
				<Typography as="h1" size="5xl" weight="bold">
					{translator.t('content.title')}
				</Typography>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Typography size="2xl" weight="medium">
						{translator.t('content.lead')}
					</Typography>

					<div>
						<Typography size="lg">{translator.t('content.lead-implementation')}</Typography>
						<div className="mt-4 flex flex-wrap items-center gap-4">
							<Badge variant="outline" className="shrink-0">
								<Typography size="sm">{translator.t('content.version')}</Typography>
							</Badge>

							<Typography size="md" className="whitespace-nowrap">
								{translator.t('content.responsible')}{' '}
								<a
									href="https://socialincome.org/about-us#team"
									target="_blank"
									rel="noopener noreferrer"
									className={linkCn({ arrow: 'external', underline: 'none', size: 'md' })}
								>
									xxx
								</a>
							</Typography>
						</div>
					</div>
				</div>
			</section>

			{/* ===== Cards ===== */}
			<section className="pt-10 flex flex-col items-center">
				<Typography size="3xl" weight="medium" className="mb-12 text-center">
					{translator.t('content.section-title-1')}
				</Typography>

				<div className="w-full max-w-7xl grid grid-cols-1 gap-6 md:grid-cols-2">
					<GlowHoverCard className="theme-blue rounded-2xl border-none overflow-hidden">
						<CardHeader className="mt-3 ml-4">
							<Typography size="2xl" weight="medium" color="accent">{translator.t('content.reason-title-1')}</Typography>
						</CardHeader>
						<CardContent className="mb-5 ml-4">
							<Typography size="lg" className="opacity-80">{translator.t('content.reason-description-1')}</Typography>
						</CardContent>
					</GlowHoverCard>

					<GlowHoverCard className="theme-blue rounded-2xl border-none overflow-hidden">
						<CardHeader className="mt-3 ml-4">
							<Typography size="2xl" weight="medium" color="accent">{translator.t('content.reason-title-2')}</Typography>
						</CardHeader>
						<CardContent className="mb-5 ml-4">
							<Typography size="lg" className="opacity-80">{translator.t('content.reason-description-2')}</Typography>
						</CardContent>
					</GlowHoverCard>

					<GlowHoverCard className="theme-blue rounded-2xl border-none overflow-hidden">
						<CardHeader className="mt-3 ml-4">
							<Typography size="2xl" weight="medium" color="accent">{translator.t('content.reason-title-3')}</Typography>
						</CardHeader>
						<CardContent className="mb-5 ml-4">
							<Typography size="lg" className="opacity-80">{translator.t('content.reason-description-3')}</Typography>
						</CardContent>
					</GlowHoverCard>

					<GlowHoverCard className="theme-blue rounded-2xl border-none overflow-hidden">
						<CardHeader className="mt-3 ml-4">
							<Typography size="2xl" weight="medium" color="accent">{translator.t('content.reason-title-4')}</Typography>
						</CardHeader>
						<CardContent className="mb-5 ml-4">
							<Typography size="lg" className="opacity-80">{translator.t('content.reason-description-4')}</Typography>
						</CardContent>
					</GlowHoverCard>
				</div>
			</section>

			<section className="pt-10 flex flex-col items-center">
				<Typography size="3xl" weight="medium" className="mb-12 text-center">
					{translator.t('content.section-title-2')}
				</Typography>
				<OrgsPartnershipCarousel />
			</section>

			<section className="pt-10 flex flex-col items-center">
				<Typography size="3xl" weight="medium" className="mb-12 text-center">
					{translator.t('content.section-title-3')}
				</Typography>
				<div className="mt-6 w-full">
					<ul className="list-disc pl-6 space-y-2">
						<li>
							<Typography size="lg" className="mb-12">
								{translator.t('content.section-4-lead-1')}
							</Typography>
							<span className="font-semibold">One-Time Donations & Employee Matching:</span> Make an immediate impact today.
						</li>
						<li>
							<span className="font-semibold">In-kind Donations:</span> Donate your employees’ time to develop Social Income further.
						</li>
						<li>
							<span className="font-semibold">Launch a Direct Cash Program:</span> “Adopt a Community” by sponsoring your own tailored cash-transfer initiative.
						</li>
					</ul>
				</div>
			</section>

			<section className="pt-10 flex flex-col items-center">
				<Typography size="3xl" weight="medium" className="mb-12 text-center">
					{translator.t('content.section-title-4')}
				</Typography>
				<Typography size="lg" className="mb-12 text-center">
					{translator.t('content.section-4-lead-1')}
				</Typography>
			</section>


		</BaseContainer>
	);
}