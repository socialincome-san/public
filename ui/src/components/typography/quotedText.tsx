import { Typography } from './typography';

export function QuotedText({ text, author }: { text: string; author: string }) {
	return (
		<div className="w-full p-2">
			<Typography className="m-0 p-0" weight="bold" color="foreground" size="3xl">
				« {text} »
			</Typography>
			<Typography color="foreground" size="xs" className="mt-1 p-0">
				{author}
			</Typography>
		</div>
	);
}
