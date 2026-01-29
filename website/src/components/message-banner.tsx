import { cn } from '@/lib/utils/cn';
import { CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

type Variant = 'success';

type Props = {
	variant?: Variant;
	title: string;
	description?: string;
	action?: ReactNode;
};

export function MessageBanner({ variant = 'success', title, description, action }: Props) {
	const styles = {
		success: {
			container: 'border bg-green-50',
			icon: 'text-green-600',
			title: 'text-green-900',
			description: 'text-green-900/80',
			Icon: CheckCircle,
		},
	}[variant];

	const Icon = styles.Icon;

	return (
		<div className={cn('flex items-center justify-between rounded-xl px-6 py-4', styles.container)}>
			<div className="flex items-start gap-3">
				<Icon className={cn('mt-1 h-5 w-5', styles.icon)} />

				<div>
					<p className={cn('font-semibold', styles.title)}>{title}</p>

					{description && <p className={cn('text-sm', styles.description)}>{description}</p>}
				</div>
			</div>

			{action && <div>{action}</div>}
		</div>
	);
}
