'use client';

import { ActionMenu, type ActionMenuItem } from '@/components/data-table/elements/action-menu';
import { Button } from '@/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { InfoIcon } from 'lucide-react';
import { Input } from '../../input';

type DataTableToolbarProps = {
	showControls: boolean;
	searchKeys: string[];
	onSearchChange: (value: string) => void;
	actionMenuItems?: ActionMenuItem[];
};

export const DataTableToolbar = ({ showControls, searchKeys, onSearchChange, actionMenuItems }: DataTableToolbarProps) => {
	return (
		<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
			<div className="min-w-[220px]">
				{showControls && searchKeys.length > 0 ? (
					<div className="flex items-center gap-2">
						<Input className="w-full max-w-80" placeholder="Search..." onChange={(e) => onSearchChange(e.target.value)} />
						<Tooltip>
							<TooltipTrigger asChild>
								<Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label="Show searchable fields">
									<InfoIcon className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent sideOffset={6}>Search fields: {searchKeys.join(', ')}</TooltipContent>
						</Tooltip>
					</div>
				) : null}
			</div>
			<div className="flex items-center gap-2">{showControls ? <ActionMenu items={actionMenuItems} /> : null}</div>
		</div>
	);
};
