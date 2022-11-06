import { PictureAsPdf } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function CallPDFBuilderFunction() {
	const onClick = () => {
		const functions = getFunctions();
		console.log(functions);
		const pdfBuilderFunction = httpsCallable(functions, 'pdfBuilderFunction');
		pdfBuilderFunction(55)
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<Tooltip title="Create the PDF">
			<IconButton component={'a'} size="large" onClick={onClick}>
				<PictureAsPdf />
			</IconButton>
		</Tooltip>
	);
}
