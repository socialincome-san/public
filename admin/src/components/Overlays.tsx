import { Box, Typography } from '@mui/material';

export function NoRowsOverlay() {
	return (
		<Box
			sx={{
				display: 'flex',
				width: '100%',
				height: '100%',
				alignSelf: 'center',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Typography>All tasks are done</Typography>
		</Box>
	);
}
