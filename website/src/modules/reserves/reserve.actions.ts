'use server';

import type { Result } from '@/lib/result';
import type { LatestReserves } from '@/modules/reserves/reserve.types';
import { getLatestReserves } from './reserve.service';

export const getLatestReservesAction = async (): Promise<Result<LatestReserves>> => getLatestReserves();
