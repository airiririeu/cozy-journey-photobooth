import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { downloadBlob } from '../lib/downloadBlob';
import { getStripImageUrl, isStripUploadConfigured } from '../lib/uploadStrip';

type LoadState = 'loading' | 'ready' | 'error';

export function StripSavePage() {
  const { stripId: stripIdParam } = useParams<{ stripId: string }>();
  const stripId = stripIdParam ? decodeURIComponent(stripIdParam) : undefined;
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!stripId) {
      setLoadState('error');
      setErrorMessage('This link is missing a strip id.');
      return;
    }
    if (!isStripUploadConfigured()) {
      setLoadState('error');
      setErrorMessage('Photo storage is not configured on this site.');
      return;
    }

    let cancelled = false;
    void getStripImageUrl(stripId)
      .then((url) => {
        if (cancelled) return;
        setImageUrl(url);
        setLoadState('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState('error');
        setErrorMessage(
          'Could not find this strip. The link may have expired or the upload may still be finishing.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [stripId]);

  const handleDownload = async () => {
    if (!imageUrl || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      downloadBlob(blob, `cozy-booth-strip-${stripId ?? 'photo'}.png`);
    } catch {
      window.alert('Download failed. Long-press the image to save it instead.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-background text-foreground"
      style={{
        backgroundImage:
          'linear-gradient(165deg, color-mix(in srgb, var(--background) 92%, #1a2e24) 0%, color-mix(in srgb, var(--background) 88%, #2a2438) 100%)',
      }}
    >
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center gap-5 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:gap-6 sm:py-10">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl">Your photo strip</h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            {loadState === 'ready'
              ? 'Save it to your camera roll or share it with friends.'
              : loadState === 'loading'
                ? 'Loading your strip…'
                : 'Something went wrong'}
          </p>
        </header>

        {loadState === 'loading' ? (
          <p className="text-muted-foreground">One moment…</p>
        ) : null}

        {loadState === 'error' && errorMessage ? (
          <p className="max-w-sm text-center text-destructive">{errorMessage}</p>
        ) : null}

        {loadState === 'ready' && imageUrl ? (
          <>
            <picture className="block w-full max-w-md">
              <img
                src={imageUrl}
                alt="Your photo strip"
                className="mx-auto max-h-[70vh] w-auto max-w-full rounded-xl shadow-[0_12px_40px_rgba(62,90,72,0.25)]"
              />
            </picture>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              On iPhone: tap and hold the image, then choose Save to Photos. On Android: use
              Download below or long-press the image.
            </p>
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={downloading}
              className="inline-flex w-full max-w-xs items-center justify-center rounded-full border-2 border-secondary bg-secondary px-6 py-3 text-lg font-semibold text-secondary-foreground shadow-sm transition hover:bg-secondary/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? 'Preparing download…' : 'Download strip'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
