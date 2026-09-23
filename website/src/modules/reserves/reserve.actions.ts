'use server';

import { getLatestReserves } from './reserve.service';

export const getLatestReservesAction = async () => getLatestReserves();
