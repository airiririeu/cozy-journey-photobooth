import QRCode from 'react-qr-code';

interface StripQrPanelProps {
  saveUrl: string;
}

export function StripQrPanel({ saveUrl }: StripQrPanelProps) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl border-2 border-border/80 bg-card/90 px-5 py-5 shadow-sm backdrop-blur-sm lg:max-w-sm">
      <p className="text-center text-lg font-semibold text-foreground">Scan to save on your phone</p>
      <p className="text-center text-sm text-muted-foreground">
        Open your camera app and point it at the code below.
      </p>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <QRCode value={saveUrl} size={200} level="M" />
      </div>
      <p className="max-w-full truncate text-center text-xs text-muted-foreground" title={saveUrl}>
        {saveUrl}
      </p>
    </div>
  );
}
