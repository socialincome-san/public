'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import { SurveyForm } from './survey-form';

type SurveyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId?: string;
  readOnly?: boolean;
};

export const SurveyFormDialog = ({ open, onOpenChange, surveyId, readOnly = false }: SurveyFormDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onError = (error?: unknown) => {
    setErrorMessage(`Error saving survey: ${error}`);
    logger.error('Survey Form Error', { error });
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setErrorMessage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{surveyId ? 'Edit Survey' : 'Add Survey'}</DialogTitle>
        </DialogHeader>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
          </Alert>
        )}
        <SurveyForm
          surveyId={surveyId}
          readOnly={readOnly}
          onSuccess={() => {
            onOpenChange(false);
          }}
          onError={onError}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
