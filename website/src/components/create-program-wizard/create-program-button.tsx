'use client';

import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { ComponentProps } from 'react';

type Props = {
	label: string;
} & Pick<ComponentProps<typeof Button>, 'variant' | 'fullWidth'>;

export const CreateProgramButton = ({ label, variant, fullWidth }: Props) => (
	<CreateProgramModal
		trigger={({ open }) => (
			<Button type="button" variant={variant} fullWidth={fullWidth} onClick={open}>
				{label}
			</Button>
		)}
	/>
);
