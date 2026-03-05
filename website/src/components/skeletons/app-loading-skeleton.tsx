import { AnimatedSILogoIcon } from '@/components/svg/animated-si-logo-icon';
import { cn } from '@socialincome/ui';

type AppLoadingSkeletonProps = {
	message?: string;
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

export const AppLoadingSkeleton = ({ message }: AppLoadingSkeletonProps) => {
	const defaultMessage = LOADING_MESSAGES[0];

	return (
		<div
			className={cn('flex w-full items-center justify-center rounded-xl bg-white', 'min-h-[680px] md:min-h-[760px]')}
			data-testid="app-loading-skeleton"
		>
			<div className="flex flex-col items-center gap-3 px-6 text-center">
				<AnimatedSILogoIcon className="text-primary h-9 w-auto" />
				<p className="text-muted-foreground text-sm">{message ?? defaultMessage}</p>
			</div>
		</div>
	);
};
