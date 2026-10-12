import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../overlays/dialog/dialog';
import { Card } from '../card/card';
import { Stat } from '../stat/stat';

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
	const hasDetails = details !== undefined && details.facts.length > 0;

	return (
		<Card padding="none" fullHeight interactive={hasDetails}>
			<div className="flex flex-col gap-2 px-6 py-4">
				<Stat label={label} value={value} size="lg" />
				{children}
			</div>
			{hasDetails && (
				<Dialog>
					<ChevronRight className="text-muted-foreground absolute top-4 right-4 size-5" aria-hidden />
					<DialogTrigger asChild>
						{/* Stretched over the card rather than wrapping it, since a button may not contain block content */}
						<button
							type="button"
							aria-label={details.title}
							className="focus-visible:ring-ring absolute inset-0 rounded-3xl focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
						/>
					</DialogTrigger>
					<DialogContent size="alert">
						<DialogHeader>
							<DialogTitle>{details.title}</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-4">
							{[...(value ? [{ label, value }] : []), ...details.facts].map((fact) => (
								<Stat key={fact.label} label={fact.label} value={fact.value} size="lg" />
							))}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</Card>
	);
};
