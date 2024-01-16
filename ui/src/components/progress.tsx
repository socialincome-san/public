'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '../lib/utils';
const Progress = ProgressPrimitive.Root;
const ProgressIndicator = ProgressPrimitive.Indicator;

const ProgressBar = () => {
	const progress = 96;

	return (
		<Progress className={cn('m-0.25 relative ml-1 h-[25px] w-full overflow-hidden rounded-[99999px]')} value={progress}>
			<ProgressIndicator
				className={cn(
					`bg-accent h-full w-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)] -translate-x-${progress}`,
				)}
			/>
		</Progress>
	);
};

export { Progress, ProgressBar, ProgressIndicator };
