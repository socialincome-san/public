import { Community } from '@/components/community/community';
import type { CommunityPanelData } from '@/modules/community/community.types';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

type CommunityRowProps = {
	data: CommunityPanelData;
};

export const CommunityRow = ({ data }: CommunityRowProps) => (
	<BlockWrapper marginTop="none" marginBottom="none">
		<div className="flex justify-end pt-9">
			<Community data={data} />
		</div>
	</BlockWrapper>
);
