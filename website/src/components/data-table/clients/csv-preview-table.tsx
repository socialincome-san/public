type Props = {
	rows: Record<string, string>[];
};

export function CsvPreviewTable({ rows }: Props) {
	if (rows.length === 0) {
		return null;
	}

	const headers = Object.keys(rows[0]);

	return (
		<div className="max-h-64 overflow-auto rounded-md border">
			<table className="w-full text-sm">
				<thead className="bg-background sticky top-0">
					<tr>
						{headers.map((h) => (
							<th key={h} className="border-b px-3 py-2 text-left font-medium">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr key={i} className="border-b last:border-b-0">
							{headers.map((h) => (
								<td key={h} className="px-3 py-2">
									{row[h]}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
