'use client';

import { switchToDefaultLanguageAction } from '@/modules/i18n/i18n.actions';
import { Button } from '@socialincome/design-system/actions/button/button';

type Props = {
	label: string;
	pathname: string;
};

export const MoreArticlesButton = ({ label, pathname }: Props) => (
	<div className="mt-10 flex justify-center">
		<form
			action={async () => {
				await switchToDefaultLanguageAction(pathname);
			}}
		>
			<Button type="submit" variant="outline">
				{label}
			</Button>
		</form>
	</div>
);
