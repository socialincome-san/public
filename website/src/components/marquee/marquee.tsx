import { cn } from '@/lib/utils/cn';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	className?: string;
	direction?: 'left' | 'right';
	speed?: 'slow' | 'regular' | 'fast';
}>;

const animationClassMap = {
	left: 'animate-[marquee-left_45s_linear_infinite]',
	right: 'animate-[marquee-right_45s_linear_infinite]',
};

const speedClassMap = {
	slow: '[animation-duration:55s]',
	regular: '[animation-duration:45s]',
	fast: '[animation-duration:35s]',
};

export const Marquee = ({ children, className, direction = 'left', speed = 'regular' }: Props) => (
	<div className={cn('group overflow-hidden [contain-intrinsic-size:auto_300px] [content-visibility:auto]', className)}>
		<div
			className={cn(
				'flex w-max will-change-transform group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none',
				animationClassMap[direction],
				speedClassMap[speed],
			)}
		>
			<div className="flex shrink-0 motion-reduce:w-full">{children}</div>

			<div className="flex shrink-0 motion-reduce:hidden" aria-hidden="true" inert>
				{children}
			</div>
		</div>
	</div>
);
