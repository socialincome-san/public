'use client';

import { RadioGroup } from '@socialincome/design-system/forms/radio-group/radio-group';
import { ReactNode } from 'react';

type Props = {
	value?: string;
	onChange: (value: string) => void;
	layout?: 'stack' | 'grid' | 'wrap';
	children: ReactNode;
};

export const RadioCardGroup = ({ value, onChange, layout = 'stack', children }: Props) => {
	return (
		<RadioGroup value={value} onValueChange={onChange} layout={layout === 'wrap' ? 'row' : layout}>
			{children}
		</RadioGroup>
	);
};
