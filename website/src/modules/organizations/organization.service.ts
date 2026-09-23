import { ProgramPermission } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getProgramReferenceOptions, validateProgramIds } from '@/modules/programs/program-reference.service';
import { getUserRole, isAdmin } from '@/modules/users/user.service';
import { canRenameOrganization } from './organization.permissions';
import * as organizationRepository from './organization.repository';
import type { CreateOrganizationInput, RenameOrganizationInput, UpdateOrganizationInput } from './organization.schemas';
import type {
	ActiveOrganizationSummary,
	OrganizationMemberPaginatedTableView,
	OrganizationMemberTableQuery,
	OrganizationMemberTableViewRow,
	OrganizationOption,
	OrganizationPaginatedTableView,
	OrganizationPayload,
	OrganizationTableQuery,
	OrganizationTableViewRow,
} from './organization.types';

export const getActiveOrganizationSummary = async (userId: string): Promise<ServiceResult<ActiveOrganizationSummary>> => {
	try {
		const organizationIdResult = await getActiveOrganizationId(userId);
		if (!organizationIdResult.success) {
			return organizationIdResult;
		}

		const organization = await organizationRepository.findOrganizationSummary(organizationIdResult.data);
		if (!organization) {
			return resultFail('Organization not found');
		}

		return resultOk(organization);
	} catch (error) {
		console.error('Could not fetch active organization summary', { userId, error });

		return resultFail('Could not fetch active organization summary');
	}
};

export const getPaginatedOrganizationMembersTableView = async (
	userId: string,
	query: OrganizationMemberTableQuery,
): Promise<ServiceResult<OrganizationMemberPaginatedTableView>> => {
	try {
		const organizationIdResult = await getActiveOrganizationId(userId);
		if (!organizationIdResult.success) {
			return organizationIdResult;
		}

		const { members, totalCount } = await organizationRepository.findPaginatedOrganizationMembers(
			organizationIdResult.data,
			query,
		);
		const tableRows: OrganizationMemberTableViewRow[] = members.map((member) => ({
			id: member.user.id,
			firstName: member.user.contact?.firstName ?? '',
			lastName: member.user.contact?.lastName ?? '',
			email: member.user.contact?.email ?? '',
			role: member.user.role ?? null,
		}));

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch organization members', { userId, error });

		return resultFail('Could not fetch organization members');
	}
};

export const getPaginatedOrganizationAdminTableView = async (
	userId: string,
	query: OrganizationTableQuery,
): Promise<ServiceResult<OrganizationPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { organizations, totalCount } = await organizationRepository.findPaginatedOrganizations(query);
		const tableRows: OrganizationTableViewRow[] = organizations.map((organization) => ({
			id: organization.id,
			name: organization.name,
			ownedProgramsCount: organization.programAccesses.filter((access) => access.permission === ProgramPermission.owner)
				.length,
			operatedProgramsCount: organization.programAccesses.filter(
				(access) => access.permission === ProgramPermission.operator,
			).length,
			usersCount: organization.organizationAccesses.length,
			createdAt: organization.createdAt,
		}));

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch organizations', { userId, error });

		return resultFail('Could not fetch organizations');
	}
};

export const getOrganizationOptions = async (userId: string): Promise<ServiceResult<OrganizationOption[]>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		return resultOk(await organizationRepository.findOrganizationOptions());
	} catch (error) {
		console.error('Could not fetch organization options', { userId, error });

		return resultFail('Could not fetch organizations');
	}
};

export const getOrganizationReferenceOptions = async (): Promise<ServiceResult<OrganizationOption[]>> => {
	try {
		return resultOk(await organizationRepository.findOrganizationOptions());
	} catch (error) {
		console.error('Could not fetch organization reference options', { error });

		return resultFail('Could not fetch organizations');
	}
};

export const getOperatorFallbackOrganizationId = async (): Promise<ServiceResult<string>> => {
	try {
		const organization = await organizationRepository.findOperatorFallbackOrganization();

		return organization ? resultOk(organization.id) : resultFail('Operator fallback organization not found');
	} catch (error) {
		console.error('Could not fetch operator fallback organization', { error });

		return resultFail('Could not fetch operator fallback organization');
	}
};

export const validateOrganizationIds = async (organizationIds: string[]): Promise<ServiceResult<boolean>> => {
	try {
		const uniqueIds = [...new Set(organizationIds)];
		const organizations = await organizationRepository.findOrganizationsByIds(uniqueIds);

		return resultOk(organizations.length === uniqueIds.length);
	} catch (error) {
		console.error('Could not validate organizations', { error });

		return resultFail('Could not validate organizations');
	}
};

export const getOrganization = async (
	userId: string,
	organizationId: string,
): Promise<ServiceResult<OrganizationPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const organization = await organizationRepository.findOrganizationById(organizationId);
		if (!organization) {
			return resultFail('Organization not found');
		}

		return resultOk({
			id: organization.id,
			name: organization.name,
			userIds: organization.organizationAccesses.map((access) => access.userId),
			ownedProgramIds: organization.programAccesses
				.filter((access) => access.permission === ProgramPermission.owner)
				.map((access) => access.programId),
			operatedProgramIds: organization.programAccesses
				.filter((access) => access.permission === ProgramPermission.operator)
				.map((access) => access.programId),
		});
	} catch (error) {
		console.error('Could not fetch organization', { userId, organizationId, error });

		return resultFail('Could not fetch organization');
	}
};

export const getOrganizationUserOptions = async (userId: string): Promise<ServiceResult<{ id: string; name: string }[]>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const users = await organizationRepository.findOrganizationUserOptions();

		return resultOk(
			users.map((user) => ({
				id: user.id,
				name: `${user.contact.firstName} ${user.contact.lastName}`.trim(),
			})),
		);
	} catch (error) {
		console.error('Could not fetch organization users', { userId, error });

		return resultFail('Could not fetch organization users');
	}
};

export const getOrganizationProgramOptions = async (
	userId: string,
): Promise<ServiceResult<{ id: string; name: string }[]>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const programsResult = await getProgramReferenceOptions();
		if (!programsResult.success) {
			return resultFail(programsResult.error);
		}

		return resultOk(programsResult.data);
	} catch (error) {
		console.error('Could not fetch organization programs', { userId, error });

		return resultFail('Could not fetch organization programs');
	}
};

export const createOrganizationFromEmail = async (email: string): Promise<ServiceResult<OrganizationPayload>> => {
	try {
		const organization = await organizationRepository.createOrganizationFromEmail(email);

		return resultOk({
			id: organization.id,
			name: organization.name,
			userIds: [],
			ownedProgramIds: [],
			operatedProgramIds: [],
		});
	} catch (error) {
		console.error('Could not create organization from email', { email, error });

		return resultFail('Could not create organization');
	}
};

export const createOrganization = async (
	userId: string,
	input: CreateOrganizationInput,
): Promise<ServiceResult<OrganizationPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const validationResult = await validateOrganizationInput(input);
		if (!validationResult.success) {
			return validationResult;
		}

		const organization = await organizationRepository.createOrganization(input);

		return resultOk(toOrganizationPayload(organization, input));
	} catch (error) {
		console.error('Could not create organization', { userId, error });

		return resultFail('Could not create organization. Please try again later.');
	}
};

export const updateOrganization = async (
	userId: string,
	input: UpdateOrganizationInput,
): Promise<ServiceResult<OrganizationPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const existingOrganization = await organizationRepository.findOrganizationIdentity(input.id);
		if (!existingOrganization) {
			return resultFail('Organization not found');
		}

		const validationResult = await validateOrganizationInput(input, existingOrganization.id);
		if (!validationResult.success) {
			return validationResult;
		}

		const organization = await organizationRepository.updateOrganization(input);

		return resultOk(toOrganizationPayload(organization, input));
	} catch (error) {
		console.error('Could not update organization', { userId, organizationId: input.id, error });

		return resultFail('Could not update organization. Please try again later.');
	}
};

export const renameActiveOrganization = async (
	userId: string,
	input: RenameOrganizationInput,
): Promise<ServiceResult<{ id: string; name: string }>> => {
	try {
		const organizationIdResult = await getActiveOrganizationId(userId);
		if (!organizationIdResult.success) {
			return organizationIdResult;
		}

		const roleResult = await getUserRole(userId);
		if (!roleResult.success) {
			return roleResult;
		}

		const operatorAccess = await organizationRepository.findOperatorProgramAccess(organizationIdResult.data);
		if (!canRenameOrganization(roleResult.data, Boolean(operatorAccess))) {
			return resultFail('You do not have permission to rename this organization.');
		}

		const uniquenessResult = await validateOrganizationNameUniqueness(input.name, organizationIdResult.data);
		if (!uniquenessResult.success) {
			return uniquenessResult;
		}

		return resultOk(await organizationRepository.updateOrganizationName(organizationIdResult.data, input.name));
	} catch (error) {
		console.error('Could not rename organization', { userId, error });

		return resultFail('Could not rename organization. Please try again later.');
	}
};

export const deleteOrganization = async (userId: string, organizationId: string): Promise<ServiceResult<void>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const existingOrganization = await organizationRepository.findOrganizationIdentity(organizationId);
		if (!existingOrganization) {
			return resultFail('Organization not found');
		}

		const usage = await organizationRepository.findOrganizationUsageCounts(organizationId);
		if (usage.activeUsersCount > 0 || usage.expensesCount > 0 || usage.programAccessesCount > 0) {
			return resultFail('Organization cannot be deleted because it is still in use.');
		}

		await organizationRepository.deleteOrganization(organizationId);

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not delete organization', { userId, organizationId, error });

		return resultFail('Could not delete organization. Please try again later.');
	}
};

const getActiveOrganizationId = async (userId: string): Promise<ServiceResult<string>> => {
	const organizationId = await organizationRepository.findActiveOrganizationId(userId);

	return organizationId ? resultOk(organizationId) : resultFail('User has no active organization');
};

const validateOrganizationInput = async (
	input: CreateOrganizationInput | UpdateOrganizationInput,
	currentOrganizationId?: string,
): Promise<ServiceResult<void>> => {
	const uniquenessResult = await validateOrganizationNameUniqueness(input.name, currentOrganizationId);
	if (!uniquenessResult.success) {
		return uniquenessResult;
	}

	const uniqueUserIds = Array.from(new Set(input.userIds));
	if (uniqueUserIds.length > 0) {
		const users = await organizationRepository.findUsersByIds(uniqueUserIds);
		if (users.length !== uniqueUserIds.length) {
			return resultFail('One or more selected users do not exist.');
		}
	}

	const uniqueProgramIds = Array.from(new Set([...input.ownedProgramIds, ...input.operatedProgramIds]));
	if (uniqueProgramIds.length > 0) {
		const programsResult = await validateProgramIds(uniqueProgramIds);
		if (!programsResult.success) {
			return resultFail(programsResult.error);
		}
		if (!programsResult.data) {
			return resultFail('One or more selected programs do not exist.');
		}
	}

	return resultOk(undefined);
};

const validateOrganizationNameUniqueness = async (
	name: string,
	currentOrganizationId?: string,
): Promise<ServiceResult<void>> => {
	const existingOrganization = await organizationRepository.findOrganizationByName(name);
	if (existingOrganization && existingOrganization.id !== currentOrganizationId) {
		return resultFail('An organization with this name already exists.');
	}

	return resultOk(undefined);
};

const toOrganizationPayload = (
	organization: { id: string; name: string },
	input: CreateOrganizationInput | UpdateOrganizationInput,
): OrganizationPayload => ({
	id: organization.id,
	name: organization.name,
	userIds: input.userIds,
	ownedProgramIds: input.ownedProgramIds,
	operatedProgramIds: input.operatedProgramIds,
});
