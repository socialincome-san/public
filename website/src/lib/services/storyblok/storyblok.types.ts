export type NavItem = {
	label: string;
	href: string;
	sections?: {
		title: string;
		items: { label: string; href: string }[];
	}[];
};
