// import { OrganizationPermission } from '@prisma/client';
// import { BaseService } from '../core/base.service';
// import { ServiceResult } from '../core/base.types';
//
// export type UserOrganizationAccess = {
// 	organizationId: string;
// 	permissions: OrganizationPermission[];
// };
//
// export class OrganizationAccessService extends BaseService {
// 	async getUserOrganizationAccesses(userId: string): Promise<ServiceResult<UserOrganizationAccess[]>> {
// 		try {
// 			const accesses = await this.db.organizationAccess.findMany({
// 				where: { userId },
// 				select: {
// 					organizationId: true,
// 					permissions: true,
// 				},
// 			});
// 			return this.resultOk(accesses);
// 		} catch {
// 			return this.resultFail('Could not fetch organization accesses');
// 		}
// 	}
//
// 	getAccessibleOrganizationIds(organizationAccesses: UserOrganizationAccess[]): string[] {
// 		return organizationAccesses.map((access) => access.organizationId);
// 	}
//
// 	hasEditPermission(organizationAccesses: UserOrganizationAccess[], relatedOrganizationIds: string[]): boolean {
// 		return organizationAccesses.some((access) => {
// 			return (
// 				relatedOrganizationIds.includes(access.organizationId) &&
// 				access.permissions.includes(OrganizationPermission.edit)
// 			);
// 		});
// 	}
// }
