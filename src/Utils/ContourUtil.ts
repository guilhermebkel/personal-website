const SAMPLES_PER_LINE = 36;
const FIRST_WAVE_COUNT = 2;
const SECOND_WAVE_COUNT = 3;
const FIRST_AMPLITUDE_RATIO = 0.32;
const SECOND_AMPLITUDE_RATIO = 0.14;
const PHASE_STEP = 0.4;
const TILES_AROUND = [-1, 0, 1];
const HALF = 0.5;
const FULL_TURN = Math.PI + Math.PI;
const NO_PHASE = 0;

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
        const path = ContourUtil.buildLine(tile, line, baseY, spacing, NO_PHASE);
        paths.push(path);
      }
    }
    return paths;
  }

  static buildCoverLines(tile: ContourTile, phase: number): string[] {
    // Why: a cover is one box, not a tile that repeats, so each line is drawn once; the phase moves the whole pattern, so each post gets its own lines.
    const spacing = tile.height / tile.lineCount;
    const paths: string[] = [];
    for (let line = 0; line < tile.lineCount; line += 1) {
      const baseY = (line + HALF) * spacing;
      const path = ContourUtil.buildLine(tile, line, baseY, spacing, phase);
      paths.push(path);
    }
    return paths;
  }

  private static buildLine(tile: ContourTile, line: number, baseY: number, spacing: number, phase: number): string {
    const points: string[] = [];
    for (let sample = 0; sample <= SAMPLES_PER_LINE; sample += 1) {
      const progress = sample / SAMPLES_PER_LINE;
      const wave = ContourUtil.computeWave(progress, line, spacing, phase);
      points.push(`${(progress * tile.width).toFixed(1)} ${(baseY + wave).toFixed(1)}`);
    }
    return `M${points.join(" L")}`;
  }

  static computeWave(progress: number, line: number, spacing: number, phase: number = NO_PHASE): number {
    // Why: the phase moves a little from one line to the next, so neighbours run side by side like the lines of a map.
    const first = Math.sin(FULL_TURN * FIRST_WAVE_COUNT * progress + line * PHASE_STEP + phase);
    const second = Math.sin(FULL_TURN * SECOND_WAVE_COUNT * progress + line * PHASE_STEP * FIRST_WAVE_COUNT + phase);
    return spacing * (FIRST_AMPLITUDE_RATIO * first + SECOND_AMPLITUDE_RATIO * second);
  }
}
