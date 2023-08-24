export interface DocTypographyItemProps extends React.PropsWithChildren {
	title: string;
	description: string;
}

/**
 * An util element for visual representation of Typography elements inside Storybook
 */
export const DocTypographyItem = ({ title, children, description }: DocTypographyItemProps) => {
	return (
		<>
			<figure className="" aria-hidden>
				{children}
			</figure>
			<div>
				<h2 className="font-bold">{title}</h2>
				{description}
			</div>
		</>
	);
};
