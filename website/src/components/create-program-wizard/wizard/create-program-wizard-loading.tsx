'use client';

import { SpinnerIcon } from '@socialincome/ui';

export const WizardLoading = () => {
  return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <SpinnerIcon className="h-6 w-6 animate-spin" />
    </div>
  );
};
