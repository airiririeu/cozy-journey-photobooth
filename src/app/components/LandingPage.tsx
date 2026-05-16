import { BoothPageShell } from './BoothPageShell';
import cozyLogo from '../../../cozy-photobooth/cozylogo.png';
import cat1 from './images/cat1.png';

interface LandingPageProps {
  onSnapNow: () => void;
}

export function LandingPage({ onSnapNow }: LandingPageProps) {
  return (
    <BoothPageShell className="flex flex-col items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:py-10">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <img
          src={cozyLogo}
          alt="Cozy Journey with Day6 Photobooth"
          className="w-full max-w-[min(100%,28rem)] select-none object-contain px-2"
          draggable={false}
        />
        <h1 className="mt-3 text-balance text-2xl leading-tight text-foreground sm:mt-4 sm:text-3xl md:text-4xl lg:text-5xl">
          Cozy Journey with Day6 Photobooth
        </h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">by airi</p>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3 sm:mt-6">
        <button
          type="button"
          onClick={onSnapNow}
          className="inline-flex max-w-full items-center gap-2 rounded-full border-2 border-primary-foreground bg-primary px-5 py-2.5 text-lg text-primary-foreground shadow-[0_6px_20px_rgba(62,90,72,0.12)] transition hover:border-primary hover:bg-muted/80 hover:text-primary hover:shadow-[0_8px_24px_rgba(90,70,120,0.14)] active:scale-[0.98] sm:px-6 sm:py-2 sm:text-[1.35rem]"
        >
          Snap now!
          <img
            src={cat1}
            alt=""
            className="h-7 w-7 shrink-0 object-contain sm:h-9 sm:w-9"
            draggable={false}
          />
        </button>
      </div>
    </BoothPageShell>
  );
}
