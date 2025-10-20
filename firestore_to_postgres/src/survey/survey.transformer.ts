import { Prisma, SurveyQuestionnaire, SurveyStatus } from '@prisma/client';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreSurveyWithRecipient } from './survey.types';

export class SurveyTransformer extends BaseTransformer<FirestoreSurveyWithRecipient, Prisma.SurveyCreateInput> {
	transform = async (input: FirestoreSurveyWithRecipient[]): Promise<Prisma.SurveyCreateInput[]> => {
		const transformed: Prisma.SurveyCreateInput[] = [];
		let skipped = 0;

		for (const { survey, recipient } of input) {
			if (recipient.test_recipient) {
				skipped++;
				continue;
			}

			transformed.push({
				legacyFirestoreId: `${recipient.id}_${survey.id}`,
				questionnaire: this.mapQuestionnaire(survey.questionnaire),
				language: survey.language?.toLowerCase() ?? '',
				dueAt: this.fromTimestamp(survey.due_date_at),
				sentAt: survey.sent_at ? this.fromTimestamp(survey.sent_at) : null,
				completedAt: survey.completed_at ? this.fromTimestamp(survey.completed_at) : null,
				status: this.mapStatus(survey.status),
				comments: survey.comments ?? null,
				data: survey.data ?? Prisma.JsonNull,
				accessEmail: survey.access_email ?? '',
				accessPw: survey.access_pw ?? '',
				accessToken: survey.access_token ?? '',
				recipient: { connect: { legacyFirestoreId: recipient.id } },
			});
		}

		if (skipped > 0) {
			console.log(`⚠️ Skipped ${skipped} test surveys (${transformed.length} transformed)`);
		}

		return transformed;
	};

	private fromTimestamp(timestamp: any): Date {
		if (timestamp?.toDate) return timestamp.toDate();
		if (typeof timestamp === 'string') return new Date(timestamp);
		if (typeof timestamp === 'number') return new Date(timestamp);
		throw new Error(`Invalid timestamp format: ${timestamp}`);
	}

	private mapStatus(status?: string): SurveyStatus {
		switch (status) {
			case 'new':
				return SurveyStatus.new;
			case 'sent':
				return SurveyStatus.sent;
			case 'scheduled':
				return SurveyStatus.scheduled;
			case 'in-progress':
				return SurveyStatus.in_progress;
			case 'completed':
				return SurveyStatus.completed;
			case 'missed':
				return SurveyStatus.missed;
			default:
				throw new Error(`Invalid survey status: ${status}`);
		}
	}

	private mapQuestionnaire(value?: string): SurveyQuestionnaire {
		switch (value) {
			case 'onboarding':
				return SurveyQuestionnaire.onboarding;
			case 'checkin':
				return SurveyQuestionnaire.checkin;
			case 'offboarding':
				return SurveyQuestionnaire.offboarding;
			case 'offboarded-checkin':
				return SurveyQuestionnaire.offboarded_checkin;
			default:
				throw new Error(`Invalid survey questionnaire: ${value}`);
		}
	}
}
