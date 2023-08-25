'use client';

import {useState } from 'react'; 
import { Combobox, Transition } from '@headlessui/react'; 
import _ from 'lodash';

import { useRouter } from 'next/navigation';


import { firestore } from '@/firebase/client';
import { addDoc, setDoc, collection } from 'firebase/firestore';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography, Button, Card }  from '@socialincome/ui';
import { Formik } from 'formik';
 
import { Company, CompanyRegister } from './types';
import {
	EmployerSubmission, SubmissionSource, SubmissionType } from '@socialincome/shared/src/types';


async function searchCompanies(searchTerm: string, registry: CompanyRegister) : Promise<Company[]> {
	return fetch("http://localhost:3001/api/companies/ch?" + new URLSearchParams({ searchTerm : searchTerm}))
		.then((response) => { if (!response.ok) { throw new Error("could not retrieve companies") } else { return response }} )
		.then((response) => response.json())
}

const NUMBER_OF_DISPLAYED_COMPANIES = 10;

function mergeCompanies(companies: Company[]) : Company[] {	
	return _.take(_.flatMap(_.groupBy(companies, (c) => c.uid), (companies) => companies[0]), NUMBER_OF_DISPLAYED_COMPANIES); 
}


export default function Page({ params, searchParams }: DefaultPageProps) {
	const router = useRouter();

	function computeInputDisplayValue(company: Company) {
		return company?.name
	}

	function onComboboxOptionSelected(value: Company) {
		setSelectedCompany(value)
	}

	async function onComboBoxInputChange(searchTerm: string) {
		try {
			const companies = await searchCompanies(searchTerm);
			const result = mergeCompanies(companies);
			setSelectedCompanies(result);

		} catch (error) {
			console.error(error);
		}
	}

	const onSubmit = async (e) => {
		e.preventDefault();
		const form = e.target;
		const formData = new FormData(form);

		// Save employee submission
		console.log(formData);
                const subm : EmployerSubmission = {
			contributor : "test contributor",
			submission_type: Date.now(),
			name: formData.get("employer[name]"), 
			submission_type : {
				type: SubmissionType.MANUAL, 
				source: SubmissionSource.ZEFIX, 
				matching_id: formData.get("employer[uid]")
			}
		};
	
		const ref = addDoc(collection(firestore,"employers-submission"), subm);
	//	await setDoc(ref, { test : "Test" }).then(() => console.log("saved"));	

		const success_url = `${window.location.origin}/${params.lang}/${params.country}/company-search/success`;
		router.push(success_url);

	}

	const debouncedOnComboBoxInputChange = _.debounce(onComboBoxInputChange, 100);

	const [selectedCompany, setSelectedCompany] = useState<Company | null >(null);
        const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);

	return (
		<BaseContainer className="bg-base-yellow min-h-screen">
				<form onSubmit={onSubmit}>
					<div className="grow flex flex-col p-8 h-80">
						<Typography className="text-center p-8" size="2xl">Who is your employer ?</Typography>
						<Combobox name="employer" value={selectedCompany} onChange={setSelectedCompany}>
							<Combobox.Input onChange={(event) => debouncedOnComboBoxInputChange(event.target.value)} displayValue={computeInputDisplayValue}></Combobox.Input>
							<Combobox.Options className="z-40 bg-white border border-slate-100 border-r border-l border-b py-2 px-4">
							{selectedCompanies.map((company) => (
								<Combobox.Option key={company.uid} value={company} className="p-1"><div>
									{company.name} <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">{company.uid}</span></div>
								</Combobox.Option>
							))}
							</Combobox.Options>
						</Combobox>
					</div>
					<div>
						<Typography className="text-center p-4" size="2xl">How Swiss Organisations support Social Income</Typography>
					</div>
					<div className="flex p-4 justify-center">
						<Card normal bordered className="border-neutral my-4 cursor-pointer lg:mx-4">
							<Card.Body>
								<Card.Title>
									<Typography size="2xl" weight="bold">
										UBS
									</Typography>
								</Card.Title>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
										<div className="flex flex-row items-start space-x-2">
									<Typography size="xl" lineHeight="relaxed">
										Donations: 1 Em / 1 Corp.	
									</Typography>
								</div>
							</div>
							</Card.Body>
					</Card>
					<Card normal bordered className="border-neutral my-4 cursor-pointer lg:mx-4">
						<Card.Body>
							<Card.Title>
								<Typography size="2xl" weight="bold">
									UBS	
								</Typography>
							</Card.Title>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
								<div className="flex flex-row items-start space-x-2">
									<Typography size="xl" lineHeight="relaxed">
										Donations: 1 Em / 1 Corp.	
									</Typography>
								</div>
							</div>
						</Card.Body>
					</Card>

				</div>
				<div className="text-center p-4 flex justify-center">
					<div class="p-4"><Button type="submit" color="primary">Save</Button></div>
					<div class="p-4"><Button variant="outline">Skip</Button></div>
				</div>
				</form>	
		</BaseContainer>
	);
}
