import { WebsiteLanguage } from '@/lib/i18n/utils';
import 'survey-core/defaultV2.min.css';
import './survey.css';

export type SurveyLanguage = Extract<WebsiteLanguage, 'en' | 'kri'>;

interface SurveyProps {
	surveyId: string;
	recipientId: string;
	lang: SurveyLanguage;
}

export function Survey({ surveyId, recipientId, lang }: SurveyProps) {
	return <div>Survey currently not available</div>;
}
