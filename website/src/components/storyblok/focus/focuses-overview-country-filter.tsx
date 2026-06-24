'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { COUNTRY_QUERY_KEY } from './focuses-overview-query';
import type { FilterOption } from './focuses-overview.server';

type Props = {
	allCountriesLabel: string;
	countryOptions: FilterOption[];
	selectedCountryIsoCode?: string;
};

export const FocusesOverviewCountryFilter = ({ allCountriesLabel, countryOptions, selectedCountryIsoCode }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedOption = countryOptions.find((option) => option.value === selectedCountryIsoCode);
	const isActive = Boolean(selectedOption);
	const buttonLabel = selectedOption?.label ?? allCountriesLabel;

	const updateFilter = (value: string | undefined) => {
		const nextParams = new URLSearchParams(searchParams.toString());

		if (value) {
			nextParams.set(COUNTRY_QUERY_KEY, value);
		} else {
			nextParams.delete(COUNTRY_QUERY_KEY);
		}

		const nextQuery = nextParams.toString();
		router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
	};

	return (
		<div className="flex min-h-10 flex-1 flex-wrap items-center gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="outline"
						className={cn(
							'text-foreground border-border bg-card hover:bg-card h-10 px-4 text-sm font-medium',
							isActive && 'bg-input hover:bg-input',
						)}
					>
						{buttonLabel}
						<ChevronDown className="text-foreground size-4 opacity-70" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="bg-popover w-56">
					<DropdownMenuItem onSelect={() => updateFilter(undefined)}>{allCountriesLabel}</DropdownMenuItem>
					{countryOptions.map((option) => (
						<DropdownMenuItem key={option.value} onSelect={() => updateFilter(option.value)}>
							{option.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
