import { ProgramPermission } from '@/generated/prisma/enums';
import { canListCampaigns, canReadEditableCampaigns } from './campaign.permissions';

const operatorAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.operator }];
const ownerAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.owner }];

describe('campaign permissions', () => {
	test('allows operators to list campaigns', () => {
		expect(canListCampaigns(operatorAccess)).toBe(true);
		expect(canListCampaigns(ownerAccess)).toBe(false);
		expect(canListCampaigns([])).toBe(false);
	});

	test('treats editable campaign access the same as list access', () => {
		expect(canReadEditableCampaigns(operatorAccess)).toBe(true);
		expect(canReadEditableCampaigns(ownerAccess)).toBe(false);
	});
});
