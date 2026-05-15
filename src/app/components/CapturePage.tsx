import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { LayoutType, Photo } from '../types';
import { captureFrameFromVideo } from '../lib/captureFrame';
import { getStripLayout, maxPhotosForLayout } from '../types';
import blueboothBg from './images/bluebooth-bg.png';
import snapButtonImg from '../../../cozy-photobooth/snap-button.png';
import snapButtonHoverImg from '../../../cozy-photobooth/snap-button-hover.png';
import { playShutterSound } from '../lib/sfx';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const STICKER_SRC = [
  '/app/images/cat2.png',
  '/app/images/hearts.png',
  '/app/images/camera.png',
];

type TimerChoice = 0 | 3 | 5;

const POST_CAPTURE_HOLD_MS = 1000;

interface CapturePageProps {
  layout: LayoutType;
  photos: Photo[];
  onAddPhoto: (dataUrl: string, replaceIndex?: number) => void;
  onBack: () => void;
  onComplete: () => void;
}

export function CapturePage({
  layout,
  photos,
  onAddPhoto,
  onBack,
  onComplete,
}: CapturePageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const postCaptureHoldRef = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [timerSec, setTimerSec] = useState<TimerChoice>(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shotPreviewUrl, setShotPreviewUrl] = useState<string | null>(null);
  const [snapHover, setSnapHover] = useState(false);
  const [retakeSlotIndex, setRetakeSlotIndex] = useState<number | null>(null);
  const photosRef = useRef<Photo[]>(photos);
  const retakeSlotRef = useRef<number | null>(null);
  photosRef.current = photos;
  retakeSlotRef.current = retakeSlotIndex;

  const maxPhotos = maxPhotosForLayout(layout);
  const photoCount = photos.length;
  const { captureSlotWidth, captureSlotHeight } = getStripLayout(layout);
  const slotAspect = captureSlotWidth / captureSlotHeight;

  const stripProgressGridClass =
    layout === 'strip6'
      ? 'grid grid-cols-3 grid-rows-2 gap-1.5 sm:gap-2'
      : layout === 'strip4'
        ? 'grid grid-cols-2 grid-rows-2 gap-1.5 sm:gap-2'
        : 'grid grid-cols-2 grid-rows-1 gap-1.5 sm:gap-2';

  const stripProgressWrapClass =
    layout === 'strip6'
      ? 'w-full max-w-[280px] shrink-0 space-y-2 sm:max-w-[320px] xl:max-w-[340px]'
      : layout === 'strip4'
        ? 'w-full max-w-[240px] shrink-0 space-y-2 sm:max-w-[260px] xl:max-w-[280px]'
        : 'w-full max-w-[220px] shrink-0 space-y-2 sm:max-w-[260px] xl:max-w-[280px]';

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current);
      }
      if (postCaptureHoldRef.current !== null) {
        window.clearTimeout(postCaptureHoldRef.current);
        postCaptureHoldRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => {});
        }
        setCameraError(null);
      } catch {
        if (!cancelled) {
          setCameraError('We could not access your camera. Please allow permission and try again.');
        }
      }
    };
    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const clearCountdownTimer = () => {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || isCapturing || (photoCount >= maxPhotos && retakeSlotIndex === null)) return;

    const finish = () => {
      const dataUrl = captureFrameFromVideo(video, captureSlotWidth, captureSlotHeight, { mirror: true });
      clearCountdownTimer();
      setCountdown(null);

      if (!dataUrl) {
        setIsCapturing(false);
        return;
      }

      playShutterSound();
      setShotPreviewUrl(dataUrl);

      if (postCaptureHoldRef.current !== null) {
        window.clearTimeout(postCaptureHoldRef.current);
      }
      const rt = retakeSlotRef.current;
      const snapCount = photosRef.current.length;
      const replaceAt = rt !== null && rt < snapCount ? rt : undefined;
      postCaptureHoldRef.current = window.setTimeout(() => {
        postCaptureHoldRef.current = null;
        onAddPhoto(dataUrl, replaceAt);
        setShotPreviewUrl(null);
        setIsCapturing(false);
        setRetakeSlotIndex(null);
      }, POST_CAPTURE_HOLD_MS);
    };

    setIsCapturing(true);
    clearCountdownTimer();

    if (timerSec === 0) {
      finish();
      return;
    }

    let left = timerSec;
    setCountdown(left);
    countdownTimerRef.current = window.setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearCountdownTimer();
        setCountdown(null);
        finish();
        return;
      }
      setCountdown(left);
    }, 1000);
  }, [
    captureSlotHeight,
    captureSlotWidth,
    isCapturing,
    maxPhotos,
    onAddPhoto,
    photoCount,
    retakeSlotIndex,
    timerSec,
  ]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-foreground"
      style={{
        backgroundImage: `url(${blueboothBg})`,
        backgroundSize: '1440px 1024px',
        backgroundRepeat: 'repeat',
      }}
    >
      {STICKER_SRC.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="pointer-events-none absolute opacity-90 drop-shadow-lg select-none"
          style={{
            width: `${64 + (i % 3) * 18}px`,
            top: `${12 + i * 18}%`,
            left: i % 2 === 0 ? `${4 + i * 6}%` : 'auto',
            right: i % 2 === 1 ? `${2 + i * 5}%` : 'auto',
            transform: `rotate(${-12 + i * 9}deg)`,
            animation: `floaty ${6 + i}s ease-in-out infinite`,
          }}
          draggable={false}
        />
      ))}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/50 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(96vw,88rem)] flex-col items-center px-4 pb-8 pt-4">
        <div className="flex w-full max-w-[min(94vw,80rem)] items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/70 px-4 py-2 text-xl shadow-sm backdrop-blur transition hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            Home
          </button>
          <p className="text-right text-2xl text-foreground drop-shadow-sm">
            {photoCount}/{maxPhotos} snaps
          </p>
        </div>

        <div className="mt-6 flex w-full flex-col items-center justify-center gap-6 lg:flex-row lg:flex-nowrap lg:items-start lg:justify-center lg:gap-10 xl:gap-12">
          <div className="mx-auto w-full max-w-[min(100%,40rem)] shrink-0 sm:max-w-[min(100%,44rem)] lg:mx-0 lg:w-[min(100%,92vw,48rem)] lg:max-w-[48rem] xl:w-[min(100%,92vw,52rem)] xl:max-w-[52rem]">
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              {cameraError ? (
                <div className="flex aspect-video min-h-[200px] w-full items-center justify-center bg-white/80 p-6 text-center text-xl">
                  {cameraError}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="aspect-video w-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                  playsInline
                  muted
                />
              )}

              {!cameraError && (
                <>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-36 bg-gradient-to-t from-black/50 to-transparent sm:h-40"
                    aria-hidden
                  />
                  <div className="absolute bottom-5 left-1/2 z-[5] -translate-x-1/2 sm:bottom-6">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={takePhoto}
                          onMouseEnter={() => setSnapHover(true)}
                          onMouseLeave={() => setSnapHover(false)}
                          disabled={
                            !!cameraError ||
                            (photoCount >= maxPhotos && retakeSlotIndex === null) ||
                            isCapturing
                          }
                          aria-label="Take photo"
                          className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-white bg-white/95 shadow-[0_12px_32px_rgba(0,0,0,0.38)] transition enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-24 sm:w-24"
                        >
                          <img
                            src={
                              snapHover &&
                              !cameraError &&
                              !isCapturing &&
                              (photoCount < maxPhotos || retakeSlotIndex !== null)
                                ? snapButtonHoverImg
                                : snapButtonImg
                            }
                            alt=""
                            className="h-14 w-14 object-contain sm:h-[4.25rem] sm:w-[4.25rem]"
                            draggable={false}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8}>
                        snap
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}

              {countdown !== null && (
                <div className="absolute inset-0 z-[20] flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
                  <span className="text-8xl font-normal text-white drop-shadow-lg">{countdown}</span>
                </div>
              )}

              {shotPreviewUrl && (
                <div className="absolute inset-0 z-[30] flex items-center justify-center bg-black/75">
                  <img
                    src={shotPreviewUrl}
                    alt=""
                    className="max-h-full max-w-full object-contain shadow-2xl"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full max-w-lg shrink-0 flex-col items-center gap-4 lg:w-[min(100%,20rem)] lg:max-w-none xl:w-[22rem]">
            <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
              <div className={stripProgressWrapClass}>
                <p className="text-center text-xs font-medium leading-tight text-foreground drop-shadow-sm sm:text-left sm:text-sm">
                  Strip — tap to retake
                </p>
                <div className={stripProgressGridClass}>
                  {Array.from({ length: maxPhotos }, (_, i) => {
                    const photo = photos[i];
                    const isNextEmpty = !photo && i === photoCount;
                    const isFutureEmpty = !photo && i > photoCount;
                    const selected = Boolean(photo) && retakeSlotIndex === i;

                    const baseShell =
                      'relative min-h-0 w-full min-w-0 overflow-hidden rounded-lg border-2 bg-card/60 backdrop-blur-sm transition';

                    if (photo) {
                      return (
                        <button
                          key={photo.id}
                          type="button"
                          disabled={isCapturing}
                          onClick={() => setRetakeSlotIndex((s) => (s === i ? null : i))}
                          className={`${baseShell} ${
                            selected
                              ? 'border-primary shadow-[0_0_0_2px_rgba(126,201,154,0.5)]'
                              : 'border-border/80 hover:border-primary'
                          } enabled:hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60`}
                          style={{ aspectRatio: slotAspect }}
                          aria-pressed={selected}
                          aria-label={
                            selected
                              ? `Retake slot ${i + 1} selected, tap again to cancel`
                              : `Photo ${i + 1}, tap to select for retake`
                          }
                        >
                          <img src={photo.url} alt="" className="size-full object-cover" draggable={false} />
                        </button>
                      );
                    }

                    return (
                      <div
                        key={`slot-${i}`}
                        className={`${baseShell} flex items-center justify-center border-dashed ${
                          isNextEmpty
                            ? 'border-primary/60 ring-1 ring-primary/25'
                            : 'border-muted-foreground/30 opacity-65'
                        } ${isFutureEmpty ? 'opacity-45' : ''}`}
                        style={{ aspectRatio: slotAspect }}
                      >
                        {isNextEmpty ? (
                          <span className="text-[11px] font-semibold text-primary sm:text-xs">Next</span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground sm:text-xs">{i + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex w-full min-w-0 max-w-[13rem] flex-col items-center sm:max-w-[14rem] sm:items-stretch">
                <p className="mb-2 w-full text-center text-lg font-medium text-foreground drop-shadow-sm sm:text-left xl:text-xl">
                  Timer
                </p>
                <div className="flex w-full max-w-[9.5rem] flex-col gap-1.5">
                  {([0, 3, 5] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setTimerSec(sec)}
                      disabled={isCapturing}
                      className={`w-fit rounded-full border-2 px-4 py-2.5 text-center text-base shadow-sm transition disabled:opacity-50 xl:py-3 xl:text-xl ${
                        timerSec === sec
                          ? 'border-primary bg-card text-foreground'
                          : 'border-primary/30 bg-card/70 text-foreground hover:bg-card'
                      }`}
                    >
                      {sec === 0 ? '0s' : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {retakeSlotIndex !== null ? (
              <p className="max-w-md text-pretty text-center text-base leading-snug text-foreground drop-shadow-sm lg:text-left">
                Retaking slot {retakeSlotIndex + 1} — snap when ready. Tap the thumbnail again to cancel.
              </p>
            ) : null}

            {photoCount >= maxPhotos ? (
              <div className="flex w-full max-w-[17rem] flex-col gap-2 self-center rounded-2xl border-2 border-primary/30 bg-card/60 p-4 backdrop-blur-sm sm:max-w-xs lg:self-start">
                <p className="text-pretty text-center text-sm text-muted-foreground sm:text-left">
                  Strip is full — retake any thumbnail, or continue.
                </p>
                <button
                  type="button"
                  onClick={onComplete}
                  className="inline-flex w-full min-w-0 items-center justify-center rounded-full border-2 border-primary bg-primary px-5 py-2.5 text-lg font-semibold text-primary-foreground shadow-md transition hover:brightness-105"
                >
                  Finish
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floaty {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -10px;
          }
        }
      `}</style>
    </div>
  );
}
