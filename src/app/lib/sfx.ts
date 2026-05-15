import printingSoundSrc from './printing-sound.MP3';
import shutterSoundSrc from './shutter-click.MP3';

export { printingSoundSrc };

export function playShutterSound(): void {
  const a = new Audio(shutterSoundSrc);
  void a.play().catch(() => {});
}
