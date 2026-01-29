import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { ProgramService } from '@/lib/services/program/program.service';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default function ProgramsPage({ params }: DefaultLayoutPropsWithSlug) {
	return (
		<Suspense>
			<ProgramsPageDataLoader params={params} />
		</Suspense>
	);
}

async function ProgramsPageDataLoader({ params }: DefaultLayoutPropsWithSlug) {
	const { slug } = await params;

	const programService = new ProgramService();
	const publicProgramDetailsResult = await programService.getPublicProgramBySlug(slug);

	if (!publicProgramDetailsResult.success || !publicProgramDetailsResult.data) {
		return notFound();
	}

	const program = publicProgramDetailsResult.data;

	return (
		<div className="mx-auto max-w-2xl p-6">
			<h1 className="mb-6 text-2xl font-semibold tracking-tight">{program.programName}</h1>

			<ul className="divide-y rounded-lg border text-sm">
				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Country</span>
					<span className="font-medium">{program.countryIsoCode}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Owner organization</span>
					<span className="font-medium">{program.ownerOrganizationName ?? '—'}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Operator organization</span>
					<span className="font-medium">{program.operatorOrganizationName ?? '—'}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Program duration</span>
					<span className="font-medium">{program.programDurationInMonths} months</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Payout interval</span>
					<span className="font-medium">{program.payoutInterval}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Payout per interval</span>
					<span className="font-medium">
						{program.payoutPerInterval} {program.payoutCurrency}
					</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Initial recipients</span>
					<span className="font-medium">{program.amountOfRecipientsForStart ?? '—'}</span>
				</li>

				{program.targetCauses.length > 0 && (
					<li className="flex justify-between gap-4 p-3">
						<span className="text-muted-foreground">Target causes</span>
						<span className="text-right font-medium capitalize">
							{program.targetCauses.join(', ').replaceAll('_', ' ')}
						</span>
					</li>
				)}

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Recipients supported</span>
					<span className="font-semibold">{program.recipientsCount}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Payouts completed</span>
					<span className="font-semibold">{program.totalPayoutsCount}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Total paid out</span>
					<span className="font-semibold">
						{program.totalPayoutsSum} {program.payoutCurrency}
					</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Completed surveys</span>
					<span className="font-semibold">{program.completedSurveysCount}</span>
				</li>

				{program.startedAt && (
					<li className="flex justify-between gap-4 p-3">
						<span className="text-muted-foreground">Program started</span>
						<span className="font-medium">{new Date(program.startedAt).toLocaleDateString()}</span>
					</li>
				)}
			</ul>
		</div>
	);
}
