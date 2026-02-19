'use client';

import { Button, Table, TableBody, TableCell, TableHeader, TableRow, Typography } from '@socialincome/ui';
import { useState } from 'react';
import { FilterForm } from './filterForm';
import { Issue } from './issue';

interface Issue {
	id: number;
	title: string;
	url: string;
	labels: string[];
}

interface IssueClientProps {
	title: string;
	issues: Issue[];
	labels: string[];
	tableHeader: string;
	linkText: string;
	filterText: string;
}

export const IssueClient = ({ title, issues, labels, tableHeader, filterText, linkText }: IssueClientProps) => {
	const [filteredLabel, setFilteredLabel] = useState('');
	const [showAllIssues, setShowAllIssues] = useState(false);

	// Filter issues based on the selected label
	const filteredIssues = filteredLabel ? issues.filter((issue) => issue.labels.includes(filteredLabel)) : issues;

	// Determine issues to display based on "show all" state
	const displayedIssues = showAllIssues ? filteredIssues : filteredIssues.slice(0, 6);

	const handleFilterChange = (label: string) => {
		if (label === filterText) {
			// Show all issues when filterText is selected
			setFilteredLabel('');
			setShowAllIssues(true);
		} else {
			setFilteredLabel(label);
			setShowAllIssues(false);
		}
	};

	return (
		<section>
			<Typography as="h2" size="3xl" lineHeight="snug" className="mb-10">
				{title}
			</Typography>
			<FilterForm labels={labels} handleLabel={handleFilterChange} filterText={filterText} />
			<div className="border-foreground rounded-md">
				<Table>
					<TableHeader>
						<TableRow className="border-foreground p-5 hover:bg-transparent">
							<TableCell className="text-xl">{tableHeader}</TableCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{displayedIssues.map((issue) => (
							<Issue key={issue.id} title={issue.title} url={issue.url} text={linkText} />
						))}
					</TableBody>
				</Table>
			</div>
			{!showAllIssues && filteredIssues.length > 6 && (
				<div className="mt-6 flex justify-center">
					<Button
						variant="link"
						onClick={() => setShowAllIssues(true)}
						className="text-card-foreground mr-20 text-xl"
					>{`Show all ${filteredIssues.length} issues`}</Button>
				</div>
			)}
		</section>
	);
}
