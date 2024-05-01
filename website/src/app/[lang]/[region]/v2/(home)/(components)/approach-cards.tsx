'use client';
import { Card, CardContent, CardHeader, Typography } from '@socialincome/ui';

type ApproachCardProps = {
	category: string;
	title: string;
	points: {
		text: string;
	}[];
};

export function ApproachCard({ category, title, points }: ApproachCardProps) {
	return (
		<Card className="bg-foreground-dark w-96 rounded-none">
			<CardHeader className="mb-1">
				<Typography size="md" className="opacity-40">
					{category}
				</Typography>
				<Typography size="md" weight="medium">
					{title}
				</Typography>
			</CardHeader>
			<CardContent className="mb-5 ml-4">
				<ul className="list-disc">
					{points.map((point, key) => {
						return (
							<li key={key}>
								<Typography>{point.text}</Typography>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}
