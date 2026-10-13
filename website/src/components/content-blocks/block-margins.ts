import { type BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { type ComponentProps } from 'react';

type BlockMargin = NonNullable<ComponentProps<typeof BlockWrapper>['marginTop']>;

type MarginFields = {
	marginTop?: '' | BlockMargin;
	marginBottom?: '' | BlockMargin;
	disableMarginTop?: boolean;
	disableMarginBottom?: boolean;
};

// Storyblok stores an unselected option as ''. Content saved before the
// margin fields existed only has the disableMargin* booleans; drop that
// fallback once all stories are migrated (#3119).
const resolveMargin = (margin: '' | BlockMargin | undefined, disabled: boolean | undefined) => {
	if (margin) {
		return margin;
	}

	return disabled ? 'none' : undefined;
};

export const blockMargins = ({ marginTop, marginBottom, disableMarginTop, disableMarginBottom }: MarginFields) => ({
	marginTop: resolveMargin(marginTop, disableMarginTop),
	marginBottom: resolveMargin(marginBottom, disableMarginBottom),
});
