import { cn } from '@socialincome/design-system/cn';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
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

// -mx-4 with px-4 keeps item shadows from being clipped
export const Marquee = ({ children, direction = 'left', speed = 'regular' }: Props) => (
	<div className="group -mx-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] px-4 py-1 [contain-intrinsic-size:auto_300px] [content-visibility:auto]">
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
