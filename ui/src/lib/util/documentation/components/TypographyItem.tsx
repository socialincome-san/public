import classNames from 'classnames';

export interface DocTypographyItemProps extends React.PropsWithChildren {
	title: string;
	description: string;
}

/**
 * An util element for visual representation of Typography elements inside Storybook
 */
export const DocTypographyItem = ({ title, children, description }) => {
	return (
		<>
			<figure className="so-docs-typography-item__example text-right" aria-hidden>
				{children}
			</figure>
			<div className="so-docs-typography-item__text">
				<h2 className="so-docs-typography-item__title font-bold">{title}</h2>
				{description}
			</div>
		</>
	);
};
