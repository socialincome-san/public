'use client';
import { Combobox } from '@headlessui/react';
import _ from 'lodash';
import { useState } from 'react';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Button, Card, Typography } from '@socialincome/ui';

import { ZefixCompanyRegistry } from './companies_registers/ZefixCompanyRegistry';
import { Company, CompanyRegistry } from './types';

let companyRegister: CompanyRegistry = new ZefixCompanyRegistry(); // = getCompanyRegistry( { params }: DefaultPageProps );

// async function searchCompanies(searchTerm: string) : Promise<Company[]> {
// 	return fetch("http://localhost:3001/api/companies/ch?" + new URLSearchParams({ searchTerm : searchTerm}))
// 		.then((response) => { if (!response.ok) { throw new Error("could not retrieve companies") } else { return response }} )
// 		.then((response) => response.json())
// }

const NUMBER_OF_DISPLAYED_COMPANIES = 10;

function mergeCompanies(companies: Company[]): Company[] {
	return _.take(
		_.flatMap(
			_.groupBy(companies, (c) => c.uid),
			(companies) => companies[0],
		),
		NUMBER_OF_DISPLAYED_COMPANIES,
	);
}

export default function Page(props: DefaultPageProps) {
	function computeInputDisplayValue(company: Company) {
		return company?.name;
	}

	function onComboboxOptionSelected(value: Company) {
		setSelectedCompany(value);
	}

	async function onComboBoxInputChange(searchTerm: string) {
		try {
			const companies = await companyRegister.searchCompanies(searchTerm); //
			const result = mergeCompanies(companies);
			setSelectedCompanies(result);
		} catch (error) {
			console.error(error);
		}
	}

	const debouncedOnComboBoxInputChange = _.debounce(onComboBoxInputChange, 100);

	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
	const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);

	return (
		<BaseContainer className="bg-base-yellow min-h-screen">
			<div className="flex h-80 grow flex-col p-8">
				<Typography className="p-8 text-center" size="2xl">
					Who is your employer ?
				</Typography>
				<Combobox value={selectedCompany} onChange={setSelectedCompany}>
					<Combobox.Input
						onChange={(event) => debouncedOnComboBoxInputChange(event.target.value)}
						displayValue={computeInputDisplayValue}
					></Combobox.Input>
					<Combobox.Options className="z-40 border border-b border-l border-r border-slate-100 bg-white px-4 py-2">
						{selectedCompanies.map((company) => (
							<Combobox.Option key={company.uid} value={company} className="p-1">
								<div>
									{company.name}{' '}
									<span className="mr-2 rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
										{company.uid}
									</span>
								</div>
							</Combobox.Option>
						))}
					</Combobox.Options>
				</Combobox>
			</div>
			<div>
				<Typography className="p-4 text-center" size="2xl">
					How Swiss Organisations support Social Income
				</Typography>
			</div>
			<div className="flex justify-center p-4">
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
			<div className="flex justify-center p-4 text-center">
				<div className="p-4">
					<Button color="primary">Save</Button>
				</div>
				<div className="p-4">
					<Button variant="outline">Skip</Button>
				</div>
			</div>
		</BaseContainer>
	);
}
