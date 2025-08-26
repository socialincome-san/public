'use client';

import { Button } from '@/app/portal/components/button';
import { DialogFooter } from '@/app/portal/components/dialog';
import { Input } from '@/app/portal/components/input';
import { Label } from '@/app/portal/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import { createRecipientAction } from '@/app/portal/server-actions/create-recipient-action';
import { RecipientStatus } from '@prisma/client';

type InitialValues = {
	firstName?: string;
	lastName?: string;
	status?: RecipientStatus;
};

export type RecipientFormProps = {
	initialValues?: InitialValues;
	onSuccess: () => void;
	readOnly?: boolean;
};

export function RecipientForm({ initialValues, onSuccess, readOnly = false }: RecipientFormProps) {
	const formItemClasses = 'flex flex-col gap-2';
	const firstName = initialValues?.firstName ?? '';
	const lastName = initialValues?.lastName ?? '';
	const status = initialValues?.status ?? '';

	const formAction = async () => {
		if (readOnly) return;
		await createRecipientAction();
		onSuccess();
	};

	return (
		<form action={formAction} className="flex flex-col gap-6">
			<div className={formItemClasses}>
				<Label htmlFor="first-name">First name</Label>
				<Input id="first-name" defaultValue={firstName} disabled={readOnly} className="" />
			</div>

			<div className={formItemClasses}>
				<Label htmlFor="last-name">Last name</Label>
				<Input id="last-name" defaultValue={lastName} disabled={readOnly} />
			</div>

			<div className={formItemClasses}>
				<Label htmlFor="status">Status</Label>
				<Select value={status}>
					<SelectTrigger id="status">
						<SelectValue placeholder="Choose" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="suspended">Suspended</SelectItem>
						<SelectItem value="waitlisted">Waitlisted</SelectItem>
						<SelectItem value="designated">Designated</SelectItem>
						<SelectItem value="former">Former</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				{readOnly && <span>No permission to edit</span>}
				<DialogFooter>
					<Button variant="outline" onClick={() => {}}>
						Cancel
					</Button>
					<Button type="submit" disabled={readOnly}>
						Save recipient
					</Button>
				</DialogFooter>
			</div>
		</form>
	);
}
