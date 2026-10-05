import { getIndirectBeneficiaryCount, INDIRECT_BENEFICIARY_FACTOR } from './indirect-beneficiaries';

describe('getIndirectBeneficiaryCount', () => {
	test('multiplies direct recipients by the indirect factor', () => {
		expect(INDIRECT_BENEFICIARY_FACTOR).toBe(6);
		expect(getIndirectBeneficiaryCount(1)).toBe(INDIRECT_BENEFICIARY_FACTOR);
		expect(getIndirectBeneficiaryCount(2)).toBe(2 * INDIRECT_BENEFICIARY_FACTOR);
		expect(getIndirectBeneficiaryCount(0)).toBe(0);
	});
});
