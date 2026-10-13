import { useId, type ReactNode } from 'react';
import { Button } from '../../actions/button/button';

type CookieBannerProps = {
	title: string;
	description: ReactNode;
	acceptLabel: string;
	declineLabel: string;
	onAccept: () => void;
	onDecline: () => void;
};

export const CookieBanner = ({ title, description, acceptLabel, declineLabel, onAccept, onDecline }: CookieBannerProps) => {
	const titleId = useId();

	return (
		<section
			aria-labelledby={titleId}
			className="bg-card text-card-foreground shadow-overlay motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 fixed inset-x-4 bottom-4 z-50 flex flex-col gap-4 rounded-2xl border p-5 sm:right-auto sm:max-w-md"
		>
			<div className="flex flex-col gap-1">
				<h2 id={titleId} className="font-bold">
					{title}
				</h2>
				<p className="text-muted-foreground [&_a]:text-foreground text-sm [&_a]:underline [&_a]:underline-offset-4">
					{description}
				</p>
			</div>
			{/* Both choices get equal weight so declining is as easy as accepting. */}
			<div className="flex flex-col gap-2 sm:flex-row">
				<Button variant="outline" size="md" fullWidth onClick={onDecline}>
					{declineLabel}
				</Button>
				<Button size="md" fullWidth onClick={onAccept}>
					{acceptLabel}
				</Button>
			</div>
		</section>
	);
};
