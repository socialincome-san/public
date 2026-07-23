'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FilterOption } from './focuses-overview.server';

type Props = {
	allOptionsLabel: string;
	options: FilterOption[];
	queryKey: string;
	selectedValue?: string;
};

export const FocusesOverviewDropdownFilter = ({ allOptionsLabel, options, queryKey, selectedValue }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedOption = options.find((option) => option.value === selectedValue);
	const isActive = Boolean(selectedOption);
	const buttonLabel = selectedOption?.label ?? allOptionsLabel;

	const updateFilter = (value: string | undefined) => {
		const nextParams = new URLSearchParams(searchParams.toString());

		if (value) {
			nextParams.set(queryKey, value);
		} else {
			nextParams.delete(queryKey);
		}

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
						'text-foreground border-border bg-card hover:bg-card h-10 min-w-0 flex-auto justify-between px-4 text-sm font-medium',
						isActive && 'bg-input hover:bg-input',
					)}
				>
					<span className="truncate">{buttonLabel}</span>
					<ChevronDown className="text-foreground size-4 opacity-70" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="bg-popover w-56">
				<DropdownMenuItem onSelect={() => updateFilter(undefined)}>{allOptionsLabel}</DropdownMenuItem>
				{options.map((option) => (
					<DropdownMenuItem key={option.value} onSelect={() => updateFilter(option.value)}>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
