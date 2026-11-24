import { describe, it, expect } from "vitest";
import { findBudgetFailures, findMedian, readMedianResult } from "./perf.mjs";

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

  describe("a mobile page whose performance score is 0.89", () => {
    it("names the category, the score and the budget", () => {
      const scores = { ...PASSING_SCORES, performance: 0.89 };

      expect(findBudgetFailures({ scores, timings: PASSING_TIMINGS, route: "/", profile: "mobile" })).toStrictEqual([
        "/ (mobile) performance 0.89 < 0.9",
      ]);
    });
  });

  describe("a mobile page whose blocking time is 310 ms", () => {
    it("names the audit and the 300 ms limit", () => {
      const timings = { ...PASSING_TIMINGS, "total-blocking-time": 310 };

      expect(findBudgetFailures({ scores: PASSING_SCORES, route: "/", profile: "mobile", timings })).toStrictEqual([
        "/ (mobile) total-blocking-time 310 > 300",
      ]);
    });
  });

  describe("a mobile page whose blocking time is 290 ms", () => {
    it("passes, because the limit is 300 ms", () => {
      const timings = { ...PASSING_TIMINGS, "total-blocking-time": 290 };

      expect(findBudgetFailures({ scores: PASSING_SCORES, route: "/", profile: "mobile", timings })).toStrictEqual([]);
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

describe("findMedian()", () => {
  describe("three runs", () => {
    it("takes the middle one, so a single spike does not decide the result", () => {
      expect(findMedian([0.92, 0.6, 0.94])).toBe(0.92);
    });
  });

  describe("an even number of runs", () => {
    it("takes the mean of the two middle ones", () => {
      expect(findMedian([100, 300, 200, 400])).toBe(250);
    });
  });
});

describe("readMedianResult()", () => {
  it("takes the median of each score and each timing across the runs", () => {
    const results = [
      {
        scores: { performance: 0.9, accessibility: 1, "best-practices": 1, seo: 1 },
        timings: { "largest-contentful-paint": 1000, "cumulative-layout-shift": 0, "total-blocking-time": 280 },
      },
      {
        scores: { performance: 0.7, accessibility: 1, "best-practices": 1, seo: 1 },
        timings: { "largest-contentful-paint": 3000, "cumulative-layout-shift": 0, "total-blocking-time": 900 },
      },
      {
        scores: { performance: 0.95, accessibility: 1, "best-practices": 1, seo: 1 },
        timings: { "largest-contentful-paint": 1200, "cumulative-layout-shift": 0, "total-blocking-time": 200 },
      },
    ];

    expect(readMedianResult(results)).toStrictEqual({
      scores: { performance: 0.9, accessibility: 1, "best-practices": 1, seo: 1 },
      timings: { "largest-contentful-paint": 1200, "cumulative-layout-shift": 0, "total-blocking-time": 280 },
    });
  });
});
