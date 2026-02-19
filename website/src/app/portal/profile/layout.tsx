import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';

import { ReactNode } from 'react';

type ProfileLayoutProps = {
  children: ReactNode;
};

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  const breadcrumbLinks = [
    { href: '/', label: 'Website' },
    { href: '/portal', label: 'Portal' },
    { href: '/portal/profile', label: 'Profile' },
  ];

  return (
    <>
      <Breadcrumb links={breadcrumbLinks} />
      <h1 className="py-8 text-5xl">Profile</h1>

      <Card>{children}</Card>
    </>
  );
}
