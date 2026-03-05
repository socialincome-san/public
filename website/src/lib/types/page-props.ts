export type AnySearchParams = Record<string, string | string[] | undefined>;

export type SearchParamsPageProps = {
	searchParams: Promise<AnySearchParams>;
};
