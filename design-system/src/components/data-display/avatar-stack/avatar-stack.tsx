import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar/avatar';

export type AvatarStackPerson = {
	name: string;
	imageSrc?: string;
};

const ringVariants = cva('ring-card rounded-full', {
	variants: {
		size: {
			xs: 'ring-2',
			sm: 'ring-2',
			default: 'ring-2',
			lg: 'ring-2',
			xl: 'ring-3',
		},
	},
});

type AvatarStackProps = VariantProps<typeof ringVariants> & {
	people: AvatarStackPerson[];
};

const initialsOf = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase();

export const AvatarStack = ({ people, size = 'lg' }: AvatarStackProps) => (
	<span className="flex -space-x-2" aria-hidden="true">
		{people.map((person) => (
			// The ring only separates overlapping faces
			<span key={person.name} className={people.length > 1 ? ringVariants({ size }) : undefined}>
				<Avatar size={size}>
					{person.imageSrc ? <AvatarImage src={person.imageSrc} alt="" /> : null}
					<AvatarFallback>{initialsOf(person.name)}</AvatarFallback>
				</Avatar>
			</span>
		))}
	</span>
);
