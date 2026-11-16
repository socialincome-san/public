'use client';

import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { ComponentProps } from 'react';

type Props = {
	label: string;
} & Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'fullWidth'>;

export const CreateProgramButton = ({ label, variant, size, fullWidth }: Props) => (
	<CreateProgramModal
		trigger={({ open }) => (
			<Button type="button" variant={variant} size={size} fullWidth={fullWidth} onClick={open}>
				{label}
			</Button>
		)}
	/>
);
