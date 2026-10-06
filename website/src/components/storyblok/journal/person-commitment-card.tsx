'use client';

import { Card } from '@/components/card/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { useState } from 'react';

export type PersonCommitmentDetail = {
	label: string;
	value: string;
};

type Props = {
	title: string;
	// Label shown above the time commitment.
	valueLabel: string;
	// The time commitment, the one fact a visitor sees without opening the card.
	value: string;
	unit?: string;
	// Work style and deadlines, kept behind the dialog.
	details: PersonCommitmentDetail[];
};

export const PersonCommitmentCard = ({ title, valueLabel, value, unit, details }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const hasDetails = details.length > 0;
	const displayValue = unit ? `${value} ${unit}` : value;

	const card = (
		<Card variant="noPadding" clickable={hasDetails} className="h-full px-6 py-4">
			<p className="text-muted-foreground text-xs">{valueLabel}</p>
			{value && <p className="text-xl">{displayValue}</p>}
			{/* Stretched over the card rather than wrapping it, since a button may not contain block content. */}
			{hasDetails && (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					aria-label={title}
					className="focus-visible:ring-ring absolute inset-0 rounded-3xl focus-visible:ring-2 focus-visible:outline-none"
				/>
			)}
		</Card>
	);

	if (!hasDetails) {
		return card;
	}

	return (
		<>
			{card}

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				{/* Only a few facts, so it stays a centred box on small screens rather than going full screen. */}
				<DialogContent className="max-sm:inset-x-4 max-sm:top-1/2 max-sm:bottom-auto max-sm:h-auto max-sm:min-h-0 max-sm:w-auto max-sm:translate-y-[-50%] max-sm:rounded-2xl">
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					<dl className="space-y-4">
						{[...(value ? [{ label: valueLabel, value: displayValue }] : []), ...details].map((detail) => (
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
