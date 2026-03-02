import type { PropsWithChildren, ReactNode } from 'react';
import type { ScreenKey } from '../../models/types';
import { cn } from '../../utils/cn';
import { DemoControls } from '../components/shared/DemoControls';
import { OfflineBanner } from '../components/shared/OfflineBanner';
import { useAppState } from '../../models/store';

interface ScreenFrameProps extends PropsWithChildren {
  screenKey: ScreenKey;
  mobile?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function ScreenFrame({ screenKey, mobile, header, footer, className, children }: ScreenFrameProps) {
  const state = useAppState();

  return (
    <div className={cn('grid gap-4', className)}>
      <DemoControls screenKey={screenKey} />
      <OfflineBanner offline={state.offline} lastSyncedAt={state.lastSyncedAt} />
      <div className={cn(mobile ? 'mx-auto w-full max-w-md' : 'w-full')}>
        <div
          className={cn(
            'grid gap-4',
            mobile &&
              'rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur sm:p-5',
          )}
        >
          {header}
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
