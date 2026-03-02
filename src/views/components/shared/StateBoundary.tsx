import type { ReactNode } from 'react';
import type { ScreenMode } from '../../../models/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

interface StateBoundaryProps {
  mode: ScreenMode;
  hasContent?: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  emptyTitle?: string;
  emptyText?: string;
  emptyAction?: ReactNode;
  errorTitle?: string;
  errorText?: string;
  onRetry?: () => void;
  fallbackContent?: ReactNode;
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function StateBoundary({
  mode,
  hasContent = true,
  children,
  skeleton,
  emptyTitle = 'Intet at vise endnu',
  emptyText = 'Der er ingen data i denne visning lige nu.',
  emptyAction,
  errorTitle = 'Noget gik galt',
  errorText = 'Prøv igen. Du kan fortsat se senest gemte oplysninger nedenfor.',
  onRetry,
  fallbackContent,
}: StateBoundaryProps) {
  if (mode === 'loading') {
    return <>{skeleton ?? <DefaultSkeleton />}</>;
  }

  if (mode === 'error') {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50" title={errorTitle} subtitle={errorText}>
          {onRetry ? (
            <Button onClick={onRetry} variant="secondary">
              Prøv igen
            </Button>
          ) : null}
        </Card>
        {fallbackContent ? <Card title="Senest gemte visning">{fallbackContent}</Card> : null}
      </div>
    );
  }

  if (mode === 'empty' || !hasContent) {
    return (
      <Card title={emptyTitle} subtitle={emptyText}>
        {emptyAction}
      </Card>
    );
  }

  return <>{children}</>;
}
