import { z } from 'zod';

// Bounds mirror the URL normalization in the data table, so a client can't request more than the UI offers
export const tableQueryFilterSchema = z.string().trim().max(64).optional();

export const tableQuerySchema = z.object({
	page: z.number().int().min(1),
	pageSize: z.number().int().min(1).max(1000),
	search: z.string().trim().max(120),
	sortBy: tableQueryFilterSchema,
	sortDirection: z.enum(['asc', 'desc']).optional(),
});
