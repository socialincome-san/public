'use client';

import { Button } from '@/app/portal/components/button';
import { makeRecipientColumns } from '@/app/portal/components/data-table/columns/recipients';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { RecipientForm } from '@/app/portal/components/forms/recipient-form';
import { ScrollArea } from '@/app/portal/components/scroll-area';
import { Gender, RecipientStatus } from '@prisma/client';
import type { RecipientTableViewRow } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { useState } from 'react';

export function RecipientsTableClient({ rows, error }: { rows: RecipientTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);

	const [initialValues, setInitialValues] = useState<{
		omUid?: number;
		firstName?: string;
		lastName?: string;
		status?: RecipientStatus;
		organizationId?: string;
		mobileMoneyPhone?: string;
		mobileMoneyPhoneHasWhatsapp?: boolean;
		callingName?: string;
		communicationPhone?: string;
		communicationPhoneHasWhatsapp?: boolean;
		communicationPhoneWhatsappActivated?: boolean;
		gender?: Gender;
		language?: string;
		profession?: string;
		email?: string;
		instaHandle?: string;
		twitterHandle?: string;
		birthDate?: Date;
	} | null>(null);

	const [readOnly, setReadOnly] = useState(false);

	const openBlank = () => {
		setInitialValues(null);
		setReadOnly(false);
		setOpen(true);
	};

	const handleRowClick = (row: RecipientTableViewRow) => {
		setInitialValues({
			omUid: row.omUid,
			firstName: row.firstName,
			lastName: row.lastName,
			status: row.status,
			organizationId: row.organizationId,
			mobileMoneyPhone: row.mobileMoneyPhone,
			mobileMoneyPhoneHasWhatsapp: row.mobileMoneyPhoneHasWhatsapp,
			callingName: row.callingName,
			communicationPhone: row.communicationPhone,
			communicationPhoneHasWhatsapp: row.communicationPhoneHasWhatsapp,
			communicationPhoneWhatsappActivated: row.communicationPhoneWhatsappActivated,
			gender: row.gender,
			language: row.language,
			profession: row.profession,
			email: row.email,
			instaHandle: row.instaHandle,
			twitterHandle: row.twitterHandle,
			birthDate: row.birthDate,
		});
		setReadOnly(row.permission !== 'operator');
		setOpen(true);
	};

	return (
		<>
			<DataTable
				title="Recipients"
				error={error}
				emptyMessage="No recipients found"
				data={rows}
				makeColumns={makeRecipientColumns}
				actions={<Button onClick={openBlank}>Add new recipient</Button>}
				onRowClick={handleRowClick}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-[425]" aria-description="Recipient details">
					<DialogHeader>
						<DialogTitle>
							{readOnly ? 'View Recipient' : initialValues ? 'Edit Recipient' : 'New Recipient'}
						</DialogTitle>
					</DialogHeader>

					<ScrollArea className="-m-6 mt-0 grid max-h-[85vh] gap-4">
						<RecipientForm
							initialValues={initialValues}
							readOnly={readOnly}
							onCancel={() => setOpen(false)}
							onSuccess={() => setOpen(false)}
						/>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
