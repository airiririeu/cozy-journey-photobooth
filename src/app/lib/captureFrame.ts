export function captureFrameFromVideo(
  video: HTMLVideoElement,
  targetWidth: number,
  targetHeight: number,
  options?: { scale?: number; mirror?: boolean },
): string {
  /** Higher = sharper frames on the strip (larger data URLs in memory). */
  const scale = options?.scale ?? 4;
  const mirror = options?.mirror ?? false;

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) {
    return '';
  }

  const targetAspect = targetWidth / targetHeight;
  const vidAspect = vw / vh;
  let sx = 0;
  let sy = 0;
  let sw = vw;
  let sh = vh;

  if (vidAspect > targetAspect) {
    sw = vh * targetAspect;
    sx = (vw - sw) / 2;
    sy = 0;
    sh = vh;
  } else {
    sh = vw / targetAspect;
    sx = 0;
    sy = (vh - sh) / 2;
    sw = vw;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(targetWidth * scale);
  canvas.height = Math.round(targetHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.97);
}
