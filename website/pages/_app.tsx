import { CacheProvider, EmotionCache } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextPage } from 'next';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ReactElement, ReactNode } from 'react';
import '../theme/global.css';
import theme from '../theme/theme';
import createEmotionCache from '../utils/createEmotionCache';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const SiApp = (props: SiAppProps) => {
	const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
	const queryClient = new QueryClient();

	// Use the custom layout defined at the page level, if available
	const getLayout = Component.getLayout ?? ((page) => page);

	return (
		<CacheProvider value={emotionCache}>
			<QueryClientProvider client={queryClient}>
				<Head>
					<meta name="viewport" content="initial-scale=1, width=device-width" />
				</Head>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					{getLayout(<Component {...pageProps} />)}
				</ThemeProvider>
			</QueryClientProvider>
		</CacheProvider>
	);
};

export interface SiAppProps extends AppProps {
	emotionCache?: EmotionCache;
	Component: NextPageWithLayout;
}
type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode;
};

export default appWithTranslation(SiApp);
