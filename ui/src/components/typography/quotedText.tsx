import { Typography } from './typography';

export function QuotedText({ text, author, author_org }: { text: string; author: string; author_org: string }) {
	return (
		<div className="w-full py-16 px-0">
			<Typography className="m-0 p-0" weight="bold" color="foreground" size="5xl">
				« {text} »
			</Typography>
			<div className="mt-4">
				<Typography color="foreground" size="md" className="p-0 m-0">
					{author}
				</Typography>
				<Typography color="foreground" size="md" className="p-0 m-0">
					{author_org}
				</Typography>
			</div>
		</div>
	);
}
