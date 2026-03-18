'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { organizationMembersTableConfig } from '@/components/data-table/configs/organization-members-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { renameActiveOrganizationAction } from '@/lib/server-actions/organization-action';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import type { OrganizationMemberTableViewRow } from '@/lib/services/organization/organization.types';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type MembersTableProps = {
	rows: OrganizationMemberTableViewRow[];
	error: string | null;
	organizationName: string;
	query?: TableQueryState & { totalRows: number };
};

const renameOrganizationSchema = z.object({
	name: z.string().trim().min(1, 'Organization name is required.'),
});

type RenameOrganizationFormValues = z.infer<typeof renameOrganizationSchema>;

export default function MembersTable({ rows, error, organizationName, query }: MembersTableProps) {
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const form = useForm<RenameOrganizationFormValues>({
		resolver: zodResolver(renameOrganizationSchema),
		defaultValues: {
			name: organizationName,
		},
	});

	const actionMenuItems = [
		{
			label: 'Rename organization',
			icon: <PencilIcon className="size-4" />,
			onSelect: () => {
				setErrorMessage(null);
				form.reset({ name: organizationName });
				setIsRenameDialogOpen(true);
			},
		},
	];

	const onSubmit = ({ name }: RenameOrganizationFormValues) => {
		startTransition(async () => {
			const result = await renameActiveOrganizationAction({ name });
			handleServiceResult(result, {
				onSuccess: () => {
					setIsRenameDialogOpen(false);
					setErrorMessage(null);
				},
				onError: (renameError) => {
					setErrorMessage(`Error renaming organization: ${retrieveErrorMessage(renameError)}`);
					logger.error('Rename Organization Error', { error: renameError });
				},
			});
		});
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={{ ...organizationMembersTableConfig, title: `Members of ${organizationName}` }}
				titleInfoTooltip="Shows members of your active organization."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={actionMenuItems}
			/>

			<Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Rename organization</DialogTitle>
					</DialogHeader>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Organization name</FormLabel>
										<FormControl>
											<Input {...field} disabled={isPending} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={() => setIsRenameDialogOpen(false)} disabled={isPending}>
									Cancel
								</Button>
								<Button type="submit" disabled={isPending}>
									Save
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
}
