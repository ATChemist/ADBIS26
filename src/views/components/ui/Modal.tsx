import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export function Modal({ open, title, children, onClose, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Luk dialog">
            Luk
          </Button>
        </div>
        <div className={cn('space-y-4 text-sm text-slate-700')}>{children}</div>
        {footer ? <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
