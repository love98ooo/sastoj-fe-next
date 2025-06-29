import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type ContestLayoutProps = {
  children: ReactNode;
};

export default function ContestLayout({ children }: ContestLayoutProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
