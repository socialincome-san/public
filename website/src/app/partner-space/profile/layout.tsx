import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  const breadcrumbLinks = [
    { href: '/', label: 'Website' },
    { href: '/partner-space/recipients', label: 'Partner Space' },
    { href: '/partner-space/profile', label: 'Profile' },
  ];

  return (
    <>
      <Breadcrumb links={breadcrumbLinks} />
      <h1 className="py-8 text-5xl">Profile</h1>
      {children}
    </>
  );
}
