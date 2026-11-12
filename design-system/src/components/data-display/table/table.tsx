import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';
import { type WithoutClassName } from '../../../without-class-name';

type TableProps = WithoutClassName<ComponentProps<'table'>> & {
	/** Read by the cells through the group/table data attribute */
	size?: 'sm' | 'default' | 'lg';
	stickyHeader?: boolean;
	/** fixed: column widths come from the header row, so content added later (such as an expanded row) cannot shift them */
	layout?: 'auto' | 'fixed';
};

const Table = ({ size = 'default', stickyHeader = false, layout = 'auto', ...props }: TableProps) => (
	<div className={stickyHeader ? 'relative w-full overflow-x-auto overflow-y-clip' : 'relative w-full overflow-auto'}>
		<table
			data-size={size}
			className={`group/table w-full caption-bottom border-separate border-spacing-0 text-sm ${layout === 'fixed' ? 'table-fixed' : ''}`}
			{...props}
		/>
	</div>
);

const TableHeader = ({ sticky = false, ...props }: WithoutClassName<ComponentProps<'thead'>> & { sticky?: boolean }) => (
	<thead className={sticky ? 'bg-muted sticky top-0 z-10' : 'bg-muted'} {...props} />
);

const TableBody = (props: WithoutClassName<ComponentProps<'tbody'>>) => (
	<tbody className="[&>tr:last-child>*]:border-b-0" {...props} />
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

const cellVariants = cva('border-b align-middle', {
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
			content: 'text-foreground py-2 font-bold',
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
		className={`${cellVariants({ width, verticalAlign })} p-2 group-data-[size=lg]/table:h-16 group-data-[size=sm]/table:py-1.5`}
		{...props}
	/>
);

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
