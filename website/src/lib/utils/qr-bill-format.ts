export const formatQrBillIban = (iban: string): string => iban.replace(/(.{4})/g, '$1 ').trim();

export const formatQrBillReference = (reference: string): string => {
	const compact = reference.replace(/\s/g, '');
	if (compact.length <= 2) {
		return compact;
	}

	const head = compact.slice(0, 2);
	const rest =
		compact
			.slice(2)
			.match(/.{1,5}/g)
			?.join(' ') ?? '';

	return `${head} ${rest}`;
};
