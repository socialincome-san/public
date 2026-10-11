'use client';

import { ChevronRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../overlays/dialog/dialog';
import { Card } from '../card/card';

type FactCardFact = {
	label: string;
	value: string;
};

type FactCardProps = {
	label: string;
	value?: string;
	// Shown below the value, e.g. a list of badges
	children?: ReactNode;
	// Turns the card into a button opening a dialog with the card's fact followed by these
	details?: {
		title: string;
		facts: FactCardFact[];
	};
};

export const FactCard = ({ label, value, children, details }: FactCardProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const hasDetails = details !== undefined && details.facts.length > 0;

	return (
		<Card padding="none" fullHeight interactive={hasDetails}>
			<div className="flex flex-col gap-2 px-6 py-4">
				<div>
					<p className="text-muted-foreground text-xs">{label}</p>
					{value && <p className="text-xl">{value}</p>}
				</div>
				{children}
			</div>
			{hasDetails && (
				<>
					<ChevronRight className="text-muted-foreground absolute top-4 right-4 size-5" aria-hidden />
					{/* Stretched over the card rather than wrapping it, since a button may not contain block content */}
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						aria-label={details.title}
						className="focus-visible:ring-ring absolute inset-0 rounded-3xl focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
					/>
					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogContent size="alert">
							<DialogHeader>
								<DialogTitle>{details.title}</DialogTitle>
							</DialogHeader>
							<dl className="space-y-4">
								{[...(value ? [{ label, value }] : []), ...details.facts].map((fact) => (
									<div key={fact.label}>
										<dt className="text-muted-foreground text-xs">{fact.label}</dt>
										<dd className="text-xl">{fact.value}</dd>
									</div>
								))}
							</dl>
						</DialogContent>
					</Dialog>
				</>
			)}
		</Card>
	);
};
