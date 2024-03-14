'use client';

import { UserContext } from '@/app/[lang]/[region]/(website)/me/user-context-provider';
import { EMPLOYERS_FIRESTORE_PATH, Employer } from '@socialincome/shared/src/types/employers';

import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { Table, TableBody, TableCell, TableRow, Typography } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useContext } from 'react';
import { useFirestore } from 'reactfire';
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

type EmployerWithId = {
	id: string;
} & Employer;

export function EmployersList({ translations }: EmployersListProps) {
	const firestore = useFirestore();
	const { user } = useContext(UserContext);
	const { isLoading, data, refetch } = useQuery({
		queryKey: ['employersList'],
		queryFn: async () => {
			if (user && firestore) {
				return await getDocs(
					query(
						collection(firestore, USER_FIRESTORE_PATH, user.id, EMPLOYERS_FIRESTORE_PATH),
						orderBy('created', 'desc'),
					),
				);
			} else return null;
		},
		staleTime: 1000 * 60 * 60, // an hour
	});

	const onDeleteEmployer = async (employer_id: string) => {
		const employerRef = doc(firestore, USER_FIRESTORE_PATH, user!.id, EMPLOYERS_FIRESTORE_PATH, employer_id);
		await deleteDoc(employerRef).then(() => onEmployersUpdated());
	};

	const onArchiveEmployer = async (employer_id: string) => {
		// Not leveraging type system ....
		const employerRef = doc(firestore, USER_FIRESTORE_PATH, user!.id, EMPLOYERS_FIRESTORE_PATH, employer_id);
		await updateDoc(employerRef, { is_current: false }).then(() => onEmployersUpdated());
	};

	const onEmployersUpdated = async () => {
		await refetch();
	};

	if (isLoading) {
		return <span>Loading ...</span>;
	}

	const employers: EmployerWithId[] = data!.docs.map((e) => {
		const employer: Employer = e.data() as Employer;
		return { id: e.id, ...employer };
	});
	const currentEmployers: EmployerWithId[] = employers.filter((e) => e.is_current);
	const pastEmployers: EmployerWithId[] = employers.filter((e) => !e.is_current);

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
												<button onClick={() => onArchiveEmployer(employer.id)}>
													<Typography className="underline">{translations.employersList.noLongerWorkHere}</Typography>
												</button>
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

			<AddEmployerForm onNewEmployerSubmitted={onEmployersUpdated} translations={translations.addEmployerForm} />
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
													<button onClick={() => onDeleteEmployer(employer.id)}>
														<Typography className="underline">{translations.employersList.deleteEmployer}</Typography>
													</button>
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
