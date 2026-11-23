export type Quote = {
  lines: string[];
  // Why: one phrase per quote carries the purple band; each entry must be a part of a line.
  highlights: string[];
};
