'use client';

import { ContributionStats } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';

interface TestParam {
    contributionStats: ContributionStats
}

export default async function Test(testParam: TestParam) {
    return <div>{testParam.contributionStats.totalContributions}</div>
}