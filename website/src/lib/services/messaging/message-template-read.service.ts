import { MessageTemplate, Prisma, PrismaClient } from '@/generated/prisma/client';
import { MessageChannel } from '@/generated/prisma/enums';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	MessageTemplateOption,
	MessageTemplatePaginatedTableView,
	MessageTemplatePayload,
	MessageTemplateTableQuery,
	MessageTemplateTableViewRow,
} from './message-template.types';

export class MessageTemplateReadService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	private buildOrderBy(query: MessageTemplateTableQuery): Prisma.MessageTemplateOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'name', 'channel', 'isActive', 'createdAt'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'name':
				return [{ name: direction }];
			case 'channel':
				return [{ channel: direction }];
			case 'isActive':
				return [{ isActive: direction }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	async getById(id: string): Promise<ServiceResult<MessageTemplatePayload>> {
		try {
			const template = await this.db.messageTemplate.findUnique({
				where: { id },
				select: {
					id: true,
					name: true,
					channel: true,
					subject: true,
					body: true,
					description: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!template) {
				return this.resultFail('Template not found');
			}

			return this.resultOk(template);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch template: ${JSON.stringify(error)}`);
		}
	}

	async getActiveByChannel(channel: MessageChannel): Promise<ServiceResult<MessageTemplateOption[]>> {
		try {
			const templates = await this.db.messageTemplate.findMany({
				where: { channel, isActive: true },
				select: { id: true, name: true, body: true, subject: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(templates);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch templates: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(query: MessageTemplateTableQuery): Promise<ServiceResult<MessageTemplatePaginatedTableView>> {
		try {
			const search = query.search.trim();
			const where: Prisma.MessageTemplateWhereInput = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
							{ name: { contains: search, mode: 'insensitive' as const } },
							{ description: { contains: search, mode: 'insensitive' as const } },
						],
					}
				: {};

			const [templates, totalCount] = await Promise.all([
				this.db.messageTemplate.findMany({
					where,
					select: {
						id: true,
						name: true,
						channel: true,
						description: true,
						isActive: true,
						createdAt: true,
					},
					orderBy: this.buildOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.messageTemplate.count({ where }),
			]);

			const tableRows: MessageTemplateTableViewRow[] = templates;

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch templates: ${JSON.stringify(error)}`);
		}
	}
}
