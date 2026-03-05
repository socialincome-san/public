export const toSortKey = <TKeys extends readonly string[]>(
	value: string | undefined,
	allowedKeys: TKeys,
): TKeys[number] | undefined => {
	if (!value) {
		return undefined;
	}

	return allowedKeys.find((key) => key === value) as TKeys[number] | undefined;
};
