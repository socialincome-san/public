import type { CountryCode } from '@/generated/prisma/enums';
import { CountryFlag as DesignSystemCountryFlag } from '@socialincome/design-system/country-flag/country-flag';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof DesignSystemCountryFlag>, 'country'> & {
	country: CountryCode;
};

export const CountryFlag = (props: Props) => <DesignSystemCountryFlag {...props} />;
