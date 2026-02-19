import { Progress } from '@/components/progress';

type StatProgressCardProps = {
	title: string;
	leftLabel: string;
	rightLabel: string;
	leftValue: string;
	rightValue: string;
	percent: number;
};

export function StatProgressCard({
	title,
	leftLabel,
	rightLabel,
	leftValue,
	rightValue,
	percent,
}: StatProgressCardProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">{title}</h2>

			<div className="text-muted-foreground flex justify-between text-xs">
				<span>{leftLabel}</span>
				<span>{rightLabel}</span>
			</div>

			<div className="flex justify-between text-xl font-semibold">
				<span>{leftValue}</span>
				<span>{rightValue}</span>
			</div>

			<Progress value={percent} />
		</div>
	);
}
