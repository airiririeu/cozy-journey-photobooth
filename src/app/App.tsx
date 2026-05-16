import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { LandingPage } from './components/LandingPage';
import { SetupOverlay } from './components/SetupOverlay';
import { CapturePage } from './components/CapturePage';
import { ResultPage } from './components/ResultPage';
import { StripSavePage } from './components/StripSavePage';
import type { LayoutType, Photo } from './types';
import { maxPhotosForLayout } from './types';
import { canvasToPngBlob } from './lib/downloadBlob';
import { clearStripPngBlob, stashStripPngBlob } from './lib/stripExportDb';
import { isStripUploadConfigured, uploadStripPng } from './lib/uploadStrip';

type Phase = 'landing' | 'capture' | 'result';

/** html2canvas raster multiplier — higher = sharper PNG (more memory). */
const STRIP_EXPORT_SCALE = 4;

function BoothApp() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [setupOpen, setSetupOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('strip4');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const stripRef = useRef<HTMLDivElement>(null);
  const stripPngBlobRef = useRef<Blob | null>(null);
  const [stripPreviewUrl, setStripPreviewUrl] = useState<string | null>(null);
  const [stripSaveUrl, setStripSaveUrl] = useState<string | null>(null);
  const [stripUploading, setStripUploading] = useState(false);
  const [stripUploadError, setStripUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== 'result') {
      stripPngBlobRef.current = null;
      setStripPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setStripSaveUrl(null);
      setStripUploading(false);
      setStripUploadError(null);
      void clearStripPngBlob();
    }
  }, [phase]);

  const addPhoto = useCallback(
    (dataUrl: string, replaceIndex?: number) => {
      setPhotos((prev) => {
        const max = maxPhotosForLayout(layout);
        if (replaceIndex !== undefined) {
          if (replaceIndex < 0 || replaceIndex >= max || replaceIndex >= prev.length) return prev;
          const next = [...prev];
          next[replaceIndex] = { id: `${Date.now()}-r${replaceIndex}`, url: dataUrl };
          return next;
        }
        if (prev.length >= max) return prev;
        return [...prev, { id: `${Date.now()}-${prev.length}`, url: dataUrl }];
      });
    },
    [layout],
  );

  const handleCompleteCapture = useCallback(() => {
    setPhase((p) => (p === 'capture' ? 'result' : p));
  }, []);

  const captureStripToBlob = useCallback(async (): Promise<Blob | null> => {
    if (!stripRef.current) return null;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(stripRef.current, {
      backgroundColor: null,
      scale: STRIP_EXPORT_SCALE,
      useCORS: true,
      logging: false,
    });
    return canvasToPngBlob(canvas);
  }, []);

  const handleStripPrintComplete = useCallback(async () => {
    if (!stripRef.current) return;
    try {
      const blob = await captureStripToBlob();
      if (!blob) return;
      const pngBlob = new Blob([await blob.arrayBuffer()], { type: 'image/png' });
      stripPngBlobRef.current = pngBlob;
      const url = URL.createObjectURL(pngBlob);
      setStripPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });

      if (isStripUploadConfigured()) {
        setStripUploading(true);
        setStripUploadError(null);
        try {
          const { saveUrl } = await uploadStripPng(pngBlob);
          setStripSaveUrl(saveUrl);
        } catch (err) {
          console.error(err);
          setStripUploadError('Could not upload strip for QR save. Try “Open strip to save” instead.');
        } finally {
          setStripUploading(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [captureStripToBlob]);

  const handleOpenStripViewer = useCallback(async () => {
    let blob = stripPngBlobRef.current;
    if (!blob && stripPreviewUrl) {
      try {
        const res = await fetch(stripPreviewUrl);
        blob = await res.blob();
      } catch {
        window.alert('Could not read the strip image. Try again.');
        return;
      }
    }
    if (!blob) return;
    try {
      await stashStripPngBlob(blob);
    } catch {
      window.alert('Could not prepare the strip for a new tab. Try again.');
      return;
    }
    const base = import.meta.env.BASE_URL ?? '/';
    const withSlash = base.endsWith('/') ? base : `${base}/`;
    const viewerPath = `${withSlash}strip-view.html`;
    const viewerUrl = new URL(viewerPath, window.location.origin).href;
    const w = window.open(viewerUrl, '_blank', 'noopener,noreferrer');
    if (!w) {
      window.alert('Pop-up was blocked. Allow pop-ups for this site, then try again.');
    }
  }, [stripPreviewUrl]);

  const handleNewStrip = () => {
    void clearStripPngBlob();
    setPhotos([]);
    setPhase('landing');
    setSetupOpen(false);
  };

  const handleBackFromCapture = () => {
    setPhotos([]);
    setPhase('landing');
  };

  const handleContinueSetup = () => {
    setSetupOpen(false);
    setPhotos([]);
    setPhase('capture');
  };

  return (
    <>
      {phase === 'landing' && (
        <div
          className={
            setupOpen
              ? 'min-h-screen blur-[6px] brightness-[0.92] transition-[filter] duration-200'
              : 'min-h-screen transition-[filter] duration-200'
          }
        >
          <LandingPage onSnapNow={() => setSetupOpen(true)} />
        </div>
      )}

      <SetupOverlay
        open={phase === 'landing' && setupOpen}
        layout={layout}
        onLayoutChange={setLayout}
        onContinue={handleContinueSetup}
        onClose={() => setSetupOpen(false)}
      />

      {phase === 'capture' && (
        <CapturePage
          layout={layout}
          photos={photos}
          onAddPhoto={addPhoto}
          onBack={handleBackFromCapture}
          onComplete={handleCompleteCapture}
        />
      )}

      {phase === 'result' && (
        <ResultPage
          stripRef={stripRef}
          layout={layout}
          photos={photos}
          stripPreviewUrl={stripPreviewUrl}
          stripSaveUrl={stripSaveUrl}
          stripUploading={stripUploading}
          stripUploadError={stripUploadError}
          qrEnabled={isStripUploadConfigured()}
          onStripPrintComplete={handleStripPrintComplete}
          onOpenStripViewer={handleOpenStripViewer}
          onNewStrip={handleNewStrip}
        />
      )}
    </>
  );
}

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL ?? '/';
  const trimmed = base.replace(/\/$/, '');
  return trimmed || undefined;
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route path="/" element={<BoothApp />} />
        <Route path="/save/:stripId" element={<StripSavePage />} />
      </Routes>
    </BrowserRouter>
  );
}
