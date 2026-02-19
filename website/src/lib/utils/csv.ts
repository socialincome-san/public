export type CsvRow = Record<string, string>;

export const parseCsvText = (text: string): CsvRow[] => {
	const lines = text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length < 2) {
		throw new Error('CSV must contain a header row and at least one data row.');
	}

	const [headerLine, ...dataLines] = lines;
	const headers = headerLine.split(',').map((h) => h.trim());

	if (headers.length === 0) {
		throw new Error('CSV header is empty.');
	}

	return dataLines.map((line, index) => {
		const values = line.split(',');

		if (values.length !== headers.length) {
			throw new Error(`Row ${index + 2} has an invalid number of columns.`);
		}

		return Object.fromEntries(headers.map((header, i) => [header, values[i]?.trim() ?? '']));
	});
};

export const parseCsvFile = async (file: File): Promise<CsvRow[]> => {
	const text = await file.text();
	return parseCsvText(text);
};
