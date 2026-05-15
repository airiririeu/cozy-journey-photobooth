import type { LayoutType } from '../types';
import strip2Thumb from '../../../cozy-photobooth/strip-2.png';
import strip4Thumb from '../../../cozy-photobooth/strip-3.png';
import strip6Thumb from '../../../cozy-photobooth/strip-6.png';

interface LayoutSelectorProps {
  selected: LayoutType;
  onChange: (layout: LayoutType) => void;
}

const layouts: { type: LayoutType; name: string; desc: string; thumb: string }[] = [
  { type: 'strip2', name: '2 snaps', desc: 'Two photos on one strip', thumb: strip2Thumb },
  { type: 'strip4', name: '4 snaps', desc: 'Four photos on one strip', thumb: strip4Thumb },
  { type: 'strip6', name: '6 snaps', desc: 'Six photos in a grid', thumb: strip6Thumb },
];

export function LayoutSelector({ selected, onChange }: LayoutSelectorProps) {
  return (
    <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {layouts.map((layout) => (
        <button
          key={layout.type}
          type="button"
          onClick={() => onChange(layout.type)}
          className={`rounded-2xl border-2 p-3 text-left transition-all ${
            selected === layout.type
              ? 'border-primary bg-primary/80 shadow-md'
              : 'border-primary bg-secondary/50 hover:border-primary/80'
          }`}
        >
          <div className="mb-2 flex h-32 items-center justify-center overflow-hidden rounded-sm bg-muted/80 p-1">
            <img
              src={layout.thumb}
              alt=""
              className="max-h-full max-w-full object-contain object-center"
              draggable={false}
            />
          </div>
          <div className="text-lg text-foreground">{layout.name}</div>
          <div className="mt-1 text-base text-muted-foreground">{layout.desc}</div>
        </button>
      ))}
    </div>
  );
}
