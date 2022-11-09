import { EntityCollection, FireCMSContext, SelectionController, User } from "@camberi/firecms";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { MessageTemplate } from '@socialincome/shared/types';

interface IProps {
  path: string;
  collection: EntityCollection<MessageTemplate>;
  selectionController: SelectionController<MessageTemplate>;
  context: FireCMSContext<User>;
}

const SendMessages = ({ path, collection, selectionController, context }: IProps) => {
  const [areAnyUsersSelected, setAreAnyUsersSelected] = useState(false);
  const [isWritingSendMessagesRequest, setIsWritingSendMessagesRequest] = useState(false);

  const sendMessagesButtonClick = useCallback(() => {
    const selectedMessageTemplates = selectionController.selectedEntities.map((val) => val.values);

    setIsWritingSendMessagesRequest(true);
		const sendMessagesFunction = httpsCallable(getFunctions(), 'sendMessagesFunction');
		sendMessagesFunction(selectedMessageTemplates)
			.then((res) => {
				console.log(res);
				setIsWritingSendMessagesRequest(false);
			})
			.catch((err) => {
				console.log(err);
				setIsWritingSendMessagesRequest(false);
			});
  }, [selectionController.selectedEntities]);

  useEffect(() => {
    const selectedUsers = selectionController.selectedEntities;
    setAreAnyUsersSelected(selectedUsers && selectedUsers.length > 0);
  }, [selectionController.selectedEntities]);

  return (
    <Button
      variant="outlined"
      color="warning"
      disabled={!areAnyUsersSelected && !isWritingSendMessagesRequest}
      onClick={sendMessagesButtonClick}
    >
      Send selected messages
    </Button>
  );
}

export default SendMessages;
