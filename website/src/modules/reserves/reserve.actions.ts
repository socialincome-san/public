'use server';

import type { Result } from '@/lib/result';
import type { LatestReserves } from '@/modules/reserves/reserve.types';
import { getLatestReserves } from './reserve.cache';

export const getLatestReservesAction = async (): Promise<Result<LatestReserves>> => getLatestReserves();
