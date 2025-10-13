import { Prisma, SurveyQuestionnaire, SurveyStatus } from '@prisma/client';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreSurveyWithRecipient } from './survey.types';

export class SurveyTransformer extends BaseTransformer<FirestoreSurveyWithRecipient, Prisma.SurveyCreateInput> {
	transform = async (input: FirestoreSurveyWithRecipient[]): Promise<Prisma.SurveyCreateInput[]> => {
		return input.map(({ survey, recipient }) => ({
			legacyFirestoreId: `${recipient.id}_${survey.id}`,
			questionnaire: this.mapQuestionnaire(survey.questionnaire),
			language: survey.language?.toLowerCase() ?? 'en',
			dueAt: this.fromTimestamp(survey.due_date_at),
			sentAt: survey.sent_at ? this.fromTimestamp(survey.sent_at) : null,
			completedAt: survey.completed_at ? this.fromTimestamp(survey.completed_at) : null,
			status: this.mapStatus(survey.status),
			comments: survey.comments ?? null,
			data: survey.data ? JSON.stringify(survey.data) : '{}',
			accessEmail: survey.access_email ?? '',
			accessPw: survey.access_pw ?? '',
			accessToken: survey.access_token ?? '',
			recipient: {
				connect: { legacyFirestoreId: recipient.id },
			},
		}));
	};

	private fromTimestamp(timestamp: any): Date {
		if (timestamp?.toDate) return timestamp.toDate();
		if (typeof timestamp === 'string') return new Date(timestamp);
		if (typeof timestamp === 'number') return new Date(timestamp);
		return new Date();
	}

	private mapStatus(status: string | undefined): SurveyStatus {
		switch (status) {
			case 'sent':
				return SurveyStatus.sent;
			case 'scheduled':
				return SurveyStatus.scheduled;
			case 'in_progress':
				return SurveyStatus.in_progress;
			case 'completed':
				return SurveyStatus.completed;
			case 'missed':
				return SurveyStatus.missed;
			default:
				return SurveyStatus.new;
		}
	}

	private mapQuestionnaire(value: string | undefined): SurveyQuestionnaire {
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
				return SurveyQuestionnaire.onboarding;
		}
	}
}
