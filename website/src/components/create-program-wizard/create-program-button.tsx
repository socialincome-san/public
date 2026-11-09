'use client';

import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { ComponentProps } from 'react';

type Props = {
	label: string;
} & Pick<ComponentProps<typeof Button>, 'variant'>;

export const CreateProgramButton = ({ label, variant }: Props) => (
	<CreateProgramModal
		trigger={({ open }) => (
			<Button type="button" variant={variant} onClick={open}>
				{label}
			</Button>
		)}
	/>
);
