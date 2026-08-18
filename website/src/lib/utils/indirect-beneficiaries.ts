export const INDIRECT_BENEFICIARY_FACTOR = 6;

export const getIndirectBeneficiaryCount = (directCount: number): number =>
	directCount * INDIRECT_BENEFICIARY_FACTOR;
