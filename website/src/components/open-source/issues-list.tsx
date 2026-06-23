'use client';

import { Button } from '@/components/button';
import { IssueRow } from '@/components/open-source/issue-row';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import type { GithubIssue } from '@/lib/services/github-api/github-api.types';
import { useState } from 'react';

const INITIAL_VISIBLE_COUNT = 6;
const ALL_FILTER_VALUE = '__all__';

type Props = {
	title: string;
	issues: GithubIssue[];
	labels: string[];
	tableHeaderLabel: string;
	issueLinkLabel: string;
	filterAllLabel: string;
	showAllLabel: string;
	emptyLabel: string;
};

export const IssuesList = ({
	title,
	issues,
	labels,
	tableHeaderLabel,
	issueLinkLabel,
	filterAllLabel,
	showAllLabel,
	emptyLabel,
}: Props) => {
	const [filteredLabel, setFilteredLabel] = useState(ALL_FILTER_VALUE);
	const [showAll, setShowAll] = useState(false);

	const filteredIssues =
		filteredLabel === ALL_FILTER_VALUE ? issues : issues.filter((issue) => issue.labels.includes(filteredLabel));
	const displayedIssues = showAll ? filteredIssues : filteredIssues.slice(0, INITIAL_VISIBLE_COUNT);

	const handleFilterChange = (label: string) => {
		if (label === ALL_FILTER_VALUE) {
			setFilteredLabel(ALL_FILTER_VALUE);
			setShowAll(true);

			return;
		}

		setFilteredLabel(label);
		setShowAll(false);
	};

	return (
		<section>
			<h2 className="mb-6 text-2xl font-semibold">{title}</h2>

			{issues.length > 0 ? (
				<div className="mb-6 max-w-44">
					<Select value={filteredLabel} onValueChange={handleFilterChange}>
						<SelectTrigger aria-label="Filter issues by label">
							<SelectValue placeholder={filterAllLabel} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ALL_FILTER_VALUE}>{filterAllLabel}</SelectItem>
							{labels.map((label) => (
								<SelectItem key={label} value={label}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			) : null}

			<div className="border-border overflow-hidden rounded-md border">
				<div className="border-border bg-muted/50 hidden border-b px-4 py-3 text-sm font-medium md:grid md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
					<div>{tableHeaderLabel}</div>
				</div>
				{displayedIssues.length > 0 ? (
					<div className="divide-border divide-y">
						{displayedIssues.map((issue) => (
							<IssueRow key={issue.id} title={issue.title} url={issue.url} issueLinkLabel={issueLinkLabel} />
						))}
					</div>
				) : (
					<p className="text-muted-foreground px-4 py-6 text-sm">{emptyLabel}</p>
				)}
			</div>

			{!showAll && filteredIssues.length > INITIAL_VISIBLE_COUNT ? (
				<div className="mt-6 flex justify-center">
					<Button variant="link" onClick={() => setShowAll(true)}>
						{showAllLabel.replace('{count}', String(filteredIssues.length))}
					</Button>
				</div>
			) : null}
		</section>
	);
};
