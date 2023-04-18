import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import { IconButton, Tooltip } from '@mui/material';
import { Entity, EntityCollection, SideEntityController } from 'firecms';

/**
 * Allows to open an entity in a side view
 */
export default (props: OpenDetailViewProps) => {
	return (
		<Tooltip title={`See details`}>
			<IconButton
				color={'inherit'}
				size={'small'}
				onClick={(e) => {
					e.stopPropagation();
					props.sideEntityController.open({
						entityId: props.entity.id,
						path: props.entity.path,
						collection: props.collection,
						updateUrl: true,
					});
				}}
			>
				<KeyboardTabIcon fontSize={'small'} />
			</IconButton>
		</Tooltip>
	);
};

export interface OpenDetailViewProps {
	entity: Entity<Partial<any>>;
	collection: EntityCollection;
	sideEntityController: SideEntityController;
}
