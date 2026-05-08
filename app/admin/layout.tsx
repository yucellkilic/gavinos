import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Gavinos Pizza',
  description: 'Gavinos Pizza Management Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
