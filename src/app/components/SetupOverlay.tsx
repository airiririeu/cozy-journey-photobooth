import { useEffect } from 'react';
import type { LayoutType } from '../types';
import { LayoutSelector } from './LayoutSelector';

interface SetupOverlayProps {
  open: boolean;
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  onContinue: () => void;
  onClose: () => void;
}

export function SetupOverlay({
  open,
  layout,
  onLayoutChange,
  onContinue,
  onClose,
}: SetupOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close setup"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-title"
        className="relative z-10 flex max-h-[min(90dvh,100%)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border-4 border-primary/35 bg-gradient-to-br from-card/95 via-primary/10 to-secondary/30 shadow-2xl backdrop-blur-sm sm:rounded-3xl"
      >
        <div className="overflow-y-auto p-5 sm:p-6">
          <h2 id="setup-title" className="text-center text-2xl text-foreground sm:text-3xl">
            Before we snap
          </h2>
          <p className="mt-1 text-center text-base text-muted-foreground sm:text-lg">
            Pick your strip layout
          </p>

          <div className="mt-6">
            <section>
              <h3 className="mb-3 text-lg text-foreground sm:text-xl">Strip</h3>
              <LayoutSelector selected={layout} onChange={onLayoutChange} />
            </section>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-border/40 p-5 pt-4 sm:flex-row sm:justify-end sm:p-6 sm:pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-border bg-card px-5 py-2 text-lg text-muted-foreground shadow-sm transition hover:bg-muted/50 sm:px-6 sm:text-xl"
          >
            Not yet
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-primary px-6 py-2 text-lg text-primary-foreground shadow-md transition hover:brightness-105 sm:px-8 sm:text-xl"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
