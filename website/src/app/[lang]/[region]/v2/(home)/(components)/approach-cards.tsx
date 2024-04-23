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
		<Card className="bg-primary w-96">
			<CardHeader className="mb-1">
				<Typography size="md" color="card" className="opacity-40">
					{category}
				</Typography>
				<Typography size="md" weight="medium" color="card">
					{title}
				</Typography>
			</CardHeader>
			<CardContent className="mb-5 ml-4">
				<ul className="list-disc text-white">
					{points.map((point, key) => {
						return (
							<li key={key}>
								<Typography color="card">{point.text}</Typography>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}
