import LinkIcon from '@mui/icons-material/Link';
import { IconButton, Tooltip } from '@mui/material';

/**
 * Small icon with tooltip to copy the given string into the clipboard.
 * Can be e.g. used in an additional custom column.
 */
export default (props: CopyToClipboardProps) => {
	return (
		<Tooltip title={props.title ? props.title : 'Copy'}>
			<IconButton
				color={'inherit'}
				size={'small'}
				onClick={(e) => {
					e.stopPropagation();
					navigator.clipboard.writeText(props.data);
				}}
			>
				<LinkIcon fontSize={'small'} />
			</IconButton>
		</Tooltip>
	);
};

export interface CopyToClipboardProps {
	data: string;
	title?: string;
}
