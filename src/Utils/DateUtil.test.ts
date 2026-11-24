import { describe, expect, it } from "vitest";
import { DateUtil } from "@/Utils/DateUtil.ts";

describe("DateUtil.formatDayMonthYear()", () => {
  it("writes the day, the short month and the year", () => {
    expect(DateUtil.formatDayMonthYear("2026-11-18")).toBe("18 Nov 2026");
  });

  it("drops the leading zero of the day", () => {
    expect(DateUtil.formatDayMonthYear("2026-01-05")).toBe("5 Jan 2026");
  });

  it("gives back a date it does not know, so a bad date shows as it was written", () => {
    expect(DateUtil.formatDayMonthYear("18/11/2026")).toBe("18/11/2026");
    expect(DateUtil.formatDayMonthYear("2026-13-01")).toBe("2026-13-01");
  });
});
