import strip2Src from '../../cozy-photobooth/strip-2.png';
/** Four-photo vertical template (file is named strip-3.png in assets). */
import strip4TemplateSrc from '../../cozy-photobooth/strip-3.png';
import strip6Src from '../../cozy-photobooth/strip-6.png';

export type LayoutType = 'strip2' | 'strip4' | 'strip6';

/** Slot positions as fractions of the template (0–1). */
export type SlotRect = { top: number; left: number; width: number; height: number };

const DISPLAY_W = 168;

const LAYOUTS: Record<
  LayoutType,
  {
    nativeW: number;
    nativeH: number;
    templateSrc: string;
    slotRects: SlotRect[];
  }
> = {
  strip2: {
    nativeW: 707,
    nativeH: 2000,
    templateSrc: strip2Src,
    slotRects: [
      { top: 0.038, left: 0.1, width: 0.8, height: 0.36 },
      { top: 0.418, left: 0.1, width: 0.8, height: 0.36 },
    ],
  },
  strip4: {
    nativeW: 1414,
    nativeH: 4000,
    templateSrc: strip4TemplateSrc,
    slotRects: [
      { top: 0.02, left: 0.1, width: 0.8, height: 0.168 },
      { top: 0.198, left: 0.1, width: 0.8, height: 0.168 },
      { top: 0.376, left: 0.1, width: 0.8, height: 0.168 },
      { top: 0.554, left: 0.1, width: 0.8, height: 0.168 },
    ],
  },
  strip6: {
    nativeW: 1333,
    nativeH: 1999,
    templateSrc: strip6Src,
    slotRects: (() => {
      const rows = 3;
      const cols = 2;
      const gt = 0.042;
      const gl = 0.055;
      const gw = 0.89;
      const gh = 0.64;
      const gapX = 0.035;
      const gapY = 0.02;
      const cellW = (gw - gapX * (cols - 1)) / cols;
      const cellH = (gh - gapY * (rows - 1)) / rows;
      const rects: SlotRect[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rects.push({
            top: gt + r * (cellH + gapY),
            left: gl + c * (cellW + gapX),
            width: cellW,
            height: cellH,
          });
        }
      }
      return rects;
    })(),
  },
};

export function getStripLayout(layout: LayoutType) {
  const L = LAYOUTS[layout];
  const height = (DISPLAY_W * L.nativeH) / L.nativeW;
  const first = L.slotRects[0];
  return {
    width: DISPLAY_W,
    height,
    slots: L.slotRects.length,
    templateSrc: L.templateSrc,
    slotRects: L.slotRects,
    captureSlotWidth: DISPLAY_W * first.width,
    captureSlotHeight: height * first.height,
  };
}

export function maxPhotosForLayout(layout: LayoutType) {
  return LAYOUTS[layout].slotRects.length;
}
