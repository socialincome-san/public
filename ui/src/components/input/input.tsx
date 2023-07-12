import classNames from 'classnames';

interface InputProps {
	className?: string;
	placeholder?: string;
}

export function Input({ className, placeholder, ...props }: InputProps) {
	return <input placeholder={placeholder} className={classNames('input', className)} {...props} />;
}
