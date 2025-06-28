import { Metadata } from 'next';
import { GroupsPageClient } from './groups-client';

export const metadata: Metadata = {
  title: '用户组管理 - SASTOJ',
  description: 'SASTOJ 用户组管理',
};

// Server component that wraps the client component
export default function GroupsPage() {
  return <GroupsPageClient />;
}
