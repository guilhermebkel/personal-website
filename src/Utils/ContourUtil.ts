const SAMPLES_PER_LINE = 36;
const FIRST_WAVE_COUNT = 2;
const SECOND_WAVE_COUNT = 3;
const FIRST_AMPLITUDE_RATIO = 0.32;
const SECOND_AMPLITUDE_RATIO = 0.14;
const PHASE_STEP = 0.4;
const TILES_AROUND = [-1, 0, 1];
const HALF = 0.5;
const FULL_TURN = Math.PI + Math.PI;

export type ContourTile = {
  width: number;
  height: number;
  lineCount: number;
};

export class ContourUtil {
  static buildPaths(tile: ContourTile): string[] {
    const spacing = tile.height / tile.lineCount;
    const paths: string[] = [];
    for (let line = 0; line < tile.lineCount; line += 1) {
      for (const around of TILES_AROUND) {
        const baseY = (line + HALF) * spacing + around * tile.height;
        const path = ContourUtil.buildLine(tile, line, baseY, spacing);
        paths.push(path);
      }
    }
    return paths;
  }

  private static buildLine(tile: ContourTile, line: number, baseY: number, spacing: number): string {
    const points: string[] = [];
    for (let sample = 0; sample <= SAMPLES_PER_LINE; sample += 1) {
      const progress = sample / SAMPLES_PER_LINE;
      const wave = ContourUtil.computeWave(progress, line, spacing);
      points.push(`${(progress * tile.width).toFixed(1)} ${(baseY + wave).toFixed(1)}`);
    }
    return `M${points.join(" L")}`;
  }

  static computeWave(progress: number, line: number, spacing: number): number {
    // Why: the phase moves a little from one line to the next, so neighbours run side by side like the lines of a map.
    const first = Math.sin(FULL_TURN * FIRST_WAVE_COUNT * progress + line * PHASE_STEP);
    const second = Math.sin(FULL_TURN * SECOND_WAVE_COUNT * progress + line * PHASE_STEP * FIRST_WAVE_COUNT);
    return spacing * (FIRST_AMPLITUDE_RATIO * first + SECOND_AMPLITUDE_RATIO * second);
  }
}
