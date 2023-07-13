import classNames from 'classnames';
import { DefaultComponentProps } from '../index';

type InputProps = {
	placeholder?: string;
} & DefaultComponentProps;

export function Input({ className, placeholder, ...props }: InputProps) {
	return <input placeholder={placeholder} className={classNames('input', className)} {...props} />;
}
