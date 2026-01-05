'use client';

import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { CountryTable } from './country-table';
import { CountryTableRow } from './types';

type CreateProgramModalViewProps = {
	trigger: ReactNode;
	rows: CountryTableRow[];
};

export function CreateProgramModalView({ trigger, rows }: CreateProgramModalViewProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<div onClick={() => setOpen(true)}>{trigger}</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent variant="large">
					<DialogHeader>
						<DialogTitle>Initiate New Program</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">Choose a country</h3>

						<CountryTable rows={rows} />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
