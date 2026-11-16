import { COUNTRY_CONDITION_KEYS, meetsAllConditions } from '@/components/create-program-wizard/step-1/country-conditions';
import { CountryCondition, type CountryEligibilityRow } from '@/modules/countries/country.types';
import { BreakdownList, BreakdownRow } from '@socialincome/design-system/data-display/breakdown-list/breakdown-list';
import { PersonNote, PersonNoteLink } from '@socialincome/design-system/data-display/person-note/person-note';
import { Progress } from '@socialincome/design-system/feedback/progress/progress';
import { SplitSection, SplitSectionCard } from '@socialincome/design-system/layout/split-section/split-section';
import { getTranslations } from 'next-intl/server';

const CONDITION_TEXT_KEYS = {
	cash: 'cash',
	mobileMoney: 'mobile_money',
	mobileNetwork: 'mobile_network',
	sanctions: 'sanctions',
} as const;

type Props = {
	rows: CountryEligibilityRow[];
	// The person who maintains the data
	contact?: { name: string; href: string; imageSrc?: string };
};

export const CountryEligibilityIntro = async ({ rows, contact }: Props) => {
	const t = await getTranslations('create-program-wizard');
	const total = rows.length;

	return (
		<SplitSection
			headline={t.rich('country_eligibility_page.headline', { b: (chunks) => <strong>{chunks}</strong> })}
			headingLevel={1}
			description={`${t('country_eligibility_page.lead')}\n\n${t('country_eligibility_page.note')}`}
			intro={
				contact && (
					<PersonNote name={contact.name} imageSrc={contact.imageSrc}>
						{t.rich('country_eligibility_page.contact_text', {
							name: contact.name,
							link: (chunks) => <PersonNoteLink href={contact.href}>{chunks}</PersonNoteLink>,
						})}
					</PersonNote>
				)
			}
		>
			<SplitSectionCard
				title={t('country_eligibility_page.review_title')}
				headingLevel={2}
				status={{
					text: t('country_eligibility_page.eligible_summary', {
						eligible: rows.filter(meetsAllConditions).length,
						active: rows.filter((row) => row.country.isActive).length,
					}),
					variant: 'confirm',
				}}
			>
				<BreakdownList>
					{COUNTRY_CONDITION_KEYS.map((key) => {
						const met = rows.filter((row) => row[key].condition === CountryCondition.MET).length;

						return (
							<BreakdownRow
								key={key}
								label={t(`step1.table.${CONDITION_TEXT_KEYS[key]}`)}
								value={t('country_eligibility_page.met_count', { met, total })}
								description={t(`country_eligibility_page.conditions.${CONDITION_TEXT_KEYS[key]}`)}
							>
								<Progress value={total === 0 ? 0 : (met / total) * 100} />
							</BreakdownRow>
						);
					})}
				</BreakdownList>
			</SplitSectionCard>
		</SplitSection>
	);
};
