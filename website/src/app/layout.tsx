import { PropsWithChildren } from 'react';
import './globals.css';
import { QueryClientWrapper } from '@/app/query-client';

export const metadata = {
	title: 'Social Income',
	description: 'Social Income brings Universal Basic Income to the Global South.',
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html>
			<body>
				<QueryClientWrapper>{children}</QueryClientWrapper>
			</body>
		</html>
	);
}
