import { CreateProgramButton } from '@/components/create-program-wizard/create-program-button';
import { donationHeroCardSizeClass } from '@/components/donation-wizard/utils/donation-wizard-layout';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteBasePath } from '@/lib/i18n/utils';
import { LOCAL_PARTNER_PROGRAM_ROWS } from '@/lib/storyblok/local-partner-programs.utils';
import type { LocalPartnerPrograms } from '@/modules/local-partners/local-partner.types';
import { RowLink } from '@socialincome/design-system/actions/row-link/row-link';
import { cn } from '@socialincome/design-system/cn';
import { StatusCard } from '@socialincome/design-system/data-display/status-card/status-card';
import { SummaryHeading } from '@socialincome/design-system/data-display/summary-heading/summary-heading';
import { getTranslations } from 'next-intl/server';
import { LocalPartnerProgramRow } from './local-partner-program-row';

/** Static classes so Tailwind can see them; the visible rows stay equally sized. */
const rowsClassBySlotCount: Record<number, string> = {
	1: 'grid-rows-1',
	2: 'grid-rows-2',
	3: 'grid-rows-3',
	4: 'grid-rows-4',
};

type Props = {
	partnerName: string;
	partnerPrograms: LocalPartnerPrograms;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LocalPartnerProgramsCard = async ({ partnerName, partnerPrograms, lang, currency }: Props) => {
	const { programs, programCount, recipientsTotal, isPartnerScoped, candidates } = partnerPrograms;
	const t = await getTranslations('website-common');

	const hasOverflow = programCount > LOCAL_PARTNER_PROGRAM_ROWS;
	const visiblePrograms = hasOverflow ? programs.slice(0, LOCAL_PARTNER_PROGRAM_ROWS - 1) : programs;
	const hiddenCount = programCount - visiblePrograms.length;
	const slotCount = visiblePrograms.length + (hasOverflow ? 1 : 0);
	const programCountLabel = t(
		programCount === 1 ? 'local-partners-page.programs-in-count-singular' : 'local-partners-page.programs-in-count-plural',
		{ count: programCount },
	);
	const buildOwnLabel = candidates.isPartnerScoped
		? t('local-partners-page.programs-build-own-with-partner-candidates', {
				count: candidates.count,
				partner: partnerName,
			})
		: t('local-partners-page.programs-build-own-with-candidates', { count: candidates.count });
	const allProgramsHref = `${getWebsiteBasePath(lang, currency)}/programs`;

	return (
		<div
			data-testid="local-partner-programs-card"
			className={cn('text-foreground grid w-full lg:mx-auto lg:max-w-[400px]', donationHeroCardSizeClass)}
		>
			<StatusCard
				status={
					candidates.count > 0
						? {
								text: buildOwnLabel,
								variant: 'confirm',
								action: (
									<CreateProgramButton
										label={t('local-partners-page.programs-build-own-start')}
										variant="outline"
										size="sm"
									/>
								),
							}
						: { variant: 'secondary' }
				}
			>
				{/* Without linked recipients there is no partner total, so only the (empty) program count is shown. */}
				<div className="mb-4">
					<SummaryHeading
						title={
							isPartnerScoped
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
									)
						}
						detail={isPartnerScoped ? programCountLabel : undefined}
					/>
				</div>

				<ul
					className={cn(
						'grid min-h-0 gap-2',
						hasOverflow ? 'grid-rows-[repeat(3,1fr)_auto]' : rowsClassBySlotCount[slotCount],
					)}
				>
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
							<RowLink
								label={t('local-partners-page.programs-more', { count: hiddenCount })}
								href={allProgramsHref}
								testId="local-partner-programs-more"
							/>
						</li>
					) : null}
				</ul>
			</StatusCard>
		</div>
	);
};
