import {
	donationHeroCardSizeClass,
	getDonationWizardCardClass,
} from '@/components/donation-wizard/utils/donation-wizard-layout';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { LocalPartnerPrograms } from '@/lib/storyblok/local-partner-programs';
import { LOCAL_PARTNER_PROGRAM_ROWS } from '@/lib/storyblok/local-partner-programs.utils';
import { cn } from '@/lib/utils/cn';
import NextLink from 'next/link';
import { BuildOwnProgramLink } from './build-own-program-link';
import { LocalPartnerProgramRow } from './local-partner-program-row';

/** Static classes so Tailwind can see them; the rows divide the fixed list height between them. */
const rowsClassBySlotCount: Record<number, string> = {
	1: 'grid-rows-1',
	2: 'grid-rows-2',
	3: 'grid-rows-3',
	4: 'grid-rows-4',
};

type Props = {
	partnerPrograms: LocalPartnerPrograms;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnerProgramsCard = async ({ partnerPrograms, lang, region }: Props) => {
	const { programs, programCount, recipientsTotal, isPartnerScoped } = partnerPrograms;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const t = (key: string) => translator.t(`local-partners-page.${key}`);
	const format = (key: string, count: number) => translator.t(`local-partners-page.${key}`, { context: { count } });

	const hasOverflow = programCount > LOCAL_PARTNER_PROGRAM_ROWS;
	const visiblePrograms = hasOverflow ? programs.slice(0, LOCAL_PARTNER_PROGRAM_ROWS - 1) : programs;
	const hiddenCount = programCount - visiblePrograms.length;
	const slotCount = visiblePrograms.length + (hasOverflow ? 1 : 0);
	const programCountLabel = format(
		programCount === 1 ? 'programs-in-count-singular' : 'programs-in-count-plural',
		programCount,
	);
	const allProgramsHref = `/${lang}/${region}/programs`;

	return (
		<div
			data-testid="local-partner-programs-card"
			className={cn(
				getDonationWizardCardClass('stepAmount'),
				'mx-0 flex max-w-none flex-col lg:mx-auto lg:max-w-[400px]',
				'text-foreground md:px-9 md:py-9',
				donationHeroCardSizeClass,
			)}
		>
			{/* The recipient total is only the partner's own on the partner-scoped path; the fallback just counts programs. */}
			<div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
				<p className="text-xl leading-none font-bold sm:text-2xl">
					{isPartnerScoped
						? format(
								recipientsTotal === 1 ? 'recipient-singular-with-count' : 'recipient-plural-with-count',
								recipientsTotal,
							)
						: format(programCount === 1 ? 'programs-count-singular' : 'programs-count-plural', programCount)}
				</p>
				{isPartnerScoped ? <p className="text-muted-foreground text-xs leading-4">{programCountLabel}</p> : null}
			</div>

			<ul className={cn('grid min-h-0 flex-1 gap-2', rowsClassBySlotCount[slotCount])}>
				{visiblePrograms.map((program) => (
					<LocalPartnerProgramRow
						key={program.programId}
						program={program}
						href={`/${lang}/${region}/programs/${program.storyblokSlug}`}
						recipientsLabel={format(
							program.recipientsCount === 1 ? 'recipient-singular-with-count' : 'recipient-plural-with-count',
							program.recipientsCount,
						)}
						fundraisingLabel={t('programs-fundraising')}
					/>
				))}

				{hasOverflow ? (
					<li className="min-h-0">
						<NextLink
							href={allProgramsHref}
							data-testid="local-partner-programs-more"
							className={cn(
								'border-input/60 hover:bg-muted/50 focus-visible:ring-ring text-muted-foreground hover:text-foreground',
								'flex h-full items-center rounded-xl border px-5 text-sm leading-5 font-medium transition-colors',
								'focus-visible:ring-1 focus-visible:outline-hidden',
							)}
						>
							{format('programs-more', hiddenCount)}
						</NextLink>
					</li>
				) : null}
			</ul>

			<BuildOwnProgramLink label={t('programs-build-own')} />
		</div>
	);
};
