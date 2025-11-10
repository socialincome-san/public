import { Prisma, SurveyQuestionnaire, SurveyStatus } from '@prisma/client';
import { surveySchedules } from '../../scripts/seed-defaults';
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

			const surveyName = survey.id;
			const scheduleData = surveySchedules.find((schedule) => schedule.name === surveyName);

			if (!scheduleData) {
				throw new Error(`No survey schedule found for name "${surveyName}"`);
			}

			transformed.push({
				name: surveyName,
				legacyFirestoreId: `${recipient.id}_${survey.id}`,
				questionnaire: this.mapQuestionnaire(survey.questionnaire),
				language: survey.language?.toLowerCase() ?? '',
				dueAt: this.fromTimestamp(survey.due_date_at),
				completedAt: survey.completed_at ? this.fromTimestamp(survey.completed_at) : null,
				status: this.mapStatus(survey.status),
				data: survey.data ?? Prisma.JsonNull,
				accessEmail: survey.access_email ?? '',
				accessPw: survey.access_pw ?? '',
				accessToken: survey.access_token ?? '',
				recipient: { connect: { legacyFirestoreId: recipient.id } },
				surveySchedule: { connect: { id: scheduleData.id } },
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

		if (process.env.FIREBASE_DATABASE_URL?.includes('staging')) {
			console.log(`💡 Invalid timestamp format "${timestamp}" — falling back to current date (staging only).`);
			return new Date();
		}

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
				if (process.env.FIREBASE_DATABASE_URL?.includes('staging')) {
					console.log(`💡 Unknown survey questionnaire "${value}" — falling back to "checkin" (staging only).`);
					return SurveyQuestionnaire.checkin;
				}

				throw new Error(`Invalid survey questionnaire: ${value}`);
		}
	}
}
