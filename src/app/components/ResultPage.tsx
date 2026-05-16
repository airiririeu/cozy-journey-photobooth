import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { LayoutType, Photo } from '../types';
import { getStripLayout } from '../types';
import { printingSoundSrc } from '../lib/sfx';
import { PhotoStrip } from './PhotoStrip';
import { StripQrPanel } from './StripQrPanel';
import blueboothBg from './images/bluebooth-bg.png';

interface ResultPageProps {
  stripRef: RefObject<HTMLDivElement | null>;
  layout: LayoutType;
  photos: Photo[];
  /** Object URL of the full strip PNG — lets guests use the browser’s “Save Image As…” menu. */
  stripPreviewUrl: string | null;
  stripSaveUrl: string | null;
  stripUploading: boolean;
  stripUploadError: string | null;
  qrEnabled: boolean;
  onStripPrintComplete: () => void | Promise<void>;
  onOpenStripViewer: () => void | Promise<void>;
  onNewStrip: () => void;
}

export function ResultPage({
  stripRef,
  layout,
  photos,
  stripPreviewUrl,
  stripSaveUrl,
  stripUploading,
  stripUploadError,
  qrEnabled,
  onStripPrintComplete,
  onOpenStripViewer,
  onNewStrip,
}: ResultPageProps) {
  const [stripReady, setStripReady] = useState(false);
  const stripCaptureRequested = useRef(false);
  const [previewCapturePending, setPreviewCapturePending] = useState(false);
  const [printAnimMs, setPrintAnimMs] = useState<number | null>(null);
  const { width: stripWidth, height: totalHeight } = getStripLayout(layout);

  useEffect(() => {
    let cancelled = false;
    let printingFinished = false;
    const audio = new Audio(printingSoundSrc);

    const onDone = () => {
      if (cancelled || printingFinished) return;
      printingFinished = true;
      setStripReady(true);
    };

    const onMeta = () => {
      const raw = audio.duration;
      const ms = Number.isFinite(raw) && raw > 0 ? Math.ceil(raw * 1000) : 2800;
      if (cancelled) return;
      setPrintAnimMs(Math.max(400, ms));
      void audio.play().catch(() => onDone());
    };

    const onError = () => {
      if (cancelled) return;
      setPrintAnimMs(1);
      onDone();
    };

    audio.addEventListener('ended', onDone);
    audio.addEventListener('loadedmetadata', onMeta, { once: true });
    audio.addEventListener('error', onError, { once: true });
    audio.preload = 'metadata';
    audio.load();

    return () => {
      cancelled = true;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.removeEventListener('ended', onDone);
    };
  }, []);

  useLayoutEffect(() => {
    if (!stripReady || stripCaptureRequested.current) return;
    stripCaptureRequested.current = true;
    setPreviewCapturePending(true);
    void Promise.resolve(onStripPrintComplete()).finally(() => {
      setPreviewCapturePending(false);
    });
  }, [stripReady, onStripPrintComplete]);

  return (
    <div
      className="relative min-h-screen w-full px-4 py-10 text-foreground"
      style={{
        backgroundImage: `url(${blueboothBg})`,
        backgroundSize: '1440px 1024px',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-4xl drop-shadow-sm">
            {stripReady ? 'Your strip is ready!' : 'Printing your strip…'}
          </h1>
          <p className="mt-2 text-xl text-muted-foreground">
            {stripReady
              ? 'Save it, share it, or snap a whole new strip.'
              : 'Hold on — your photos are rolling out of the booth.'}
          </p>
        </header>

        <div className="flex w-full flex-col items-stretch justify-center gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex flex-1 justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="rounded-3xl border-4 border-primary/45 bg-gradient-to-b from-secondary/55 via-primary/25 to-secondary/55 p-5 shadow-[0_24px_48px_rgba(62,90,72,0.18)]">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {stripReady ? 'Output tray' : 'Printing'}
                </p>

                <div
                  className="relative mx-auto mt-4 overflow-hidden rounded-md bg-foreground/15 shadow-[inset_0_6px_16px_rgba(61,53,80,0.35)]"
                  style={{ width: stripWidth, height: totalHeight }}
                >
              {printAnimMs === null ? (
                <div className="flex size-full items-center justify-center bg-foreground/25">
                  <span className="text-sm font-medium text-primary-foreground/90">Preparing printer…</span>
                </div>
              ) : (
                <>
                  <div
                    className={
                      stripPreviewUrl
                        ? 'pointer-events-none absolute inset-0 origin-top opacity-0'
                        : 'origin-top'
                    }
                    style={{
                      width: stripWidth,
                      animation: stripPreviewUrl
                        ? 'none'
                        : `result-strip-print ${printAnimMs}ms cubic-bezier(0.25, 0.9, 0.32, 1) forwards`,
                    }}
                  >
                    <PhotoStrip
                      ref={stripRef}
                      layout={layout}
                      photos={photos}
                      readonly
                    />
                  </div>

                  {stripPreviewUrl ? (
                    <div className="absolute inset-0 z-10 rounded-sm bg-white">
                      <picture className="absolute inset-x-0 bottom-0 top-5 block w-full">
                        <img
                          src={stripPreviewUrl}
                          alt="Your complete photo strip — right-click to save"
                          className="h-full w-full object-contain object-top"
                        />
                      </picture>
                    </div>
                  ) : null}

                  {stripReady && previewCapturePending && !stripPreviewUrl ? (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-sm bg-foreground/40 px-3 text-center text-sm font-medium text-primary-foreground backdrop-blur-[2px]">
                      Preparing saveable strip…
                    </div>
                  ) : null}

                  {!stripReady && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/35 via-transparent to-transparent pb-4">
                      <span className="flex gap-1.5 rounded-full bg-card/90 px-4 py-2 text-sm font-medium text-foreground shadow-md backdrop-blur-sm">
                        <span className="inline-flex size-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                        <span className="inline-flex size-2 animate-bounce rounded-full bg-secondary [animation-delay:150ms]" />
                        <span className="inline-flex size-2 animate-bounce rounded-full bg-accent [animation-delay:300ms]" />
                      </span>
                    </div>
                  )}
                </>
              )}
                </div>
              </div>
            </div>
          </div>

          {qrEnabled ? (
            <div className="flex flex-1 flex-col items-center justify-center lg:items-start lg:pt-2">
              {stripReady ? (
                stripSaveUrl ? (
                  <StripQrPanel saveUrl={stripSaveUrl} />
                ) : stripUploading ? (
                  <div className="flex w-full max-w-xs flex-col items-center justify-center rounded-3xl border-2 border-border/80 bg-card/90 px-5 py-10 shadow-sm backdrop-blur-sm">
                    <p className="text-center text-sm text-muted-foreground">
                      Preparing QR code for your phone…
                    </p>
                  </div>
                ) : stripUploadError ? (
                  <div className="flex w-full max-w-xs flex-col items-center justify-center rounded-3xl border-2 border-destructive/40 bg-card/90 px-5 py-8 shadow-sm backdrop-blur-sm">
                    <p className="text-center text-sm text-destructive">{stripUploadError}</p>
                  </div>
                ) : (
                  <div className="flex w-full max-w-xs flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/60 bg-card/50 px-5 py-10">
                    <p className="text-center text-sm text-muted-foreground">
                      QR code will appear when your strip is ready
                    </p>
                  </div>
                )
              ) : (
                <div className="flex w-full max-w-xs flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/60 bg-card/50 px-5 py-10">
                  <p className="text-center text-sm text-muted-foreground">
                    Scan here to save on your phone
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex w-full max-w-2xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            disabled={!stripPreviewUrl}
            onClick={() => {
              void onOpenStripViewer();
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-secondary bg-secondary px-6 py-3 text-xl font-semibold text-secondary-foreground shadow-sm backdrop-blur-sm transition hover:bg-secondary/40 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[280px]"
          >
            Open strip to save
          </button>
          <button
            type="button"
            onClick={onNewStrip}
            disabled={!stripReady}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-6 py-3 text-2xl text-foreground shadow-sm transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[240px]"
          >
            Another strip
          </button>
        </div>
      </div>

      <style>{`
        @keyframes result-strip-print {
          from {
            transform: translateY(-92%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
