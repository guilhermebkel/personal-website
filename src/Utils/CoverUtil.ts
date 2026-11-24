const HASH_BASE = 31;
const HASH_MODULUS = 1000;
const NO_CODE_POINT = 0;
const FULL_TURN = Math.PI + Math.PI;

export class CoverUtil {
  static getPhase(seed: string): number {
    let hash = 0;
    for (const character of seed) {
      // Why: the same seed (a post's path) always gives the same lines, so a cover never changes between visits or builds.
      hash = (hash * HASH_BASE + (character.codePointAt(0) ?? NO_CODE_POINT)) % HASH_MODULUS;
    }
    return (hash / HASH_MODULUS) * FULL_TURN;
  }
}
