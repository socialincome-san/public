export const RECIPIENT_AGE_GROUPS = ['youth', 'youngAdults', 'middleAged', 'olderAdults'] as const;

export type RecipientAgeGroup = (typeof RECIPIENT_AGE_GROUPS)[number];

export const RECIPIENT_AGE_GROUP_BOUNDS: Record<
	RecipientAgeGroup,
	{
		minAge?: number;
		maxAge?: number;
	}
> = {
	youth: { minAge: 16, maxAge: 25 },
	youngAdults: { minAge: 26, maxAge: 35 },
	middleAged: { minAge: 36, maxAge: 55 },
	olderAdults: { minAge: 56 },
};
