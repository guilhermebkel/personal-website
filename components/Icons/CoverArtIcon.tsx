import { ContourUtil, type ContourTile } from "@/Utils/ContourUtil.ts";
import { CoverUtil } from "@/Utils/CoverUtil.ts";

type CoverArtIconProps = {
  seed: string;
};

const COVER_TILE: ContourTile = { width: 400, height: 190, lineCount: 9 };
const HALF = 0.5;
const VIEW_BOX = `0 0 ${COVER_TILE.width} ${COVER_TILE.height}`;
const CENTER_X = COVER_TILE.width * HALF;
const CENTER_Y = COVER_TILE.height * HALF;
const PURPLE_LINE_INDEX = 4;
const LINE_WIDTH = 1.5;
const PURPLE_LINE_WIDTH = 2;
const RING_OUTER_RADIUS = 53;
const RING_INNER_RADIUS = 27;
const RING_WIDTH = 2;

export const CoverArtIcon = ({ seed }: CoverArtIconProps) => {
  // Why: the library has no equal for the terrain lines and the ring pair of a cover, so the art is our own icon, drawn from the same contour generator as the page background.
  // Why: the seed picks this cover's lines, so each post has its own and the same post never changes between visits.
  const lines = ContourUtil.buildCoverLines(COVER_TILE, CoverUtil.getPhase(seed));
  return (
    <svg
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 size-full"
    >
      {lines.map((line, index) => (
        <path
          key={line}
          d={line}
          fill="none"
          strokeWidth={index === PURPLE_LINE_INDEX ? PURPLE_LINE_WIDTH : LINE_WIDTH}
          vectorEffect="non-scaling-stroke"
          className={index === PURPLE_LINE_INDEX ? "stroke-purple-line" : "stroke-contour-cover"}
        />
      ))}
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={RING_OUTER_RADIUS}
        fill="none"
        strokeWidth={RING_WIDTH}
        vectorEffect="non-scaling-stroke"
        className="stroke-ring-cover"
      />
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={RING_INNER_RADIUS}
        strokeWidth={RING_WIDTH}
        vectorEffect="non-scaling-stroke"
        className="fill-purple-wash stroke-purple-ring"
      />
    </svg>
  );
};
