import { Box, Button, Card, CardActions, CardContent, Container, Grid, Typography } from '@mui/material';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { useSnackbarController } from 'firecms';

/**
 * Collection of admin scripts
 */
export function ScriptsView() {
	const functions = getFunctions();
	const snackbarController = useSnackbarController();
	const batchImportStripeCharges = () => {
		snackbarController.open({
			type: 'success',
			message: 'Starting import',
		});
		httpsCallable(functions, 'batchImportStripeCharges')()
			.then(() => {
				snackbarController.open({
					type: 'success',
					message: 'Import succeeded.',
				});
			})
			.catch((err) => {
				snackbarController.open({
					type: 'error',
					message: 'Import failed. Check console for details.',
				});
				console.log(err);
			});
	};

	const createAllSurveys = () => {
		snackbarController.open({
			type: 'success',
			message: 'Starting creating surveys',
		});
		httpsCallable(functions, 'createAllSurveys')()
			.then(() => {
				snackbarController.open({
					type: 'success',
					message: 'Succeeded.',
				});
			})
			.catch((err) => {
				snackbarController.open({
					type: 'error',
					message: 'Creation failed. Check console for details.',
				});
				console.log(err);
			});
	};

	return (
		<Box m="auto" display="flex" flexDirection={'column'}>
			<Container maxWidth={'md'} sx={{ my: 4 }}>
				<Grid container rowSpacing={5} columnSpacing={2}>
					<Grid item xs={12}>
						<Typography variant={'h4'}>Collection of Admin Scripts</Typography>
					</Grid>

					<Grid item xs={12} sm={4}>
						<Card
							variant="outlined"
							sx={{
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<CardActions>
								<Button onClick={batchImportStripeCharges} color="primary">
									Start batch import of stripe payments
								</Button>
							</CardActions>

							<CardContent>
								<Typography>
									New stripe payments are automatically added to firestore through a webhook. To sync existing ones one
									can use this batch import.
								</Typography>
							</CardContent>
						</Card>
					</Grid>
					<Grid item xs={12} sm={4}>
						<Card
							variant="outlined"
							sx={{
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<CardActions>
								<Button onClick={createAllSurveys} color="primary">
									Create survey entries for all recipients
								</Button>
							</CardActions>

							<CardContent>
								<Typography>Newly onboarded recipients should then automatically get the surveys.</Typography>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
}
