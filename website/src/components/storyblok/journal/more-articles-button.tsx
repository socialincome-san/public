'use client';

import { Button } from '@/components/button';
import { switchToDefaultLanguageAction } from '@/lib/server-actions/i18n-actions';

type Props = {
	label: string;
	pathname: string;
};

export const MoreArticlesButton = ({ label, pathname }: Props) => (
	<div className="mt-10 flex justify-center">
		<form action={() => switchToDefaultLanguageAction(pathname)}>
			<Button type="submit" variant="outline">
				{label}
			</Button>
		</form>
	</div>
);
