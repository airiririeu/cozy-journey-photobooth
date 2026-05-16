const STRIP_FOLDER = 'cozy-booth-strips';

export function isStripUploadConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  );
}

export function buildStripSaveUrl(stripId: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const withSlash = base.endsWith('/') ? base : `${base}/`;
  return new URL(`save/${encodeURIComponent(stripId)}`, `${window.location.origin}${withSlash}`).href;
}

function cloudinaryImageUrl(publicId: string): string {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const segments = publicId.split('/').map(encodeURIComponent).join('/');
  return `https://res.cloudinary.com/${cloud}/image/upload/${segments}`;
}

export async function uploadStripPng(
  blob: Blob,
): Promise<{ stripId: string; saveUrl: string }> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', blob, 'strip.png');
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', STRIP_FOLDER);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(err?.error?.message ?? `Upload failed (${res.status})`);
  }

  const data = (await res.json()) as { public_id: string };
  const stripId = data.public_id;
  return { stripId, saveUrl: buildStripSaveUrl(stripId) };
}

export async function getStripImageUrl(stripId: string): Promise<string> {
  return cloudinaryImageUrl(stripId);
}
