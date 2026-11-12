'use client';

import { CountryCondition, type CountryEligibilityRow } from '@/modules/countries/country.types';
import {
	ExpandableList,
	ExpandableListItem,
} from '@socialincome/design-system/data-display/expandable-list/expandable-list';
import { StatusMeter } from '@socialincome/design-system/data-display/status-meter/status-meter';
import { RadioGroupItem } from '@socialincome/design-system/forms/radio-group/radio-group';
import { useTranslations } from 'next-intl';
import { CountryConditionBadge } from './country-condition-badge';
import { COUNTRY_CONDITION_KEYS } from './country-conditions';
import { CountryPageLink } from './country-page-link';
import { CountryConditionDetails } from './country-table-expansion-row';
import { CountryTableName } from './country-table-name';

const METER_STATUS = {
	[CountryCondition.MET]: 'positive',
	[CountryCondition.RESTRICTIONS_APPLY]: 'caution',
	[CountryCondition.NOT_MET]: 'negative',
} as const;

const countMet = (row: CountryEligibilityRow) =>
	COUNTRY_CONDITION_KEYS.filter((key) => row[key].condition === CountryCondition.MET).length;

type Props = {
	rows: CountryEligibilityRow[];
	selectable: boolean;
	value?: string | null;
	openIds: string[];
	onToggleRow: (id: string) => void;
	countryPageHrefs?: Record<string, string>;
};

export const CountryTableList = ({ rows, selectable, value, openIds, onToggleRow, countryPageHrefs }: Props) => {
	const t = useTranslations('create-program-wizard');
	const conditions = [
		{ key: 'cash', label: t('step1.table.cash') },
		{ key: 'mobileMoney', label: t('step1.table.mobile_money') },
		{ key: 'mobileNetwork', label: t('step1.table.mobile_network') },
		{ key: 'sanctions', label: t('step1.table.sanctions') },
	] as const;

	return (
		<ExpandableList>
			{rows.map((row) => {
				const countryPageHref = row.country.isActive ? countryPageHrefs?.[row.country.isoCode] : undefined;

				return (
					<ExpandableListItem
						key={row.id}
						summary={
							<StatusMeter
								items={conditions.map(({ key, label }) => ({ label, status: METER_STATUS[row[key].condition] }))}
								label={`${countMet(row)}/${conditions.length}`}
								description={t('step1.conditions_met_count', { met: countMet(row), total: conditions.length })}
							/>
						}
						actions={countryPageHref === undefined ? undefined : <CountryPageLink href={countryPageHref} />}
						title={<CountryTableName country={row.country} />}
						leading={selectable ? <RadioGroupItem value={row.id} /> : undefined}
						fields={conditions.map(({ key, label }) => ({
							label,
							value: <CountryConditionBadge condition={row[key].condition} />,
							detail: <CountryConditionDetails details={row[key].details} />,
						}))}
						open={openIds.includes(row.id)}
						onOpenChange={() => onToggleRow(row.id)}
						selected={value === row.id}
					/>
				);
			})}
		</ExpandableList>
	);
};
