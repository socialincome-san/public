import { DocTypographyItem, DocTypographyItemProps } from './typography-item';

export interface DocTypographyListProps {
	items: DocTypographyItemProps[];
}

export const DocTypographyList = ({ items }: DocTypographyListProps) => {
	return (
		<div className="grid gap-y-4 gap-x-8 rounded shadow-sm border p-10">
			{items.map(({ children, ...itemProps }, index) => (
				<DocTypographyItem key={index} {...itemProps}>
					{children}
				</DocTypographyItem>
			))}
		</div>
	);
};
