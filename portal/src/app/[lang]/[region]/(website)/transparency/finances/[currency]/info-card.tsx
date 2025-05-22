import { Card, CardContent, Typography } from '@socialincome/ui';
import _ from 'lodash';
import { ReactElement } from 'react';

type TransparencyCardProps = {
	sectionTitle: string;
	title: string;
	text: string;
	firstIcon?: ReactElement;
	firstContent?: ReactElement;
	secondIcon?: ReactElement;
	secondContent?: ReactElement;
};

export function InfoCard({
	sectionTitle,
	title,
	text,
	firstIcon,
	firstContent,
	secondIcon,
	secondContent,
}: TransparencyCardProps) {
	return (
		<Card>
			<CardContent className="grid grid-cols-1 items-center divide-y py-8 md:grid-cols-2 md:divide-x md:divide-y-0">
				<div className="space-y-2 py-8 md:px-8">
					<Typography size="2xl">{sectionTitle}</Typography>
					<Typography size="3xl" weight="bold">
						{title}
					</Typography>
					<Typography size="2xl">{text}</Typography>
				</div>
				<div className="flex flex-col space-y-8 py-8 md:px-8">
					{!_.isNil(firstIcon) && !_.isNil(firstContent) && (
						<div className="grid grid-cols-9">
							<div>{firstIcon}</div>
							<div className="col-span-8">{firstContent}</div>
						</div>
					)}
					{!_.isNil(secondIcon) && !_.isNil(secondContent) && (
						<div className="grid grid-cols-9">
							<div>{secondIcon}</div>
							<div className="col-span-8">{secondContent}</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
