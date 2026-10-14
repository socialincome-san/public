'use client';

import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { entityAuditTableConfig } from '@/components/data-table/configs/audit-table.config';
import { getEntityAuditTableViewAction } from '@/modules/audit/audit.actions';
import type { EntityAuditType } from '@/modules/audit/audit.types';
import type { TabbedDialogTab } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';

export const auditLogTab = (entityType: EntityAuditType, entityId: string): TabbedDialogTab => ({
	value: 'audit-log',
	label: 'Audit log',
	content: (
		<RecordTableTab
			config={entityAuditTableConfig}
			load={(query) => getEntityAuditTableViewAction({ ...query, entityType, entityId })}
		/>
	),
});
