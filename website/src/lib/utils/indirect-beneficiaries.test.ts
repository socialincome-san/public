import { getIndirectBeneficiaryCount, INDIRECT_BENEFICIARY_FACTOR } from './indirect-beneficiaries';

describe('getIndirectBeneficiaryCount', () => {
	test('multiplies direct recipients by six', () => {
		expect(INDIRECT_BENEFICIARY_FACTOR).toBe(6);
		expect(getIndirectBeneficiaryCount(1)).toBe(6);
		expect(getIndirectBeneficiaryCount(2)).toBe(12);
		expect(getIndirectBeneficiaryCount(0)).toBe(0);
	});
});
