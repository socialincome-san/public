import { Recipient } from '@socialincome/shared/src/types/recipient';
import { Survey } from '@socialincome/shared/src/types/survey';
import { BaseExtractor } from '../core/base.extractor';
import {
	FirestoreRecipientWithId,
	FirestoreSurveyWithRecipient,
	RECIPIENT_FIRESTORE_PATH,
	SURVEY_FIRESTORE_PATH,
} from './survey.types';

export class SurveyExtractor extends BaseExtractor<FirestoreSurveyWithRecipient> {
	extract = async (): Promise<FirestoreSurveyWithRecipient[]> => {
		const recipients = await this.loadAllRecipients();
		const surveys = await this.loadAllSurveys();
		return this.mergeSurveysWithRecipients(surveys, recipients);
	};

	private async loadAllRecipients(): Promise<Map<string, FirestoreRecipientWithId>> {
		const snapshot = await this.firestore.collection(RECIPIENT_FIRESTORE_PATH).get();
		const map = new Map<string, FirestoreRecipientWithId>();
		for (const doc of snapshot.docs) {
			const data = doc.data() as Recipient;
			map.set(doc.id, { ...data, id: doc.id, legacyFirestoreId: doc.id });
		}
		return map;
	}

	private async loadAllSurveys() {
		const snapshot = await this.firestore.collectionGroup(SURVEY_FIRESTORE_PATH).get();
		return snapshot.docs;
	}

	private mergeSurveysWithRecipients(
		docs: FirebaseFirestore.QueryDocumentSnapshot[],
		recipientMap: Map<string, FirestoreRecipientWithId>,
	): FirestoreSurveyWithRecipient[] {
		const surveys: FirestoreSurveyWithRecipient[] = [];

		for (const doc of docs) {
			const recipientId = this.extractRecipientIdFromPath(doc.ref.path);
			const recipient = recipientMap.get(recipientId);
			if (!recipient) continue;

			surveys.push({
				survey: { ...(doc.data() as Survey), id: doc.id, legacyFirestoreId: doc.id },
				recipient,
			});
		}

		return surveys;
	}

	private extractRecipientIdFromPath(path: string): string {
		const parts = path.split('/');
		return parts[parts.indexOf('recipients') + 1];
	}
}
