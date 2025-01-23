'use client';

import {
	EmployerWithId,
	useArchiveEmployer,
	useDeleteEmployer,
	useEmployers,
} from '@/app/[lang]/[region]/(website)/me/hooks';
import { Button, Table, TableBody, TableCell, TableRow, Typography, SpinnerIcon } from '@socialincome/ui';
import { DefaultParams } from '../../..';
import { AddEmployerForm, AddEmployerFormProps } from './add-employer-form';

type EmployersListProps = {
	translations: {
		employersList: {
			emptyState: string;
			deleteEmployer: string;
			noLongerWorkHere: string;
			pastEmployers: string;
		};
		addEmployerForm: AddEmployerFormProps['translations'];
	};
} & DefaultParams;

export function EmployersList({ translations }: EmployersListProps) {
	const { employers, isLoading } = useEmployers();
	const archiveEmployer = useArchiveEmployer();
	const deleteEmployer = useDeleteEmployer();

	if (isLoading) {
		return <SpinnerIcon />;
	}

	const currentEmployers: EmployerWithId[] = employers?.filter((e) => e.is_current) || [];
	const pastEmployers: EmployerWithId[] = employers?.filter((e) => !e.is_current) || [];

	return (
		<>
			{currentEmployers.length > 0 ? (
				<Table>
					<TableBody>
						{currentEmployers.map((employer, index) => {
							return (
								<TableRow key={index}>
									<TableCell>
										<div className="flex flex-row">
											<Typography size="lg" weight="medium" className="grow">
												{employer.employer_name}
											</Typography>
											<div className="flex flex-col">
												<Button variant="link" onClick={() => archiveEmployer(employer.id)}>
													{translations.employersList.noLongerWorkHere}
												</Button>
											</div>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			) : (
				<Typography>{translations.employersList.emptyState}</Typography>
			)}

			<AddEmployerForm translations={translations.addEmployerForm} />
			{pastEmployers.length > 0 && (
				<>
					<Typography size="2xl" weight="medium" className="-mt-10 mb-4 md:mt-0">
						{translations.employersList.pastEmployers}
					</Typography>
					<Table>
						<TableBody>
							{pastEmployers.map((employer, index) => {
								return (
									<TableRow key={index}>
										<TableCell>
											<div className="flex flex-row">
												<Typography size="lg" weight="medium" className="grow">
													{employer.employer_name}
												</Typography>
												<div className="flex flex-col">
													<Button variant="link" onClick={() => deleteEmployer(employer.id)}>
														{translations.employersList.deleteEmployer}
													</Button>
												</div>
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</>
			)}
		</>
	);
}
