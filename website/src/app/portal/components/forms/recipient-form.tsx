'use client';

import { Button } from '@/app/portal/components/button';
import { createRecipientAction } from '@/app/portal/server-actions/create-recipient-action';

type InitialValues = {
	firstName?: string;
	lastName?: string;
};

export type RecipientFormProps = {
	initialValues?: InitialValues;
	onSuccess: () => void;
	readOnly?: boolean;
};

export function RecipientForm({ initialValues, onSuccess, readOnly = false }: RecipientFormProps) {
	const firstName = initialValues?.firstName ?? '';
	const lastName = initialValues?.lastName ?? '';

	const formAction = async () => {
		if (readOnly) return;
		await createRecipientAction();
		onSuccess();
	};

	return (
		<form action={formAction} className="flex flex-col gap-3">
			<div className="flex flex-col gap-1">
				<div>First name</div>
				<div>{firstName || '—'}</div>
			</div>

			<div className="flex flex-col gap-1">
				<div>Last name</div>
				<div>{lastName || '—'}</div>
			</div>

			<div className="flex items-center justify-end gap-2">
				{readOnly && <span>No permission to edit</span>}
				<Button type="submit" disabled={readOnly}>
					Save recipient
				</Button>
			</div>
		</form>
	);
}
