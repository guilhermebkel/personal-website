import { ContourUtil, type ContourTile } from "@/Utils/ContourUtil.ts";

const TILE: ContourTile = { width: 1440, height: 600, lineCount: 10 };
const PATHS = ContourUtil.buildPaths(TILE);
const PATTERN_ID = "contours";

export const ContoursIcon = () => {
  // Why: the faint terrain lines behind every page are one tile that repeats, so a page of any height has them. They are decoration, hidden from screen readers and from the pointer, and fade out toward the bottom with a mask.
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 size-full mask-[linear-gradient(#000_0%,#000_85%,transparent_100%)]"
    >
      <defs>
        <pattern id={PATTERN_ID} width={TILE.width} height={TILE.height} patternUnits="userSpaceOnUse">
          {PATHS.map((path) => (
            <path key={path} d={path} fill="none" strokeWidth="1.5" className="stroke-contour" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${PATTERN_ID})`} />
    </svg>
  );
};
