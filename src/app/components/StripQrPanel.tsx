import QRCode from 'react-qr-code';

interface StripQrPanelProps {
  saveUrl: string;
}

export function StripQrPanel({ saveUrl }: StripQrPanelProps) {
  return (
    <div className="flex w-full max-w-[min(100%,18rem)] flex-col items-center gap-3 rounded-2xl border-2 border-border/80 bg-card/90 px-4 py-4 shadow-sm backdrop-blur-sm sm:max-w-xs sm:rounded-3xl sm:px-5 sm:py-5 md:max-w-sm">
      <p className="text-center text-base font-semibold text-foreground sm:text-lg">
        Scan to save on your phone
      </p>
      <p className="text-center text-xs text-muted-foreground sm:text-sm">
        Open your camera app and point it at the code below.
      </p>
      <div className="w-full max-w-[12.5rem] rounded-2xl bg-white p-3 shadow-inner sm:p-4 [&_svg]:h-auto [&_svg]:w-full">
        <QRCode value={saveUrl} size={200} level="M" />
      </div>
      <p
        className="hidden max-w-full truncate text-center text-xs text-muted-foreground sm:block"
        title={saveUrl}
      >
        {saveUrl}
      </p>
    </div>
  );
}
