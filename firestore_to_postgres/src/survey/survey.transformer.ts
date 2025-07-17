import { SurveyQuestionnaire, SurveyStatus } from '@prisma/client';
import { CreateSurveyInput } from '@socialincome/shared/src/database/services/survey/survey.types';
import { BaseTransformer } from '../core/base.transformer';
import { SurveyWithRecipient } from './survey.extractor';

export type SurveyWithEmail = Omit<CreateSurveyInput, 'recipientId'> & {
	recipientEmail: string;
};

export class SurveyTransformer extends BaseTransformer<SurveyWithRecipient, SurveyWithEmail[]> {
	transform = async (input: SurveyWithRecipient[]): Promise<SurveyWithEmail[][]> => {
		const transformed: SurveyWithEmail[] = input.map(({ survey, recipient }) => {
			const recipientEmail = recipient.email?.trim()
				? recipient.email.toLowerCase()
				: this.generateFallbackEmail(recipient.first_name, recipient.last_name);

			return {
				questionnaire: this.mapQuestionnaire(survey.questionnaire),
				recipientName: survey.recipient_name,
				language: this.mapLanguage(survey.language),
				dueDateAt: this.fromTimestamp(survey.due_date_at),
				sentAt: survey.sent_at ? this.fromTimestamp(survey.sent_at) : null,
				completedAt: survey.completed_at ? this.fromTimestamp(survey.completed_at) : null,
				status: this.isValidStatus(survey.status) ? survey.status : SurveyStatus.new,
				comments: survey.comments ?? null,
				data: JSON.stringify(survey.data ?? {}),
				accessEmail: survey.access_email || recipientEmail,
				accessPw: survey.access_pw,
				accessToken: survey.access_token,
				recipientEmail,
			};
		});

		return [transformed];
	};

	private fromTimestamp(timestamp: any): Date {
		if (timestamp?.toDate) return timestamp.toDate();
		if (typeof timestamp === 'string') return new Date(timestamp);
		return new Date(timestamp);
	}

	private isValidStatus(status: string): status is SurveyStatus {
		return Object.values(SurveyStatus).includes(status as SurveyStatus);
	}

	private generateFallbackEmail(firstName: string, lastName: string): string {
		const namePart = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
		return `${namePart}@autocreated.socialincome`;
	}

	private mapQuestionnaire(value: string): SurveyQuestionnaire {
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
				throw new Error(`❌ Unknown questionnaire value: ${value}`);
		}
	}

	private mapLanguage(value: string): RecipientMainLanguage {
		switch (value.toLowerCase()) {
			case 'krio':
				return 'kri';
			case 'kri':
				return 'kri';
			case 'en':
				return 'en';
			default:
				throw new Error(`❌ Unknown language value: ${value}`);
		}
	}
}
