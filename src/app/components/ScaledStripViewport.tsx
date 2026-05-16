import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScaledStripViewportProps {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}

/** Scales a fixed-size strip frame to fit narrow viewports without horizontal overflow. */
export function ScaledStripViewport({ width, height, children, className }: ScaledStripViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const available = el.clientWidth;
      setScale(available > 0 ? Math.min(1, available / width) : 1);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={containerRef} className={className ?? 'mx-auto mt-4 w-full max-w-full'}>
      <div className="relative mx-auto" style={{ width: width * scale, height: height * scale }}>
        <div
          className="absolute left-1/2 top-0 origin-top"
          style={{
            width,
            height,
            transform: `translateX(-50%) scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
