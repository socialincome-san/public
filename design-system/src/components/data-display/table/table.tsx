import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

type TableProps = WithoutClassName<ComponentProps<'table'>> & {
	/** Read by the cells through the group/table data attribute */
	size?: 'sm' | 'default' | 'lg';
	stickyHeader?: boolean;
	/** fixed: column widths come from the header row, so content added later (such as an expanded row) cannot shift them */
	layout?: 'auto' | 'fixed';
	/** `card` sets the table on a white panel, for pages with a tinted background. Read by the cells like `size`. */
	surface?: 'none' | 'card';
	/** Note or source shown below the table */
	caption?: ReactNode;
};

const Table = ({
	size = 'default',
	stickyHeader = false,
	layout = 'auto',
	surface = 'none',
	caption,
	...props
}: TableProps) => {
	const table = (
		// A sticky header sticks to its nearest scroll container, so the wrapper must not be one: with overflow-x set,
		// overflow-y can no longer stay visible or clip. The TableFrame or the page scrolls instead.
		<div
			className={cn(
				'relative w-full',
				!stickyHeader && 'overflow-auto',
				surface === 'card' && 'bg-card shadow-card rounded-xl border',
			)}
		>
			<table
				data-size={size}
				data-surface={surface}
				className={cn(
					'group/table w-full caption-bottom border-separate border-spacing-0 text-sm',
					layout === 'fixed' && 'table-fixed',
				)}
				{...props}
			/>
		</div>
	);

	if (!caption) {
		return table;
	}

	return (
		<figure className="w-full">
			{table}
			<figcaption className="text-muted-foreground mt-3 text-sm">{caption}</figcaption>
		</figure>
	);
};

type TableFrameProps = {
	children: ReactNode;
	/** sm: a tall table scrolls inside the frame, e.g. in a dialog; none: the frame grows with the table */
	maxHeight?: 'none' | 'sm';
};

/** A card-like panel around a table; wide tables scroll sideways inside it, and it is the scroll container a sticky header sticks to */
const TableFrame = ({ children, maxHeight = 'none' }: TableFrameProps) => (
	<div className={`bg-card overflow-x-auto rounded-xl border ${maxHeight === 'sm' ? 'max-h-96 overflow-y-auto' : ''}`}>
		{children}
	</div>
);

// The table sets the default size, so header and body can each step up on their own
const sectionTextSizes = {
	default: '',
	lg: 'text-base',
};

const tableHeaderVariants = cva('', {
	variants: {
		variant: {
			default: 'bg-muted',
			// CMS tables: a rule under the header instead of a fill, which only the card surface keeps
			content: 'group-data-[surface=card]/table:bg-muted [&>tr>*]:border-foreground/30',
		},
		sticky: {
			true: 'sticky top-0 z-10',
			false: '',
		},
		textSize: sectionTextSizes,
	},
	defaultVariants: {
		variant: 'default',
		sticky: false,
		textSize: 'default',
	},
});

const TableHeader = ({
	sticky,
	variant,
	textSize,
	...props
}: WithoutClassName<ComponentProps<'thead'>> & VariantProps<typeof tableHeaderVariants>) => (
	<thead className={tableHeaderVariants({ variant, sticky, textSize })} {...props} />
);

const TableBody = ({
	textSize = 'default',
	...props
}: WithoutClassName<ComponentProps<'tbody'>> & { textSize?: keyof typeof sectionTextSizes }) => (
	<tbody className={cn('[&>tr:last-child>*]:border-b-0', sectionTextSizes[textSize])} {...props} />
);

// Rows with an onClick handler get hover styles
const TableRow = (props: WithoutClassName<ComponentProps<'tr'>>) => (
	<tr
		className={
			props.onClick
				? 'group/row hover:bg-muted/60 data-[state=selected]:bg-muted cursor-pointer transition-colors'
				: 'group/row data-[state=selected]:bg-muted'
		}
		{...props}
	/>
);

const cellVariants = cva('border-b align-middle group-data-[surface=card]/table:px-4', {
	variants: {
		width: {
			auto: '',
			fit: 'w-px whitespace-nowrap',
			// For a radio, checkbox or icon button; `fit` would collapse to 1px in a fixed layout
			control: 'w-14',
		},
		verticalAlign: {
			middle: '',
			top: 'align-top',
		},
	},
	defaultVariants: {
		width: 'auto',
		verticalAlign: 'middle',
	},
});

type CellVariantProps = VariantProps<typeof cellVariants>;

const tableHeadVariants = cva('px-2 text-left', {
	variants: {
		variant: {
			default: 'text-muted-foreground h-10 font-medium whitespace-nowrap group-data-[size=sm]/table:h-9',
			// CMS tables: headers wrap and read like body text
			content: 'text-foreground py-2 font-bold group-data-[surface=card]/table:py-3',
			// Row labels in CMS tables: lighter than the column headers above them
			contentRow: 'text-foreground py-2 font-medium group-data-[surface=card]/table:py-3',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

const TableHead = ({
	width,
	verticalAlign,
	variant,
	...props
}: WithoutClassName<ComponentProps<'th'>> & CellVariantProps & VariantProps<typeof tableHeadVariants>) => (
	<th className={`${cellVariants({ width, verticalAlign })} ${tableHeadVariants({ variant })}`} {...props} />
);

const TableCell = ({ width, verticalAlign, ...props }: WithoutClassName<ComponentProps<'td'>> & CellVariantProps) => (
	<td
		className={`${cellVariants({ width, verticalAlign })} p-2 group-data-[size=lg]/table:h-16 group-data-[size=sm]/table:py-1.5 group-data-[surface=card]/table:py-3`}
		{...props}
	/>
);

export { Table, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow };
