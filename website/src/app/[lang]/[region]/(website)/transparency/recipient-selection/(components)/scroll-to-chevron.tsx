'use client';

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Button } from '@socialincome/ui';
import classNames from 'classnames';

type ScrollToChevronProps = {
	elementId: string;
	bounce?: boolean;
};

function ScrollToChevron({ elementId, bounce }: ScrollToChevronProps) {
	return (
		<Button
			variant="ghost"
			onClick={() => {
				document.getElementById(elementId)?.scrollIntoView({
					block: 'start',
					behavior: 'smooth',
				});
			}}
		>
			<ChevronDownIcon
				className={classNames('text-foreground h-8 w-8', {
					'animate-bounce': bounce,
				})}
			/>
		</Button>
	);
}

export default ScrollToChevron;
