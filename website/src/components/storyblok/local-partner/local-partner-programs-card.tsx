import {
	donationHeroCardSizeClass,
	getDonationWizardCardClass,
} from '@/components/donation-wizard/utils/donation-wizard-layout';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteBasePath } from '@/lib/i18n/utils';
import { LOCAL_PARTNER_PROGRAM_ROWS } from '@/lib/storyblok/local-partner-programs.utils';
import type { LocalPartnerPrograms } from '@/modules/local-partners/local-partner.types';
import { cn } from '@socialincome/design-system/cn';
import { getTranslations } from 'next-intl/server';
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
	currency: WebsiteCurrency;
};

export const LocalPartnerProgramsCard = async ({ partnerPrograms, lang, currency }: Props) => {
	const { programs, programCount, recipientsTotal, isPartnerScoped } = partnerPrograms;
	const t = await getTranslations('website-common');

	const hasOverflow = programCount > LOCAL_PARTNER_PROGRAM_ROWS;
	const visiblePrograms = hasOverflow ? programs.slice(0, LOCAL_PARTNER_PROGRAM_ROWS - 1) : programs;
	const hiddenCount = programCount - visiblePrograms.length;
	const slotCount = visiblePrograms.length + (hasOverflow ? 1 : 0);
	const programCountLabel = t(
		programCount === 1 ? 'local-partners-page.programs-in-count-singular' : 'local-partners-page.programs-in-count-plural',
		{ count: programCount },
	);
	const allProgramsHref = `${getWebsiteBasePath(lang, currency)}/programs`;

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
						? t(
								recipientsTotal === 1
									? 'local-partners-page.recipient-singular-with-count'
									: 'local-partners-page.recipient-plural-with-count',
								{ count: recipientsTotal },
							)
						: t(
								programCount === 1
									? 'local-partners-page.programs-count-singular'
									: 'local-partners-page.programs-count-plural',
								{ count: programCount },
							)}
				</p>
				{isPartnerScoped ? <p className="text-muted-foreground text-xs leading-4">{programCountLabel}</p> : null}
			</div>

			<ul className={cn('grid min-h-0 flex-1 gap-2', rowsClassBySlotCount[slotCount])}>
				{visiblePrograms.map((program) => (
					<LocalPartnerProgramRow
						key={program.programId}
						program={program}
						href={`${getWebsiteBasePath(lang, currency)}/programs/${program.storyblokSlug}`}
						recipientsLabel={t(
							program.recipientsCount === 1
								? 'local-partners-page.recipient-singular-with-count'
								: 'local-partners-page.recipient-plural-with-count',
							{ count: program.recipientsCount },
						)}
						fundraisingLabel={t('local-partners-page.programs-fundraising')}
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
							{t('local-partners-page.programs-more', { count: hiddenCount })}
						</NextLink>
					</li>
				) : null}
			</ul>

			<BuildOwnProgramLink label={t('local-partners-page.programs-build-own')} />
		</div>
	);
};
