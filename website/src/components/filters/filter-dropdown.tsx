'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type FilterOption = {
	value: string;
	label: string;
};

export type FilterQueryParamOverride = {
	key: string;
	value?: string;
};

type FilterDropdownProps = {
	options: FilterOption[];
	queryKey: string;
	selectedValue?: string;
	/** When set, shown as the first menu item that clears the query param. */
	allLabel?: string;
	/**
	 * When the selected/chosen value equals this, the query param is deleted instead of set.
	 * Useful for defaults that omit the param from the URL (e.g. campaigns `active`).
	 */
	clearValue?: string;
	queryParamOverrides?: FilterQueryParamOverride[];
};

const applyQueryParamOverrides = (params: URLSearchParams, overrides: FilterQueryParamOverride[] = []) => {
	overrides.forEach(({ key, value }) => {
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
	});
};

export const FilterDropdown = ({
	allLabel,
	options,
	queryKey,
	selectedValue,
	clearValue,
	queryParamOverrides,
}: FilterDropdownProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedOption = options.find((option) => option.value === selectedValue);
	const isHighlighted = clearValue !== undefined ? selectedValue !== clearValue : Boolean(selectedOption);
	const buttonLabel = selectedOption?.label ?? allLabel ?? '';

	const updateFilter = (value: string | undefined) => {
		const nextParams = new URLSearchParams(searchParams.toString());

		if (value && value !== clearValue) {
			nextParams.set(queryKey, value);
		} else {
			nextParams.delete(queryKey);
		}

		applyQueryParamOverrides(nextParams, queryParamOverrides);

		const nextQuery = nextParams.toString();
		router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className={cn(
						'text-foreground border-border bg-card hover:bg-card h-10 px-4 text-sm font-medium',
						isHighlighted && 'bg-input hover:bg-input',
					)}
				>
					{buttonLabel}
					<ChevronDown className="text-foreground size-4 opacity-70" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="bg-popover w-56">
				{allLabel ? <DropdownMenuItem onSelect={() => updateFilter(undefined)}>{allLabel}</DropdownMenuItem> : null}
				{options.map((option) => (
					<DropdownMenuItem key={option.value} onSelect={() => updateFilter(option.value)}>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
