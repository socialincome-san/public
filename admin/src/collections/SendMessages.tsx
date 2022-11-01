import { EntityCollection, FireCMSContext, SelectionController, User } from "@camberi/firecms";
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

  const buttonClick = useCallback(() => {
    const messages = selectionController.selectedEntities.map((val) => val.values.text_krio).join(", ");
    alert(messages);
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
      onClick={buttonClick}
    >
      Send receipt confirmation request
    </Button>
  );
}

export default SendMessages;
