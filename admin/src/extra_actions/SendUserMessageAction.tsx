import { CollectionActionsProps, useAuthController, useSnackbarController } from '@camberi/firecms';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import { MessageTemplate } from '@socialincome/shared/src/types';
import {
	Box,
	Button,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Modal,
	Select,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	TextField
} from '@mui/material';
import { Recipient } from '@socialincome/shared/src/types';

import { getFunctions, httpsCallable } from 'firebase/functions';
import _ from 'lodash';
import React from 'react';
import { SendMessagesFunctionProps } from '../../../functions/src/messages/sendMessagesFunction';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	height: 500,
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
};


export function SendUserMessageAction({ selectionController }: CollectionActionsProps<Recipient>) {
	const snackbarController = useSnackbarController();
	const [contentType, setContentType] = React.useState<string>("template");
	const [freeTextContent, setFreeTextContent] = React.useState<string>("");
	const [messageTemplates, setMessageTemplates] = React.useState<{[key: string]: MessageTemplate}>({});
	const [selectedMessageTemplateId, setSelectedMessageTemplateId] = React.useState<string>();
	const [open, setOpen] = React.useState(false);

	const initializeMessageTemplates = async () => {
		const firestore = getFirestore();

		const querySnapshot = await getDocs(collection(firestore, "message-templates"));
		let tempMessageTemplates:{[key: string]: MessageTemplate} = {};
		querySnapshot.forEach((doc) => {
			tempMessageTemplates[doc.id as string] = doc.data() as MessageTemplate;
		});
		setMessageTemplates(tempMessageTemplates);
	}

	const isGlobalAdmin = useAuthController().extra?.isGlobalAdmin;

	const handleOpen = async () => {
		await initializeMessageTemplates();
		setOpen(true);

	}
	const handleClose = () => setOpen(false);

	const functions = getFunctions();
	
	const sendMessagesFunction = httpsCallable<SendMessagesFunctionProps, string>(
		functions,
		'sendMessages'
	);

	const onClick = async () => {

		const selectedEntities = selectionController?.selectedEntities;

		if ( contentType === "template" && selectedMessageTemplateId && selectedEntities?.length > 0) {
			activateMessageFunction({
				users: selectedEntities,
				contentType: contentType,
				messageTemplate: messageTemplates[selectedMessageTemplateId]
			})
		} else if ( contentType === "freeText" && freeTextContent.length > 0 && selectedEntities?.length > 0) {
			activateMessageFunction({
				users: selectedEntities,
				contentType: contentType,
				freeTextContent: freeTextContent
			});
		} else {
			snackbarController.open({
				type: 'error',
				message: `Please select a template, a channel and entries to send messagers.`,
			});
		}		
	};

	const activateMessageFunction = (payload: SendMessagesFunctionProps) => {
		sendMessagesFunction(payload)
			.then((result) => {
				snackbarController.open({
					type: 'success',
					message: result.data,
				});
			})
			.catch(() => {
				snackbarController.open({
					type: 'error',
					message: `An error occurred during sending of messages.`,
				});
			});
	}

	return (
		<div>
			{isGlobalAdmin ? (
				<Button onClick={handleOpen} color="primary">
					Send Message
				</Button>
			) : null}
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography sx={{ m: 1 }} variant="h6">
						{' '}
						Send messages to contributors
					</Typography>
					<ToggleButtonGroup
						color="primary"
						value={contentType}
						exclusive
						onChange={(e, v) => setContentType(v as string)}
						aria-label="Platform"
						>
						<ToggleButton value="template">Templates</ToggleButton>
						<ToggleButton value="freeText">Free Text</ToggleButton>
					</ToggleButtonGroup>
					{
						contentType === "template" ?
						(<div>
							<Typography sx={{ m: 1 }} variant="subtitle1">
							{' '}
							Please specify a template:
							</Typography>
							<FormControl sx={{ m: 1, minWidth: 300 }} size="small">
								<InputLabel id="demo-select-small">Message Template</InputLabel>
								<Select label="Message Template" value={selectedMessageTemplateId} onChange={(e) => setSelectedMessageTemplateId(e.target.value as string)}>
									{_.map(messageTemplates, (value, key) => (								
										<MenuItem key={key} value={key}>
											{(value as MessageTemplate).title}
										</MenuItem>
									))}
								</Select>
							</FormControl> <br></br>
							{ (selectedMessageTemplateId != null) ? (
								<div>
									<Typography sx={{ m: 1 }} variant="body2">
										English translation of message:
										<i> { messageTemplates[selectedMessageTemplateId].translation_default_en } </i>
									</Typography>
								</div>
							) : null
							}
						</div>)
						: (
							<div>
								<Typography sx={{ m: 1 }} variant="subtitle1">
									{' '}
									Enter a free text to send:
								</Typography>
								<TextField
									sx={{ m: 1 }} 
									size="small"
									fullWidth	
									id="outlined-textarea"
									label="Free text"
									placeholder="Enter your free text here"
									multiline
									onChange={(e) => {setFreeTextContent(e.target.value as string)}}
								/>
							</div>
							

						)
					}
					
					<Button onClick={onClick} color="primary">
						Send message
					</Button>
				</Box>
			</Modal>
		</div>
	);
}
