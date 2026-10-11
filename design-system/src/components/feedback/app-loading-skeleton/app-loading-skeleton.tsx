import { cn } from '../../../cn';
import { AnimatedSILogoIcon } from '../../brand/logo/logo';
import { dataTableStableMinHeight } from '../../data-display/data-table/data-table';

type AppLoadingSkeletonProps = {
	message?: string;
	variant?: 'card' | 'page';
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

export const AppLoadingSkeleton = ({ message, variant = 'card' }: AppLoadingSkeletonProps) => {
	const defaultMessage = LOADING_MESSAGES[0];

	return (
		<div
			className={cn(
				'flex w-full items-center justify-center',
				variant === 'page'
					? 'bg-website-gradient min-h-screen rounded-none'
					: ['bg-card rounded-xl', dataTableStableMinHeight],
			)}
			data-testid="app-loading-skeleton"
		>
			<div className="flex flex-col items-center gap-3 px-6 text-center">
				<span className="text-primary">
					<AnimatedSILogoIcon width={62} height={36} />
				</span>
				<p className="text-muted-foreground text-sm">{message ?? defaultMessage}</p>
			</div>
		</div>
	);
};
