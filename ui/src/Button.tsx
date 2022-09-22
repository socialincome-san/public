import './button.css';

/**
 * Primary UI component for user interaction
 */
export const Button = ({ children, ...props }) => {
	return (
		<button type="button" className="bg-so-color-primary-1 uppercase tracking-wide" {...props}>
			{children}
		</button>
	);
};
