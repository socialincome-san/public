import { differenceInCalendarDays } from 'date-fns';

// date-fns counts calendar days in the host time zone, so each date is rebuilt from its UTC parts first.
const toUtcCalendarDay = (date: Date) => new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export const getUtcCalendarDaysAgo = (date: Date, currentDate: Date): number =>
	Math.max(0, differenceInCalendarDays(toUtcCalendarDay(currentDate), toUtcCalendarDay(date)));
