const STAGGER_MS = 100;
const MAX_STAGGERED = 6;

export class MotionUtil {
  // Why: items of a list enter one after the other, but the 20th item must not wait two seconds, so the delay repeats after a few items.
  static delayFor(index: number): number {
    return (index % MAX_STAGGERED) * STAGGER_MS;
  }
}
