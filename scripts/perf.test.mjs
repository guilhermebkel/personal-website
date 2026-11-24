import { describe, it, expect } from "vitest";
import { findBudgetFailures } from "./perf.mjs";

const PASSING_SCORES = { performance: 0.97, accessibility: 1, "best-practices": 1, seo: 1 };
const PASSING_TIMINGS = { "largest-contentful-paint": 1200, "cumulative-layout-shift": 0, "total-blocking-time": 50 };

describe("findBudgetFailures()", () => {
  describe("a mobile page with every score and timing inside its budget", () => {
    it("reports nothing", () => {
      expect(
        findBudgetFailures({ route: "/", profile: "mobile", scores: PASSING_SCORES, timings: PASSING_TIMINGS }),
      ).toStrictEqual([]);
    });
  });

  describe("a mobile page whose performance score is 0.94", () => {
    it("names the category, the score and the budget", () => {
      const scores = { ...PASSING_SCORES, performance: 0.94 };

      expect(findBudgetFailures({ scores, timings: PASSING_TIMINGS, route: "/", profile: "mobile" })).toStrictEqual([
        "/ (mobile) performance 0.94 < 0.95",
      ]);
    });
  });

  describe("a mobile page whose accessibility score is 0.99", () => {
    it("fails, because accessibility has no tolerance", () => {
      const scores = { ...PASSING_SCORES, accessibility: 0.99 };

      expect(
        findBudgetFailures({ scores, timings: PASSING_TIMINGS, route: "/blog/", profile: "mobile" }),
      ).toStrictEqual(["/blog/ (mobile) accessibility 0.99 < 1"]);
    });
  });

  describe("a mobile page whose largest paint takes 2100 ms", () => {
    it("names the audit and the limit", () => {
      const timings = { ...PASSING_TIMINGS, "largest-contentful-paint": 2100 };

      expect(findBudgetFailures({ scores: PASSING_SCORES, route: "/", profile: "mobile", timings })).toStrictEqual([
        "/ (mobile) largest-contentful-paint 2100 > 2000",
      ]);
    });
  });

  describe("a desktop page whose largest paint takes 2100 ms", () => {
    it("reads no timing budget, because the timings are for the phone profile", () => {
      const timings = { ...PASSING_TIMINGS, "largest-contentful-paint": 2100 };

      expect(findBudgetFailures({ route: "/", profile: "desktop", scores: PASSING_SCORES, timings })).toStrictEqual([]);
    });
  });
});
