import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { SentEmailPaginatedTableView, SentEmailTableQuery, SentEmailTableViewRow } from './sent-email.types';

export class SentEmailReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
	) {
		super(db);
	}

	private buildSentEmailOrderBy(query: SentEmailTableQuery): Prisma.SentEmailOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'sentAt', 'toEmail', 'subject', 'fromEmail', 'contact'] as const);

		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'sentAt':
				return [{ sentAt: direction }];
			case 'toEmail':
				return [{ toEmail: direction }];
			case 'subject':
				return [{ subject: direction }];
			case 'fromEmail':
				return [{ fromEmail: direction }];
			case 'contact':
				return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
			default:
				return [{ sentAt: 'desc' }];
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: SentEmailTableQuery,
	): Promise<ServiceResult<SentEmailPaginatedTableView>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const search = query.search.trim();
			const where: Prisma.SentEmailWhereInput | undefined = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' } },
							{ toEmail: { contains: search, mode: 'insensitive' } },
							{ fromEmail: { contains: search, mode: 'insensitive' } },
							{ subject: { contains: search, mode: 'insensitive' } },
							{ body: { contains: search, mode: 'insensitive' } },
							{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
							{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
							{ contact: { email: { contains: search, mode: 'insensitive' } } },
						],
					}
				: undefined;

			const [sentEmails, totalCount] = await Promise.all([
				this.db.sentEmail.findMany({
					where,
					select: {
						id: true,
						sentAt: true,
						toEmail: true,
						fromEmail: true,
						subject: true,
						body: true,
						contact: { select: { firstName: true, lastName: true, email: true } },
					},
					orderBy: this.buildSentEmailOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.sentEmail.count({ where }),
			]);

			const tableRows: SentEmailTableViewRow[] = sentEmails.map((sentEmail) => ({
				...sentEmail,
				contact: sentEmail.contact
					? [sentEmail.contact.firstName, sentEmail.contact.lastName, sentEmail.contact.email].filter(Boolean).join(' ')
					: '',
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch sent emails: ${JSON.stringify(error)}`);
		}
	}
}
