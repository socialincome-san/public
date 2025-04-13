import { Typography } from './typography';

export function QuotedText({ text, author, authorTitle }: { text: string; author: string; authorTitle?: string }) {
	return (
		<div className="w-full px-0 py-16">
			<Typography className="m-0 p-0" weight="bold" color="foreground" size="5xl">
				« {text} »
			</Typography>
			<div className="mt-4">
				<Typography color="foreground" size="md" className="m-0 p-0">
					{author}
				</Typography>
				{authorTitle && (
					<Typography color="foreground" size="md" className="m-0 p-0">
						{authorTitle}
					</Typography>
				)}
			</div>
		</div>
	);
}
