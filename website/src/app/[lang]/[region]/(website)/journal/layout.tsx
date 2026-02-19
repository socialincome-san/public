import { PreviewIndicator } from '@/components/legacy/storyblok/PreviewIndicator';
import { ReactNode } from 'react';

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <PreviewIndicator />
      {children}
    </div>
  );
}
