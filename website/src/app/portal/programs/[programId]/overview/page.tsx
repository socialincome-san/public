import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { SuccessBanner } from '@/components/success-banner';
import { ProgramService } from '@/lib/services/program/program.service';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { slugify } from '@/lib/utils/slugify';
import { ChevronRightIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

type Props = { params: Promise<{ programId: string }> };

export default function OverviewPageProgramScoped({ params }: Props) {
	return (
		<Suspense>
			<OverviewProgramScopedDataLoader params={params} />
		</Suspense>
	);
}

async function OverviewProgramScopedDataLoader({ params }: { params: Promise<{ programId: string }> }) {
	const { programId } = await params;

	const programService = new ProgramService();
	const programNameResult = await programService.getProgramNameById(programId);

	if (!programNameResult.success || !programNameResult.data) {
		return <div className="p-4">Error loading the program overview</div>;
	}

	const programSlug = slugify(programNameResult.data);
	const publicUrl = `/${NEW_WEBSITE_SLUG}/programs/${programSlug}`;

	return (
		<div className="grid grid-cols-12 gap-6">
			<Card className="col-span-9">
				<div className="space-y-8">
					<div className="space-y-2">
						<h1 className="text-2xl font-semibold">Great! You initiated a new program</h1>
						<p className="text-muted-foreground">
							The program is now initiated, and only a few steps remain before recipients receive their first cash
							transfer.
						</p>
					</div>

					<div className="space-y-6">
						<SuccessBanner
							title="Recipient selection complete"
							description="We identified and selected all recipients for this program. You can now proceed to fund the program and start payouts."
							action={
								<Link href={`/portal/programs/${programId}/recipients`}>
									<Button variant="outline">
										View Recipient List <ChevronRightIcon className="ml-2 h-4 w-4" />
									</Button>
								</Link>
							}
						/>

						<SuccessBanner
							title="Impact surveys configured"
							description="We added a set of surveys to measure changes in financial health of the recipients."
							action={
								<Link href={`/portal/programs/${programId}/surveys`}>
									<Button variant="outline">
										View Surveys List <ChevronRightIcon className="ml-2 h-4 w-4" />
									</Button>
								</Link>
							}
						/>

						<SuccessBanner
							title="Your public page is ready"
							description="Your page is fully set up and online. Add funds to switch the status to live."
							action={
								<Link href={publicUrl} target="_blank">
									<Button variant="outline">
										View Public Page <ExternalLinkIcon className="ml-2 h-4 w-4" />
									</Button>
								</Link>
							}
						/>
					</div>
				</div>
			</Card>

			<div className="col-span-3 space-y-3">
				<p className="text-xl font-medium">Your public page</p>

				<iframe
					className="border-background rounded-3xl border-8 shadow-lg"
					title="Program Overview"
					width="100%"
					height="400"
					src={publicUrl}
					frameBorder="0"
					allowFullScreen
				/>
			</div>
		</div>
	);
}
