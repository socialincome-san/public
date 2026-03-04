import { AnimatedSILogoIcon } from '@/components/svg/animated-si-logo-icon';

type AppLoadingSkeletonProps = {
	message?: string;
	minHeightClassName?: string;
};

const LOADING_MESSAGES = [
	'You are making the world a better place.',
	'Small actions can create big change.',
	'Together, we can reduce poverty.',
	'Your support helps build real opportunities.',
	'Thank you for sharing your privilege.',
	'Direct giving. Direct impact.',
	'Every contribution matters.',
	'Change starts human to human.',
	'You are helping create a fairer future.',
	'Good things are loading...',
] as const;

export const AppLoadingSkeleton = ({
	message,
	minHeightClassName = 'min-h-[360px]',
}: AppLoadingSkeletonProps) => {
	const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

	return (
		<div className={`flex w-full items-center justify-center rounded-xl bg-white ${minHeightClassName}`} data-testid="app-loading-skeleton">
			<div className="flex flex-col items-center gap-3 px-6 text-center">
				<AnimatedSILogoIcon className="text-primary h-9 w-auto" />
				<p className="text-muted-foreground text-sm">{message ?? randomMessage}</p>
			</div>
		</div>
	);
};
