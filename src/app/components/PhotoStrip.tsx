import { forwardRef } from 'react';
import { X } from 'lucide-react';
import type { LayoutType, Photo } from '../types';
import { getStripLayout } from '../types';

/** Footer is part of the cozy strip PNG; kept for callers that still import the constant. */
export const PHOTO_STRIP_FOOTER_HEIGHT_PX = 0;

interface PhotoStripProps {
  layout: LayoutType;
  photos: Photo[];
  onRemovePhoto?: (id: string) => void;
  readonly?: boolean;
}

export const PhotoStrip = forwardRef<HTMLDivElement, PhotoStripProps>(function PhotoStrip(
  { layout, photos, onRemovePhoto, readonly = false },
  ref,
) {
  const { width, height, templateSrc, slotRects } = getStripLayout(layout);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden shadow-lg"
      style={{
        width,
        height,
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      }}
    >
      {slotRects.map((rect, index) => {
        const photo = photos[index];
        return (
          <div
            key={index}
            className="group absolute z-0 box-border overflow-hidden"
            style={{
              top: `${rect.top * 100}%`,
              left: `${rect.left * 100}%`,
              width: `${rect.width * 100}%`,
              height: `${rect.height * 100}%`,
            }}
          >
            {photo ? (
              <>
                <picture
                  className={`absolute inset-0 block size-full ${readonly ? 'pointer-events-none select-none' : ''}`}
                >
                  <img src={photo.url} alt={`Photo ${index + 1}`} className="size-full object-cover" />
                </picture>
                {!readonly && onRemovePhoto ? (
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(photo.id)}
                    className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ width: '28px', height: '28px' }}
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        );
      })}

      <img
        src={templateSrc}
        alt=""
        className="pointer-events-none absolute inset-0 z-[1] size-full object-fill select-none"
        draggable={false}
      />
    </div>
  );
});

PhotoStrip.displayName = 'PhotoStrip';
