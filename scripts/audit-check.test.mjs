import { describe, it, expect } from "vitest";
import { EXIT_BLOCKED, EXIT_NO_ANSWER, EXIT_OK, evaluateAudit, parseAuditOutput } from "./audit-check.mjs";

// Why: canned reports in the npm-style shape, so the tests never reach the network.
const reportWith = (vulnerabilities) => ({ metadata: { vulnerabilities } });
const CLEAN = reportWith({ info: 0, low: 0, moderate: 0, high: 0, critical: 0 });
const HIGH_ONLY = reportWith({ info: 0, low: 0, moderate: 1, high: 1, critical: 0 });
const CRITICAL_ONLY = reportWith({ info: 0, low: 0, moderate: 0, high: 0, critical: 2 });
const LOW_ONLY = reportWith({ info: 0, low: 3, moderate: 2, high: 0, critical: 0 });

describe("parseAuditOutput()", () => {
  it("reads a JSON report", () => {
    const output = JSON.stringify(CLEAN);
    expect(parseAuditOutput(output)).toStrictEqual(CLEAN);
  });

  it("returns null for output that is not JSON, as an unreachable registry prints", () => {
    expect(parseAuditOutput("ERR_PNPM_AUDIT_BAD_RESPONSE")).toBeNull();
    expect(parseAuditOutput("")).toBeNull();
  });
});

describe("evaluateAudit() for production dependencies", () => {
  it("passes when there are no high or critical vulnerabilities", () => {
    expect(evaluateAudit({ scope: "prod", report: CLEAN }).code).toBe(EXIT_OK);
  });

  it("fails on a high vulnerability", () => {
    const result = evaluateAudit({ scope: "prod", report: HIGH_ONLY });
    expect(result.code).toBe(EXIT_BLOCKED);
    expect(result.lines).toStrictEqual(["1 high or critical vulnerabilities in production dependencies."]);
  });

  it("fails on a critical vulnerability", () => {
    expect(evaluateAudit({ scope: "prod", report: CRITICAL_ONLY }).code).toBe(EXIT_BLOCKED);
  });

  it("passes with only low and moderate vulnerabilities", () => {
    expect(evaluateAudit({ scope: "prod", report: LOW_ONLY }).code).toBe(EXIT_OK);
  });
});

describe("evaluateAudit() for development dependencies", () => {
  it("passes with a high vulnerability and prints a warning", () => {
    const result = evaluateAudit({ scope: "dev", report: HIGH_ONLY });
    expect(result.code).toBe(EXIT_OK);
    expect(result.lines).toStrictEqual(["::warning::1 high or critical vulnerabilities in development dependencies."]);
  });
});

describe("evaluateAudit() when the audit does not answer", () => {
  it("fails with a clear message on no report, instead of passing silently", () => {
    const result = evaluateAudit({ scope: "prod", report: null });
    expect(result.code).toBe(EXIT_NO_ANSWER);
    expect(result.lines[0]).toContain("did not answer");
  });

  it("fails and shows the error summary when the report is an error object", () => {
    const result = evaluateAudit({ scope: "dev", report: { error: { code: "ENOTFOUND", summary: "getaddrinfo" } } });
    expect(result.code).toBe(EXIT_NO_ANSWER);
    expect(result.lines).toStrictEqual(["The dev audit failed: getaddrinfo."]);
  });

  it("fails when the report has no counts", () => {
    expect(evaluateAudit({ scope: "prod", report: {} }).code).toBe(EXIT_NO_ANSWER);
  });

  it("fails on an unknown scope", () => {
    expect(evaluateAudit({ scope: "all", report: CLEAN }).code).toBe(EXIT_NO_ANSWER);
  });
});
