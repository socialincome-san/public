import { useId, type ReactNode, type Ref } from 'react';
import { Button } from '../../actions/button/button';

type CookieBannerProps = {
	message: ReactNode;
	acceptLabel: string;
	declineLabel: string;
	onAccept: () => void;
	onDecline: () => void;
	// Lets other bottom overlays measure the banner and stay clear of it
	ref?: Ref<HTMLElement>;
};

export const CookieBanner = ({ message, acceptLabel, declineLabel, onAccept, onDecline, ref }: CookieBannerProps) => {
	const messageId = useId();

	return (
		<section
			ref={ref}
			aria-labelledby={messageId}
			className="bg-card text-card-foreground shadow-overlay motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 fixed inset-x-4 bottom-4 z-50 flex flex-col gap-4 rounded-2xl border p-5 sm:right-auto sm:max-w-md"
		>
			<p id={messageId} className="[&_a]:underline [&_a]:underline-offset-4">
				{message}
			</p>
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
