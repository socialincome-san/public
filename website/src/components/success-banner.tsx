import { CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
	title: string;
	description?: string;
	action?: ReactNode;
};

export const SuccessBanner = ({ title, description, action }: Props) => {
	return (
		<div className="bg-confirm-foreground border-confirm/20 flex items-center justify-between rounded-xl border px-6 py-4">
			<div className="flex items-start gap-3">
				<CheckCircle className="text-confirm mt-1 h-5 w-5" />

				<div>
					<p className="text-confirm font-bold">{title}</p>

					{description && <p className="text-confirm/80 text-sm">{description}</p>}
				</div>
			</div>

			{action && <div>{action}</div>}
		</div>
	);
};
