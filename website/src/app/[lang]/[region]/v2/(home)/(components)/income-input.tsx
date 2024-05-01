'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button, Popover, PopoverContent, PopoverTrigger, Typography } from '@socialincome/ui';

export function IncomeInput() {
	const choices = ['CHF', 'USD'];

	return (
		<div className="flex flex-col text-white">
			<div className="align-center flex items-center justify-center">
				<Typography size="5xl" weight="medium" className=" mr-1 w-32 py-2 text-right opacity-40">
					6
				</Typography>
				<Popover openDelay={100} closeDelay={200}>
					<PopoverTrigger asChild>
						<Button className="flex items-center space-x-1 ">
							<Typography size="xs">{choices[0]}</Typography>
							<ChevronDownIcon className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent asChild className="bg-popover w-12 p-0">
						<ul className="divide-muted divide-y">
							{choices.map((choice, index) => (
								<li key={index} className="hover:bg-popover-muted py-2 text-center">
									<Typography size="xs">{choice}</Typography>
								</li>
							))}
						</ul>
					</PopoverContent>
				</Popover>
			</div>
			<div className="w-64 self-center opacity-40">
				<hr />
			</div>
		</div>
	);
}
