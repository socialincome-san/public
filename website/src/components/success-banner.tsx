import { CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const SuccessBanner = ({ title, description, action }: Props) => {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-green-50 px-6 py-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="mt-1 h-5 w-5 text-green-600" />

        <div>
          <p className="font-semibold text-green-900">{title}</p>

          {description && <p className="text-sm text-green-900/80">{description}</p>}
        </div>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
};
