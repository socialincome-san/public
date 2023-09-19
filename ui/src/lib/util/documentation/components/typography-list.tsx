import { DocTypographyItem, DocTypographyItemProps } from './typography-item';

export interface DocTypographyListProps {
	items: DocTypographyItemProps[];
}

export const DocTypographyList = ({ items }: DocTypographyListProps) => {
	return (
		<div className="grid gap-x-8 gap-y-4 rounded border p-10 shadow-sm">
			{items.map(({ children, ...itemProps }, index) => (
				<DocTypographyItem key={index} {...itemProps}>
					{children}
				</DocTypographyItem>
			))}
		</div>
	);
};
