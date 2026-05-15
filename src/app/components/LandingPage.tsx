import blueboothBg from './images/bluebooth-bg.png';
import cozyLogo from '../../../cozy-photobooth/cozylogo.png';
import cat1 from './images/cat1.png';

interface LandingPageProps {
  onSnapNow: () => void;
}


export function LandingPage({ onSnapNow }: LandingPageProps) {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-10"
      style={{
        backgroundImage: `url(${blueboothBg})`,
        backgroundSize: '1440px 1024px',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <img
          src={cozyLogo}
          alt="Cozy Journey with Day6 Photobooth"
          className="w-full max-w-lg select-none object-contain px-2"
          draggable={false}
        />
        <h1 className="mt-4 text-balance text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
          Cozy Journey with Day6 Photobooth
        </h1>
        <p className="mt-3 text-medium text-muted-foreground sm:text-medium">by airi</p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">

        <button
          type="button"
          onClick={onSnapNow}
          className="inline-flex items-center gap-2 rounded-full border-2 border-primary-foreground bg-primary px-6 py-2 text-[1.35rem] text-primary-foreground shadow-[0_6px_20px_rgba(62,90,72,0.12)] transition hover:bg-muted/80 hover:text-primary hover:border-primary hover:shadow-[0_8px_24px_rgba(90,70,120,0.14)] active:scale-[0.98]"
        >
          Snap now!
          <img
            src={cat1}
            alt=""
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
}