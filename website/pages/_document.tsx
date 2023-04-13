import createEmotionServer from '@emotion/server/create-instance';
import { AppType } from 'next/app';
import Document, { DocumentContext, DocumentProps, Head, Html, Main, NextScript } from 'next/document';
import * as React from 'react';
import theme from '../theme/theme';
import createEmotionCache from '../utils/createEmotionCache';
import { SiAppProps } from './_app';

interface MyDocumentProps extends DocumentProps {
	emotionStyleTags: JSX.Element[];
}

export default function MyDocument({ emotionStyleTags }: MyDocumentProps) {
	return (
		// todo change me
		<Html lang="en">
			<Head>
				<meta name="theme-color" content={theme.palette.primary.main} />
				<link rel="shortcut icon" href="/favicon.ico" />
				<meta name="emotion-insertion-point" content="" />
				{emotionStyleTags}
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx: DocumentContext) => {
	// Resolution order
	//
	// On the server:
	// 1. app.getInitialProps
	// 2. page.getInitialProps
	// 3. document.getInitialProps
	// 4. app.render
	// 5. page.render
	// 6. document.render
	//
	// On the server with error:
	// 1. document.getInitialProps
	// 2. app.render
	// 3. page.render
	// 4. document.render
	//
	// On the client
	// 1. app.getInitialProps
	// 2. page.getInitialProps
	// 3. app.render
	// 4. page.render

	const originalRenderPage = ctx.renderPage;
	const cache = createEmotionCache();
	const { extractCriticalToChunks } = createEmotionServer(cache);

	ctx.renderPage = () =>
		originalRenderPage({
			enhanceApp: (App: React.ComponentType<React.ComponentProps<AppType> & SiAppProps>) =>
				function EnhanceApp(props) {
					return <App emotionCache={cache} {...props} />;
				},
		});

	const initialProps = await Document.getInitialProps(ctx);
	// This is important. It prevents Emotion to render invalid HTML.
	// See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
	const emotionStyles = extractCriticalToChunks(initialProps.html);
	const emotionStyleTags = emotionStyles.styles.map((style) => (
		<style
			data-emotion={`${style.key} ${style.ids.join(' ')}`}
			key={style.key}
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={{ __html: style.css }}
		/>
	));

	return {
		...initialProps,
		emotionStyleTags,
	};
};
