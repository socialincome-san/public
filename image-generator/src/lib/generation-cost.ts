export const getGenerationCost = (calls: { providerMetadata?: unknown }[]): number | null => {
	let total = 0;
	if (calls.length === 0) return null;
	for (const call of calls) {
		const metadata = call.providerMetadata;
		if (typeof metadata !== 'object' || metadata === null || !('gateway' in metadata)) return null;
		const gateway = metadata.gateway;
		if (typeof gateway !== 'object' || gateway === null || !('cost' in gateway)) return null;
		const value = gateway.cost;
		if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim()))
			return null;
		const cost = Number(value);
		if (!Number.isFinite(cost) || cost < 0) return null;
		total += cost;
	}
	return Number.isFinite(total) ? total : null;
};
