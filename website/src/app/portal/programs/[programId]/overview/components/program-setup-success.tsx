import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { SuccessBanner } from '@/components/success-banner';
import { ChevronRightIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

type ProgramSetupSuccessProps = {
	programId: string;
	publicUrl: string;
};

export const ProgramSetupSuccess = ({ programId, publicUrl }: ProgramSetupSuccessProps) => {
	return (
		<Card>
			<div className="space-y-6">
				<h1 className="text-2xl font-semibold">Great! You initiated a new program</h1>

				<SuccessBanner
					title="Recipient selection complete"
					description="Recipients were successfully assigned."
					action={
						<Link href={`/portal/programs/${programId}/recipients`}>
							<Button variant="outline">
								View Recipients <ChevronRightIcon className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					}
				/>

				<SuccessBanner
					title="Impact surveys configured"
					description="Survey tracking is active."
					action={
						<Link href={`/portal/programs/${programId}/surveys`}>
							<Button variant="outline">
								View Surveys <ChevronRightIcon className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					}
				/>

				<SuccessBanner
					title="Public page ready"
					description="This is your public program page."
					action={
						<Link href={publicUrl} target="_blank">
							<Button variant="outline">
								View Public Page <ExternalLinkIcon className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					}
				/>
			</div>
		</Card>
	);
};
