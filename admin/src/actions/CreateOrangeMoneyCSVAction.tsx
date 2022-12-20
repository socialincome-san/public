import { useSnackbarController } from '@camberi/firecms';
import { CollectionActionsProps } from '@camberi/firecms/dist/types/collections';
import { Button } from '@mui/material';
import { downloadStringAsFile } from '@socialincome/shared/src/htmlHelpers';
import { Recipient } from '@socialincome/shared/src/types';
import { getFunctions, httpsCallable } from 'firebase/functions';

export function CreateOrangeMoneyCSVAction({}: CollectionActionsProps<Recipient>) {
	const snackbarController = useSnackbarController();

	const onUpdateListButtonClick = () => {
		const functions = getFunctions();
		const updateOrangeMoneyRecipientsCollectionFunction = httpsCallable<void, string>(
			functions,
			'createOrangeMoneyCSV'
		);
		updateOrangeMoneyRecipientsCollectionFunction()
			.then((result) => {
				const fileName = `11866_${new Date().toLocaleDateString('sv')}.csv`;
				downloadStringAsFile(result.data, fileName);
			})
			.catch(() => {
				snackbarController.open({
					type: 'error',
					message: 'Oops, something went wrong.',
				});
			});
	};
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<Button size="large" color="primary" onClick={onUpdateListButtonClick}>
				Download Orange Money CSV
			</Button>
		</div>
	);
}
