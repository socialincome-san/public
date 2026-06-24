'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SDG_QUERY_KEY } from './focuses-overview-query';
import type { FilterOption } from './focuses-overview.server';

type Props = {
	allSdgsLabel: string;
	sdgOptions: FilterOption[];
	selectedSdg?: string;
};

export const FocusesOverviewSdgFilter = ({ allSdgsLabel, sdgOptions, selectedSdg }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedOption = sdgOptions.find((option) => option.value === selectedSdg);
	const isActive = Boolean(selectedOption);
	const buttonLabel = selectedOption?.label ?? allSdgsLabel;

	const updateFilter = (value: string | undefined) => {
		const nextParams = new URLSearchParams(searchParams.toString());

		if (value) {
			nextParams.set(SDG_QUERY_KEY, value);
		} else {
			nextParams.delete(SDG_QUERY_KEY);
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
						'text-foreground border-border bg-card hover:bg-card h-10 px-4 text-sm font-medium',
						isActive && 'bg-input hover:bg-input',
					)}
				>
					{buttonLabel}
					<ChevronDown className="text-foreground size-4 opacity-70" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="bg-popover w-56">
				<DropdownMenuItem onSelect={() => updateFilter(undefined)}>{allSdgsLabel}</DropdownMenuItem>
				{sdgOptions.map((option) => (
					<DropdownMenuItem key={option.value} onSelect={() => updateFilter(option.value)}>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
