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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        className="relative z-10 w-full max-w-lg rounded-3xl border-4 border-primary/35 bg-gradient-to-br from-card/95 via-primary/10 to-secondary/30 p-6 shadow-2xl backdrop-blur-sm"
      >
        <h2 id="setup-title" className="text-center text-3xl text-foreground">
          Before we snap
        </h2>
        <p className="mt-1 text-center text-lg text-muted-foreground">Pick your strip layout</p>

        <div className="mt-6">
          <section>
            <h3 className="mb-3 text-xl text-foreground">Strip</h3>
            <LayoutSelector selected={layout} onChange={onLayoutChange} />
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-border bg-card px-6 py-2 text-xl text-muted-foreground shadow-sm transition hover:bg-muted/50"
          >
            Not yet
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-primary px-8 py-2 text-xl text-primary-foreground shadow-md transition hover:brightness-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
