'use client';

import { RadioGroup } from '@/components/radio-group';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

type Props = {
	value: string;
	onChange: (value: string) => void;
	layout?: 'stack' | 'grid';
	children: ReactNode;
};

export function RadioCardGroup({ value, onChange, layout = 'stack', children }: Props) {
	return (
		<RadioGroup
			value={value}
			onValueChange={onChange}
			className={cn(layout === 'stack' && 'space-y-3', layout === 'grid' && 'grid grid-cols-1 gap-4 sm:grid-cols-2')}
		>
			{children}
		</RadioGroup>
	);
}
