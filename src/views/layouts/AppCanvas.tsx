import type { PropsWithChildren } from 'react';
import { RoleNav } from '../components/shared/RoleNav';
import { ToastViewport } from '../components/ui/Toast';

export function AppCanvas({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-app text-slate-900">
      <RoleNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">{children}</main>
      <ToastViewport />
    </div>
  );
}
