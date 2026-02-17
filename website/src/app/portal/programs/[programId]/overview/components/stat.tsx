type StatProps = { label: string; value: string | number };

export function Stat({ label, value }: StatProps) {
	return (
		<div>
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="font-medium">{value}</p>
		</div>
	);
}
