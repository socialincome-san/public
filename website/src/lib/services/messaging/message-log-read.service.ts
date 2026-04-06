import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { MessagePaginatedTableView, MessageTableQuery, MessageTableViewRow } from './messaging-log.types';

export class MessageLogReadService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	private buildOrderBy(query: MessageTableQuery): Prisma.MessageOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'channel', 'status', 'recipientType', 'sentAt', 'createdAt'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'channel':
				return [{ channel: direction }];
			case 'status':
				return [{ status: direction }];
			case 'recipientType':
				return [{ recipientType: direction }];
			case 'sentAt':
				return [{ sentAt: direction }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	async getPaginatedTableView(query: MessageTableQuery): Promise<ServiceResult<MessagePaginatedTableView>> {
		try {
			const search = query.search.trim();
			const where: Prisma.MessageWhereInput = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
							{ addressee: { contains: search, mode: 'insensitive' as const } },
							{ template: { name: { contains: search, mode: 'insensitive' as const } } },
						],
					}
				: {};

			const [messages, totalCount] = await Promise.all([
				this.db.message.findMany({
					where,
					select: {
						id: true,
						channel: true,
						addressee: true,
						recipientType: true,
						status: true,
						template: { select: { name: true } },
						sentAt: true,
						createdAt: true,
					},
					orderBy: this.buildOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.message.count({ where }),
			]);

			const tableRows: MessageTableViewRow[] = messages.map((m) => ({
				id: m.id,
				channel: m.channel,
				addressee: m.addressee,
				recipientType: m.recipientType,
				status: m.status,
				templateName: m.template?.name ?? null,
				sentAt: m.sentAt,
				createdAt: m.createdAt,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch messages: ${JSON.stringify(error)}`);
		}
	}
}
