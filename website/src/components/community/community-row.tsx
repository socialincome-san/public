import { Community } from '@/components/community/community';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { CommunityPanelData } from '@/modules/community/community.types';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import type { ReactNode } from 'react';

type CommunityRowProps = {
	data: CommunityPanelData | null;
	lang: WebsiteLanguage;
	children?: ReactNode;
};

export const CommunityRow = ({ data, lang, children }: CommunityRowProps) => (
	<BlockWrapper disableMarginTop disableMarginBottom>
		<div className="flex flex-wrap items-center gap-4 pt-9">
			{children}
			{data ? (
				<div className="ms-auto">
					<Community data={data} lang={lang} />
				</div>
			) : null}
		</div>
	</BlockWrapper>
);
