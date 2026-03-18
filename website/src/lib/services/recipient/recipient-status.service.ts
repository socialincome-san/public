import { PayoutInterval, PayoutStatus, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	RecipientLifecycleStatus,
	RecipientLifecycleStatusFromExpectedIntervalsInput,
	RecipientLifecycleStatusInput,
} from './recipient.types';

export class RecipientStatusService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	countPaidOrConfirmedPayouts = (payouts: { status: PayoutStatus }[]): ServiceResult<number> => {
		try {
			const count = payouts.filter(
				(payout) => payout.status === PayoutStatus.paid || payout.status === PayoutStatus.confirmed,
			).length;

			return this.resultOk(count);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not count paid or confirmed payouts');
		}
	};

	getExpectedIntervals = (programDurationInMonths: number, payoutInterval: PayoutInterval): ServiceResult<number> => {
		try {
			if (payoutInterval === PayoutInterval.quarterly) {
				return this.resultOk(Math.ceil(programDurationInMonths / 3));
			}
			if (payoutInterval === PayoutInterval.yearly) {
				return this.resultOk(Math.ceil(programDurationInMonths / 12));
			}

			return this.resultOk(programDurationInMonths);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not calculate expected intervals');
		}
	};

	getRecipientLifecycleStatus = (params: RecipientLifecycleStatusInput): ServiceResult<RecipientLifecycleStatus> => {
		try {
			const expectedIntervalsResult = this.getExpectedIntervals(params.programDurationInMonths, params.payoutInterval);
			if (!expectedIntervalsResult.success) {
				return this.resultFail(expectedIntervalsResult.error);
			}

			return this.getRecipientLifecycleStatusFromExpectedIntervals({
				startDate: params.startDate,
				suspendedAt: params.suspendedAt,
				paidOrConfirmedCount: params.paidOrConfirmedCount,
				expectedIntervals: expectedIntervalsResult.data,
				nowDate: params.nowDate,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not determine recipient lifecycle status');
		}
	};

	getRecipientLifecycleStatusFromExpectedIntervals = (
		params: RecipientLifecycleStatusFromExpectedIntervalsInput,
	): ServiceResult<RecipientLifecycleStatus> => {
		try {
			if (this.isRecipientSuspendedNow(params.suspendedAt, params.nowDate)) {
				return this.resultOk('suspended');
			}

			if (!this.isRecipientStartedNow(params.startDate, params.nowDate)) {
				return this.resultOk('future');
			}

			if (this.isRecipientCompleted(params.paidOrConfirmedCount, params.expectedIntervals)) {
				return this.resultOk('completed');
			}

			return this.resultOk('active');
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not determine recipient lifecycle status');
		}
	};

	isRecipientEligibleForPayout = (params: RecipientLifecycleStatusInput): ServiceResult<boolean> => {
		try {
			const statusResult = this.getRecipientLifecycleStatus(params);
			if (!statusResult.success) {
				return this.resultFail(statusResult.error);
			}

			return this.resultOk(statusResult.data === 'active');
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not determine recipient payout eligibility');
		}
	};

	private isRecipientStartedNow = (startDate: Date | null, nowDate: Date): boolean => {
		return startDate !== null && startDate < nowDate;
	};

	private isRecipientSuspendedNow = (suspendedAt: Date | null, nowDate: Date): boolean => {
		return suspendedAt !== null && suspendedAt <= nowDate;
	};

	private isRecipientCompleted = (paidOrConfirmedCount: number, expectedIntervals: number): boolean => {
		return paidOrConfirmedCount >= expectedIntervals;
	};
}
