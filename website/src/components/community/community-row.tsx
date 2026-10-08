import { Community } from '@/components/community/community';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { CommunityPanelData } from '@/modules/community/community.types';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

type CommunityRowProps = {
	data: CommunityPanelData;
	lang: WebsiteLanguage;
};

export const CommunityRow = ({ data, lang }: CommunityRowProps) => (
	<BlockWrapper disableMarginTop disableMarginBottom>
		<div className="flex justify-end pt-9">
			<Community data={data} lang={lang} />
		</div>
	</BlockWrapper>
);
