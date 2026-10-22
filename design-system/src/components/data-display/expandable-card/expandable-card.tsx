import { type ReactNode } from 'react';
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../overlays/dialog/dialog';

type ExpandableCardProps = {
	title: string;
	description: string;
	// A secondary line such as source and year
	meta?: string;
	// Shown on the card and in the dialog, e.g. a link to the source
	action?: ReactNode;
	closeLabel: string;
};

export const ExpandableCard = ({ title, description, meta, action, closeLabel }: ExpandableCardProps) => {
	const metaLine = meta ? <p className="text-foreground text-base font-light">{meta}</p> : null;

	return (
		<Dialog>
			<article className="border-border bg-card shadow-card has-[button:focus-visible]:ring-ring relative flex flex-col gap-4 rounded-3xl border px-10 py-8 transition-shadow hover:shadow-xl has-[button:focus-visible]:ring-2">
				<h3 className="text-foreground line-clamp-3 text-2xl font-bold">
					{/* The ::after overlay makes the whole card open the dialog */}
					<DialogTrigger asChild>
						<button type="button" className="cursor-pointer text-left outline-none after:absolute after:inset-0">
							{title}
						</button>
					</DialogTrigger>
				</h3>
				<p className="text-foreground line-clamp-3 text-base font-normal">{description}</p>
				{metaLine}
				{action ? <div className="relative self-start">{action}</div> : null}
			</article>
			<DialogContent size="md" closeLabel={closeLabel} aria-describedby={undefined}>
				<DialogHeader divided={false}>
					<DialogTitle size="lg">{title}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<div className="flex flex-col items-start gap-4">
						<p className="text-foreground text-base font-normal">{description}</p>
						{metaLine}
						{action}
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
};
