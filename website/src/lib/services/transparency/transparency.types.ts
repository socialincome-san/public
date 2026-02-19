import { CountryCode } from '@/generated/prisma/enums';
import { DateTime } from 'luxon';

export type TimeRange = {
  start: DateTime;
  end: DateTime;
};

export type ContributionTimeRange = TimeRange & {
  totalChf: number;
};

export type ContributionsByCountry = {
  country: string;
  countryCode: CountryCode;
  totalChf: number;
  contributorCount: number;
  percentageOfTotal: number;
};

export type TransparencyTotals = {
  totalContributionsChf: number;
  totalContributors: number;
  totalContributionsCount: number;
};

export type TransparencyData = {
  totals: TransparencyTotals;
  timeRanges: ContributionTimeRange[];
  topCountries: ContributionsByCountry[];
};
