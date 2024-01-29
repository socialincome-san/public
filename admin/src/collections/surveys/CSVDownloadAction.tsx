import { Button, Typography } from '@mui/material';
import { Survey, SurveyQuestionnaire, SurveyStatus } from '@socialincome/shared/src/types/survey';
import { downloadStringAsFile } from '@socialincome/shared/src/utils/html';
import { CollectionActionsProps, useDataSource } from 'firecms';

export function CSVDownloadAction({ collection }: CollectionActionsProps<Survey>) {
	const { fetchCollection } = useDataSource();

	const downloadCSV = async (questionnaire: SurveyQuestionnaire) => {
		fetchCollection<Survey>({
			path: collection.path,
			collection: collection,
			filter: { status: ['==', SurveyStatus.Completed], questionnaire: ['==', questionnaire] },
		}).then((result) => {
			if (result.length === 0) return;
			const csvRows: string[][] = [];

			// pageNo is a key that is added by the survey tool and is not needed in the export
			const keys = Object.keys(result[0].values.data).filter((key) => key !== 'pageNo');
			csvRows.push(['questionnaire', 'path', ...keys]);
			result.map((survey) => csvRows.push([survey.id, survey.path, ...keys.map((key) => survey.values.data[key])]));
			downloadStringAsFile(csvRows.map((row) => row.join('\t')).join('\n'), `${questionnaire}.tsv`);
		});
	};

	return (
		<>
			<Typography variant="subtitle1" color="textSecondary">
				Export as .tsv file
			</Typography>
			<Button onClick={() => downloadCSV(SurveyQuestionnaire.Onboarding)}>Onboarding</Button>
			<Button onClick={() => downloadCSV(SurveyQuestionnaire.Checkin)}>Check-In</Button>
			<Button onClick={() => downloadCSV(SurveyQuestionnaire.Offboarding)}>Offboarding</Button>
			<Button onClick={() => downloadCSV(SurveyQuestionnaire.OffboardedCheckin)}>Offboarded Check-In</Button>
		</>
	);
}
