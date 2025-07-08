import { Recipient, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types/recipient';
import { Survey, SURVEY_FIRETORE_PATH } from '@socialincome/shared/src/types/survey';
import { BaseExtractor } from '../core/base.extractor';

export type RecipientWithId = Recipient & { id: string };

export type SurveyWithRecipient = {
	survey: Survey;
	recipient: RecipientWithId;
};

export class SurveyExtractor extends BaseExtractor<SurveyWithRecipient> {
	extract = async (): Promise<SurveyWithRecipient[]> => {
		const recipientMap = await this.loadAllRecipients();
		const surveyDocs = await this.loadAllSurveyDocs();
		return this.mergeSurveysWithRecipients(surveyDocs, recipientMap);
	};

	private loadAllRecipients = async (): Promise<Map<string, Recipient>> => {
		const snapshot = await this.firestore.collection(RECIPIENT_FIRESTORE_PATH).get();
		const map = new Map<string, Recipient>();
		for (const doc of snapshot.docs) {
			map.set(doc.id, doc.data() as Recipient);
		}
		return map;
	};

	private loadAllSurveyDocs = async () => {
		const snapshot = await this.firestore.collectionGroup(SURVEY_FIRETORE_PATH).get();
		return snapshot.docs;
	};

	private mergeSurveysWithRecipients(
		docs: FirebaseFirestore.QueryDocumentSnapshot[],
		recipientMap: Map<string, Recipient>,
	): SurveyWithRecipient[] {
		const surveys: SurveyWithRecipient[] = [];

		for (const doc of docs) {
			const recipientId = this.extractRecipientIdFromPath(doc.ref.path);
			const recipient = recipientMap.get(recipientId);
			if (!recipient) continue;

			surveys.push({
				survey: doc.data() as Survey,
				recipient: { ...recipient, id: recipientId },
			});
		}

		return surveys;
	}

	private extractRecipientIdFromPath(path: string): string {
		const parts = path.split('/');
		return parts[parts.indexOf('recipients') + 1];
	}
}
