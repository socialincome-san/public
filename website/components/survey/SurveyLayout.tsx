import { Box, Container } from '@mui/material';
import { SnackbarProvider } from 'notistack';
// @ts-ignore
import config from '../../config';
import LanguageSwitcher from '../LanguageSwitcher';

export default function SurveyLayout({ children }: SurveyLayoutProps) {
	return (
		<SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }} autoHideDuration={2000}>
			<Box sx={{ backgroundColor: '#f3f3f3', paddingTop: 5 }}>
				<Container maxWidth={'sm'}>
					<Box sx={{ margin: '16px' }}>
						<LanguageSwitcher languages={config.surveyLanguages} fallbackIsoCode={config.defaultIsoCode} />
					</Box>
					{children}
				</Container>
			</Box>
		</SnackbarProvider>
	);
}

interface SurveyLayoutProps {
	children: React.ReactNode;
}
