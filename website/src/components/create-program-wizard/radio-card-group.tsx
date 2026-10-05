'use client';

import { cn } from '@socialincome/design-system/cn';
import { RadioGroup } from '@socialincome/design-system/radio-group/radio-group';
import { ReactNode } from 'react';

type Props = {
	value?: string;
	onChange: (value: string) => void;
	layout?: 'stack' | 'grid' | 'wrap';
	children: ReactNode;
};

export const RadioCardGroup = ({ value, onChange, layout = 'stack', children }: Props) => {
	return (
		<RadioGroup
			value={value}
			onValueChange={onChange}
			className={cn(
				layout === 'stack' && 'space-y-3',
				layout === 'grid' && 'grid grid-cols-1 gap-4 sm:grid-cols-2',
				layout === 'wrap' && 'flex flex-wrap gap-4',
			)}
		>
			{children}
		</RadioGroup>
	);
};
