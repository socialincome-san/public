'use client';

import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { organizationExpensesTableConfig } from '@/components/data-table/configs/expenses-table.config';
import { organizationAdminMembersTableConfig } from '@/components/data-table/configs/organization-members-table.config';
import {
	organizationOperatedProgramsTableConfig,
	organizationOwnedProgramsTableConfig,
} from '@/components/data-table/configs/programs-table.config';
import { ProgramPermission } from '@/generated/prisma/enums';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { getExpenseTableViewAction } from '@/modules/expenses/expense.actions';
import { getOrganizationMemberTableViewAction } from '@/modules/organizations/organization.actions';
import { getProgramTableViewAction } from '@/modules/programs/program.actions';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { useState } from 'react';
import OrganizationsForm from './organizations-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId?: string;
};

export const OrganizationDialog = ({ open, onOpenChange, organizationId }: Props) => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleError = (error: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving organization: ${message}`);
		console.error('Organization Form Error', { error });
	};

	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}
			<OrganizationsForm
				organizationId={organizationId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={handleError}
			/>
		</>
	);

	if (organizationId) {
		return (
			<TabbedDialog
				open={open}
				onOpenChange={onOpenChange}
				title="Edit organization"
				tabs={[
					{ value: 'details', label: 'Details', content: form },
					{
						value: 'members',
						label: 'Members',
						content: (
							<RecordTableTab
								config={organizationAdminMembersTableConfig}
								load={(query) => getOrganizationMemberTableViewAction({ ...query, organizationId })}
								getRowHref={(row) => `/portal/admin/users?userId=${row.id}`}
							/>
						),
					},
					{
						value: 'owned-programs',
						label: 'Owned programs',
						content: (
							<RecordTableTab
								config={organizationOwnedProgramsTableConfig}
								load={(query) =>
									getProgramTableViewAction({
										...query,
										organizationId,
										programPermission: ProgramPermission.owner,
									})
								}
								getRowHref={(row) => `/portal/programs/${row.id}/overview`}
							/>
						),
					},
					{
						value: 'operated-programs',
						label: 'Operated programs',
						content: (
							<RecordTableTab
								config={organizationOperatedProgramsTableConfig}
								load={(query) =>
									getProgramTableViewAction({
										...query,
										organizationId,
										programPermission: ProgramPermission.operator,
									})
								}
								getRowHref={(row) => `/portal/programs/${row.id}/overview`}
							/>
						),
					},
					{
						value: 'expenses',
						label: 'Expenses',
						content: (
							<RecordTableTab
								config={organizationExpensesTableConfig}
								load={(query) => getExpenseTableViewAction({ ...query, organizationId })}
								getRowHref={(row) => `/portal/admin/expenses?${new URLSearchParams({ organizationId, expenseId: row.id })}`}
							/>
						),
					},
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add organization</DialogTitle>
				</DialogHeader>
				{form}
			</DialogContent>
		</Dialog>
	);
};
