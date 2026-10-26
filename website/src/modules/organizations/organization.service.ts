import type { CountryCode } from '@/generated/prisma/enums';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getSessionAuditContext } from '@/lib/audit/audit-context';
import type { AuditContext } from '@/lib/audit/audit-types';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getCountryNameByCode } from '@/lib/types/country';
import { getProgramReferenceOptions, validateProgramIds } from '@/modules/programs/program-reference.service';
import { updateOrganizationProgramAccesses } from '@/modules/programs/program.service';
import { getUserRole, isAdmin, updateOrganizationMembers } from '@/modules/users/user.service';
import type { UserSession } from '@/modules/users/user.types';
import { canRenameOrganization } from './organization.permissions';
import * as organizationRepository from './organization.repository.read';
import * as organizationWriteRepository from './organization.repository.write';
import type { CreateOrganizationInput, RenameOrganizationInput, UpdateOrganizationInput } from './organization.schemas';
import type {
	ActiveOrganizationSummary,
	OrganizationAdminMemberTableQuery,
	OrganizationMemberPaginatedTableView,
	OrganizationMemberTableQuery,
	OrganizationMemberTableViewRow,
	OrganizationOption,
	OrganizationPaginatedTableView,
	OrganizationPayload,
	OrganizationTableQuery,
	OrganizationTableViewRow,
} from './organization.types';

const toOrganizationMemberTableRows = (
	members: Awaited<ReturnType<typeof organizationRepository.findPaginatedOrganizationMembers>>['members'],
): OrganizationMemberTableViewRow[] =>
	members.map((member) => ({
		id: member.user.id,
		firstName: member.user.contact?.firstName ?? '',
		lastName: member.user.contact?.lastName ?? '',
		email: member.user.contact?.email ?? '',
		role: member.user.role ?? null,
	}));

export const getActiveOrganizationSummary = async (userId: string): Promise<Result<ActiveOrganizationSummary>> => {
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
): Promise<Result<OrganizationMemberPaginatedTableView>> => {
	try {
		const organizationIdResult = await getActiveOrganizationId(userId);
		if (!organizationIdResult.success) {
			return organizationIdResult;
		}

		const { members, totalCount } = await organizationRepository.findPaginatedOrganizationMembers(
			organizationIdResult.data,
			query,
		);
		const tableRows = toOrganizationMemberTableRows(members);

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch organization members', { userId, error });

		return resultFail('Could not fetch organization members');
	}
};

export const getPaginatedOrganizationAdminMembersTableView = async (
	userId: string,
	query: OrganizationAdminMemberTableQuery,
): Promise<Result<OrganizationMemberPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { organizationId, ...tableQuery } = query;
		const { members, totalCount } = await organizationRepository.findPaginatedOrganizationMembers(
			organizationId,
			tableQuery,
		);

		return resultOk({ tableRows: toOrganizationMemberTableRows(members), totalCount });
	} catch (error) {
		console.error('Could not fetch organization members for admin', { userId, organizationId: query.organizationId, error });

		return resultFail('Could not fetch organization members');
	}
};

export const getPaginatedOrganizationAdminTableView = async (
	userId: string,
	query: OrganizationTableQuery,
): Promise<Result<OrganizationPaginatedTableView>> => {
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

export const getOrganizationOptions = async (userId: string): Promise<Result<OrganizationOption[]>> => {
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

export const getOrganizationReferenceOptions = async (): Promise<Result<OrganizationOption[]>> => {
	try {
		return resultOk(await organizationRepository.findOrganizationOptions());
	} catch (error) {
		console.error('Could not fetch organization reference options', { error });

		return resultFail('Could not fetch organizations');
	}
};

export const getOrganizationCountryOptions = async (userId: string): Promise<Result<OrganizationOption[]>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const countries = await organizationRepository.findOrganizationCountryOptions();

		return resultOk(
			countries.map(({ isoCode }) => ({
				id: isoCode,
				name: `${getCountryNameByCode(isoCode)} (${isoCode})`,
			})),
		);
	} catch (error) {
		console.error('Could not fetch organization country options', { userId, error });

		return resultFail('Could not fetch organization country options');
	}
};

export const getOperatorFallbackOrganizationId = async (countryCode: CountryCode): Promise<Result<string>> => {
	try {
		const organization = await organizationRepository.findOperatorFallbackOrganization(countryCode);

		return organization
			? resultOk(organization.id)
			: resultFail('Operator fallback organization not found for this country');
	} catch (error) {
		console.error('Could not fetch operator fallback organization', { countryCode, error });

		return resultFail('Could not fetch operator fallback organization');
	}
};

export const validateOrganizationIds = async (organizationIds: string[]): Promise<Result<boolean>> => {
	try {
		const uniqueIds = [...new Set(organizationIds)];
		const organizations = await organizationRepository.findOrganizationsByIds(uniqueIds);

		return resultOk(organizations.length === uniqueIds.length);
	} catch (error) {
		console.error('Could not validate organizations', { error });

		return resultFail('Could not validate organizations');
	}
};

export const getOrganization = async (userId: string, organizationId: string): Promise<Result<OrganizationPayload>> => {
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
			operatorFallbackCountryCode: organization.operatorFallbackCountryCode,
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

export const getOrganizationUserOptions = async (userId: string): Promise<Result<{ id: string; name: string }[]>> => {
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

export const getOrganizationProgramOptions = async (userId: string): Promise<Result<{ id: string; name: string }[]>> => {
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

export const createOrganizationFromEmail = async (email: string): Promise<Result<OrganizationPayload>> => {
	try {
		const organization = await organizationWriteRepository.createOrganization(
			{ actor: { type: 'system', id: 'public-onboarding' }, source: 'system' },
			`${email.toLowerCase().trim()} organization`,
			null,
		);

		return resultOk({
			id: organization.id,
			name: organization.name,
			operatorFallbackCountryCode: null,
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
	session: UserSession,
	input: CreateOrganizationInput,
): Promise<Result<OrganizationPayload>> => {
	try {
		const isAdminResult = await isAdmin(session.id);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const validationResult = await validateOrganizationInput(input);
		if (!validationResult.success) {
			return validationResult;
		}

		const audit = getSessionAuditContext(session);
		const organization = await organizationWriteRepository.createOrganization(
			audit,
			input.name,
			toOperatorFallbackCountryCode(input.operatorFallbackCountryCode),
		);
		const relationsResult = await updateOrganizationRelations(audit, organization.id, input);
		if (!relationsResult.success) {
			// Creating again would fail on the taken name, so point to editing.
			return resultFail('The organization was created, but its programs or members could not be saved. Edit it to retry.');
		}

		return resultOk(toOrganizationPayload(organization, input));
	} catch (error) {
		console.error('Could not create organization', { userId: session.id, error });

		return resultFail('Could not create organization. Please try again later.');
	}
};

export const updateOrganization = async (
	session: UserSession,
	input: UpdateOrganizationInput,
): Promise<Result<OrganizationPayload>> => {
	try {
		const isAdminResult = await isAdmin(session.id);
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

		const audit = getSessionAuditContext(session);
		const organization = await organizationWriteRepository.updateOrganization(
			audit,
			input.id,
			input.name,
			toOperatorFallbackCountryCode(input.operatorFallbackCountryCode),
		);
		const relationsResult = await updateOrganizationRelations(audit, input.id, input);
		if (!relationsResult.success) {
			return relationsResult;
		}

		return resultOk(toOrganizationPayload(organization, input));
	} catch (error) {
		console.error('Could not update organization', { userId: session.id, organizationId: input.id, error });

		return resultFail('Could not update organization. Please try again later.');
	}
};

// Program accesses belong to programs and memberships to users, so the
// organization form writes them through those modules after the
// organization itself. Each step sets a full list, so a retry is safe.
const updateOrganizationRelations = async (
	audit: AuditContext,
	organizationId: string,
	input: CreateOrganizationInput,
): Promise<Result<void>> => {
	const accessesResult = await updateOrganizationProgramAccesses(audit, {
		organizationId,
		ownedProgramIds: input.ownedProgramIds,
		operatedProgramIds: input.operatedProgramIds,
	});
	if (!accessesResult.success) {
		return accessesResult;
	}

	return updateOrganizationMembers(audit, { organizationId, memberIds: input.userIds });
};

export const renameActiveOrganization = async (
	session: UserSession,
	input: RenameOrganizationInput,
): Promise<Result<{ id: string; name: string }>> => {
	const userId = session.id;
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

		return resultOk(
			await organizationWriteRepository.updateOrganizationName(
				getSessionAuditContext(session),
				organizationIdResult.data,
				input.name,
			),
		);
	} catch (error) {
		console.error('Could not rename organization', { userId, error });

		return resultFail('Could not rename organization. Please try again later.');
	}
};

export const deleteOrganization = async (session: UserSession, organizationId: string): Promise<Result<void>> => {
	try {
		const isAdminResult = await isAdmin(session.id);
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

		// Memberships belong to users, so they are removed in a separate step.
		// Removing them again on a retry changes nothing.
		const audit = getSessionAuditContext(session);
		const membersResult = await updateOrganizationMembers(audit, { organizationId, memberIds: [] });
		if (!membersResult.success) {
			return membersResult;
		}
		await organizationWriteRepository.deleteOrganization(audit, organizationId);

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not delete organization', { userId: session.id, organizationId, error });

		return resultFail('Could not delete organization. Please try again later.');
	}
};

const getActiveOrganizationId = async (userId: string): Promise<Result<string>> => {
	const organizationId = await organizationRepository.findActiveOrganizationId(userId);

	return organizationId ? resultOk(organizationId) : resultFail('User has no active organization');
};

const validateOrganizationInput = async (
	input: CreateOrganizationInput | UpdateOrganizationInput,
	currentOrganizationId?: string,
): Promise<Result<void>> => {
	const uniquenessResult = await validateOrganizationNameUniqueness(input.name, currentOrganizationId);
	if (!uniquenessResult.success) {
		return uniquenessResult;
	}

	const operatorFallbackCountryCode = toOperatorFallbackCountryCode(input.operatorFallbackCountryCode);
	if (operatorFallbackCountryCode) {
		const existingFallbackOrganization = await organizationRepository.findOrganizationByOperatorFallbackCountry(
			operatorFallbackCountryCode,
			currentOrganizationId,
		);
		if (existingFallbackOrganization) {
			return resultFail('An operator fallback organization is already configured for this country.');
		}
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

const validateOrganizationNameUniqueness = async (name: string, currentOrganizationId?: string): Promise<Result<void>> => {
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
	operatorFallbackCountryCode: toOperatorFallbackCountryCode(input.operatorFallbackCountryCode),
	userIds: input.userIds,
	ownedProgramIds: input.ownedProgramIds,
	operatedProgramIds: input.operatedProgramIds,
});

const toOperatorFallbackCountryCode = (value: CreateOrganizationInput['operatorFallbackCountryCode']): CountryCode | null =>
	value === 'none' ? null : value;
