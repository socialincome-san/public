import { PlayArrow } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function CallDummyFunctionButton() {
	const onClick = () => {
		const functions = getFunctions();
		console.log(functions);
		const mkDummyFunction = httpsCallable(functions, 'dummyfunction');
		mkDummyFunction(55)
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<Tooltip title="Run a dummy function">
			<IconButton component={'a'} size="large" onClick={onClick}>
				<PlayArrow />
			</IconButton>
		</Tooltip>
	);
}
