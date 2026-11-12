'use client';

import { cn } from '@socialincome/design-system/cn';
import { Label } from '@socialincome/design-system/forms/label/label';
import { SearchInput } from '@socialincome/design-system/forms/search-input/search-input';
import { Switch } from '@socialincome/design-system/forms/switch/switch';
import { useTranslations } from 'next-intl';
import { useId, type ReactNode } from 'react';

type Props = {
	title?: string;
	aside?: ReactNode;
	showSearch: boolean;
	showFilters: boolean;
	search: string;
	onSearchChange: (v: string) => void;
	onlyAllMet: boolean;
	onOnlyAllMetChange: (v: boolean) => void;
	onlyActive: boolean;
	onOnlyActiveChange: (v: boolean) => void;
};

export const CountryTableHeader = ({
	title,
	aside,
	showSearch,
	showFilters,
	search,
	onSearchChange,
	onlyAllMet,
	onOnlyAllMetChange,
	onlyActive,
	onOnlyActiveChange,
}: Props) => {
	const t = useTranslations('create-program-wizard');
	const id = useId();

	if (!title && !showSearch && !showFilters && aside === undefined) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center gap-3">
			{title && <p className="mr-auto text-sm font-medium">{title}</p>}

			{showSearch && (
				<div className="w-full sm:w-48">
					<SearchInput
						aria-label={t('common.search')}
						placeholder={t('common.search')}
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
			)}

			{/* On mobile the toggles and the aside share the row below the full-width search */}
			{(showFilters || aside !== undefined) && (
				<div
					className={cn('flex items-center gap-3 whitespace-nowrap', aside === undefined ? 'w-full sm:w-auto' : 'flex-1')}
				>
					{showFilters && (
						<>
							<div className="flex items-center gap-2">
								<Switch checked={onlyAllMet} onCheckedChange={onOnlyAllMetChange} id={`${id}-all-met`} />
								<Label htmlFor={`${id}-all-met`}>{t('step1.all_conditions_met')}</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch checked={onlyActive} onCheckedChange={onOnlyActiveChange} id={`${id}-active`} />
								<Label htmlFor={`${id}-active`}>{t('step1.active_countries')}</Label>
							</div>
						</>
					)}

					{aside !== undefined && <div className="ml-auto">{aside}</div>}
				</div>
			)}
		</div>
	);
};
