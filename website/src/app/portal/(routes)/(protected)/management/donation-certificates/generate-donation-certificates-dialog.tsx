'use client';

import { Button } from '@/app/portal/components/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { MultiSelect, MultiSelectOption } from '@/app/portal/components/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import { Switch } from '@/app/portal/components/switch';
import {
	generateDonationCertificates,
	getContributorOptions,
} from '@/app/portal/server-actions/donation-certificates-actions';
import _ from 'lodash';
import { useEffect, useState, useTransition } from 'react';

const CURRENT_YEAR = new Date().getFullYear();
export default function GenerateDonationCertificatesDialog({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const [options, setOptions] = useState<MultiSelectOption[]>([]);
	const [selectedContributors, setSelectedContributors] = useState<string[]>([]);
	const [year, setYear] = useState<number>(CURRENT_YEAR - 1);
	const [generateAll, setGenerateAll] = useState<boolean>(true);
	const [isLoading, startTransition] = useTransition();
	const [success, setSuccess] = useState<string | undefined>();
	const [error, setError] = useState<string | undefined>();

	const loadContributorsOption = async () => {
		const contributors = await getContributorOptions();
		if (contributors.success) {
			setOptions(
				contributors.data.map((c) => ({
					label: `${c.firstName} ${c.lastName}`,
					value: c.id,
				})),
			);
		}
	};

	const generateCertificates = () => {
		setSuccess(undefined);
		setError(undefined);
		startTransition(async () => {
			const result = await generateDonationCertificates(year, generateAll ? [] : selectedContributors);
			if (!result.success) setError(result.error);
			else setSuccess(result.data);
		});
	};

	useEffect(() => {
		loadContributorsOption();
	}, []);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Generate Donation Certificates</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="font-medium">Year</p>
						<p className="text-muted-foreground mb-1 text-xs">
							Specify for which year the certificate(s) should be generated:
						</p>
						<Select value={year.toString()} onValueChange={(e) => setYear(parseInt(e))}>
							<SelectTrigger>
								<SelectValue placeholder={'Select Year'} />
							</SelectTrigger>
							<SelectContent>
								{_.range(CURRENT_YEAR - 5, CURRENT_YEAR + 6).map((year) => (
									<SelectItem value={year.toString()} key={year}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2">
						<p className="font-medium">Contributors</p>
						<p className="text-muted-foreground mb-1 text-xs">
							Select Contributors certificates should be generated for
						</p>
						<MultiSelect
							disabled={generateAll}
							modalPopover
							hideSelectAll
							variant={'default'}
							options={options}
							onValueChange={setSelectedContributors}
							placeholder="Select contributors"
						/>
						<div className="flex flex-row gap-4">
							<Switch onCheckedChange={setGenerateAll} checked={generateAll} />
							<p className="text-muted-foreground mb-1 text-sm">Create certificate for all contributor in CH</p>
						</div>
					</div>
					<Button
						disabled={isLoading}
						className="flex w-full items-center justify-center gap-2"
						onClick={() => generateCertificates()}
					>
						{isLoading ? 'Generating...' : 'Generate Certificates'}
					</Button>
					{(success || error) && (
						<div className="bg-muted border-border max-w-[540px] rounded-lg border p-2 text-xs">
							{success && <p className="text-sm text-green-700">{success}</p>}
							{error && <p className="text-sm text-red-700">{error}</p>}
						</div>
					)}
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={() => setOpen(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
