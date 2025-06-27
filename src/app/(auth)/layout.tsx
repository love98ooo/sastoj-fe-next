import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SASTOJ - Authentication',
  description: 'Login or register to SASTOJ Online Judge System',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
