export const now = (): Date => {
	if (process.env.NEXT_PUBLIC_FIXED_TIME) {
		return new Date(process.env.NEXT_PUBLIC_FIXED_TIME);
	}
	return new Date();
};

export const nowMs = (): number => {
	return now().getTime();
};
