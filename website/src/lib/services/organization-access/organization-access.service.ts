import { OrganizationPermission } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ActiveOrganizationAccess } from './organization-access.types';
export class OrganizationAccessService extends BaseService {
  async getActiveOrganizationAccess(userId: string): Promise<ServiceResult<ActiveOrganizationAccess>> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: {
          activeOrganizationId: true,
          organizationAccesses: {
            select: {
              organizationId: true,
              permission: true,
            },
          },
        },
      });

      if (!user?.activeOrganizationId) {
        return this.resultFail('User has no active organization');
      }

      const access = user.organizationAccesses.find((a) => a.organizationId === user.activeOrganizationId);

      const permission = access?.permission ?? OrganizationPermission.readonly;

      return this.resultOk({
        id: user.activeOrganizationId,
        permission,
      });
    } catch (error) {
      this.logger.error(error);

      return this.resultFail(`Could not get active organization access: ${JSON.stringify(error)}`);
    }
  }
}
