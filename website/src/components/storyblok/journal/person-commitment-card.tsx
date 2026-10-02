'use client';

import { Card } from '@/components/card/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { ClockIcon } from 'lucide-react';
import { useState } from 'react';

export type PersonCommitmentDetail = {
	label: string;
	value: string;
};

type Props = {
	title: string;
	// The time commitment, the one fact a visitor sees without opening the card.
	value: string;
	unit?: string;
	// Work style and deadlines, kept behind the dialog.
	details: PersonCommitmentDetail[];
};

export const PersonCommitmentCard = ({ title, value, unit, details }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const hasDetails = details.length > 0;

	const card = (
		<Card variant="noPadding" clickable={hasDetails} className="h-full px-6 py-4">
			<ClockIcon className="text-muted-foreground mx-auto size-4 sm:mx-0" />
			<p className="text-muted-foreground mt-2 text-xs">{title}</p>
			{value && (
				<p className="text-xl">
					{value}
					{unit && <span className="text-muted-foreground ml-1 text-xs">{unit}</span>}
				</p>
			)}
		</Card>
	);

	if (!hasDetails) {
		return card;
	}

	return (
		<>
			<button type="button" onClick={() => setIsOpen(true)} className="block h-full w-full">
				{card}
			</button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					<dl className="space-y-4">
						{value && (
							<div>
								<dt className="text-muted-foreground text-xs">{title}</dt>
								<dd className="text-xl">
									{value}
									{unit && <span className="text-muted-foreground ml-1 text-xs">{unit}</span>}
								</dd>
							</div>
						)}
						{details.map((detail) => (
							<div key={detail.label}>
								<dt className="text-muted-foreground text-xs">{detail.label}</dt>
								<dd className="text-xl">{detail.value}</dd>
							</div>
						))}
					</dl>
				</DialogContent>
			</Dialog>
		</>
	);
};
