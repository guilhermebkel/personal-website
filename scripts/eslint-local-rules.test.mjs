import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";
import { localRules } from "./eslint-local-rules.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const PROTOCOL_FILE = "src/Protocols/ChatProtocol.ts";
const CHAT_SCHEMA_FILE = "src/Schemas/ChatSchema.ts";
const SERVICE_FILE = "src/Services/ChatService.ts";
const TIME_UTIL_FILE = "src/Utils/TimeUtil.ts";
const SVG_ELEMENT = '<svg viewBox="0 0 24 24" />';
const UNTYPED_MAP_CODE = "const KIND_TO_SIZE = { a: 1, b: 2 };";

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2024, sourceType: "module" } });

ruleTester.run("literal-dispatch", localRules.rules["literal-dispatch"], {
  valid: [
    {
      name: "one comparison that leaves early is a guard",
      code: 'function f(threshold) { if (threshold === "always") { return true; } return false; }',
    },
    {
      name: "the same subject in different functions",
      code: 'function f(kind) { if (kind === "a") { return 1; } } function g(kind) { return kind === "b"; }',
    },
    {
      name: "comparisons with values that aren't fixed",
      code: "function f(kind, other) { if (kind === other) { return 1; } if (kind === other.kind) { return 2; } }",
    },
    {
      name: "a comparison stored once and reused",
      code: 'function f(mode) { const isText = mode === "text"; if (isText) { return 1; } return isText ? 2 : 3; }',
    },
    {
      name: "a comparison that only becomes a value, in a callback or an argument",
      code: 'function f(calls) { return calls.filter((call) => call.category === "edit"); }',
    },
    {
      name: "a guard that throws or continues",
      code: 'function f(items) { for (const item of items) { if (item.kind === "skip") continue; } if (items.mode === "x") { throw new Error(); } }',
    },
    {
      name: "type checks and emptiness checks",
      code: 'function f(value) { return typeof value === "string" && value !== "" ? value : undefined; }',
    },
    {
      name: "a lookup in a map",
      code: "const KIND_TO_HANDLER = { a: () => 1, b: () => 2 }; function f(kind) { return KIND_TO_HANDLER[kind](); }",
    },
  ],
  invalid: [
    {
      name: "if statements one after another",
      code: 'function f(lineType) { if (lineType === "user") { return 1; } if (lineType === "assistant") { return 2; } }',
      errors: [{ messageId: "repeated", data: { subject: "lineType" } }],
    },
    {
      name: "an else-if chain",
      code: 'function f(kind) { if (kind === "a") { return 1; } else if (kind === "b") { return 2; } else { return 3; } }',
      errors: [{ messageId: "branch" }, { messageId: "repeated" }],
    },
    {
      name: "a ternary after an if, through optional chaining",
      code: 'function f(match) { if (match?.kind === "none") { return []; } return match.kind === "language" ? [1] : [2]; }',
      errors: [{ messageId: "repeated", data: { subject: "match.kind" } }],
    },
    {
      name: "comparisons joined by || or &&",
      code:
        'function f(result) { return result.kind !== "interrupted" && result.kind !== "user_rejected"; }' +
        ' function g(result) { if (result.kind === "interrupted" || result.kind === "user_rejected") { return 1; } }',
      errors: [{ messageId: "repeated" }, { messageId: "repeated" }],
    },
    {
      name: "a single if that does work instead of leaving",
      code: 'function f(options) { let fingerprint; if (options.status === "applied") { fingerprint = 1; } return fingerprint; }',
      errors: [{ messageId: "branch", data: { subject: "options.status" } }],
    },
    {
      name: "a single ternary, also inside && or ||",
      code: 'function f(metadata, isOn) { return isOn && metadata?.trigger === "manual" ? "manual" : "auto"; }',
      errors: [{ messageId: "branch", data: { subject: "metadata.trigger" } }],
    },
    {
      name: "a switch over fixed values",
      code: 'function f(kind) { switch (kind) { case "a": return 1; case "b": return 2; default: return 3; } }',
      errors: [{ messageId: "switchCases" }],
    },
  ],
});

ruleTester.run("comment-marker", localRules.rules["comment-marker"], {
  valid: [
    {
      name: "a comment that names the hidden rule, over two lines",
      code: "// Why: the provider repeats usage on every line.\n// Count it once per message.\nconst usage = 1;",
    },
    {
      name: "a legacy marker for code that keeps old data working",
      code: "// @legacy: rows saved before the rename keep the old key.\nconst key = 1;",
    },
    {
      name: "tool directives",
      code: "// eslint-disable-next-line no-console\nconsole.log(1);\n/* global window */",
    },
  ],
  invalid: [
    {
      name: "a comment that narrates the code",
      code: "// Add one to the total.\nconst total = 1;",
      errors: [{ messageId: "missing" }],
    },
    {
      name: "a doc block that repeats the name",
      code: "/** Parses the line. */\nfunction parseLine() {}",
      errors: [{ messageId: "missing" }],
    },
  ],
});

ruleTester.run("class-matches-file", localRules.rules["class-matches-file"], {
  valid: [
    {
      name: "one exported class named after its file",
      filename: TIME_UTIL_FILE,
      code: "export class TimeUtil {}",
    },
    {
      name: "a class expression inside a function is not the file's class",
      filename: TIME_UTIL_FILE,
      code: "export class TimeUtil { static make() { return class {}; } }",
    },
  ],
  invalid: [
    {
      name: "a second class in the file",
      filename: "src/Adapters/ClaudeCode/Services/ClaudeCodeInventoryService.ts",
      code: "class InventoryBuilder {} export class ClaudeCodeInventoryService {}",
      errors: [{ messageId: "mismatch", data: { name: "InventoryBuilder", file: "ClaudeCodeInventoryService" } }],
    },
    {
      name: "a file named after something else",
      filename: "src/Utils/SessionFactsFixtureUtil.ts",
      code: "export class SessionFactsBuilder {}",
      errors: [{ messageId: "mismatch", data: { name: "SessionFactsBuilder", file: "SessionFactsFixtureUtil" } }],
    },
  ],
});

const FILE_SUFFIX_CODE = "export const NAME = 1;";
const MISSING_SUFFIX = "missing";

ruleTester.run("file-suffix", localRules.rules["file-suffix"], {
  valid: [
    { name: "a service with the Service suffix", filename: "src/Services/ChatService.ts", code: FILE_SUFFIX_CODE },
    {
      name: "a test whose name before .test carries the suffix",
      filename: "src/Services/ChatService.test.ts",
      code: FILE_SUFFIX_CODE,
    },
    {
      name: "a file in a vendor subfolder carries the top folder's suffix",
      filename: "src/Adapters/Ncbi/NcbiSearchAdapter.ts",
      code: FILE_SUFFIX_CODE,
    },
    { name: "a validation class", filename: "src/Validations/AnalysisValidation.ts", code: FILE_SUFFIX_CODE },
    { name: "a factory", filename: "src/Factories/ChatActionFactory.ts", code: FILE_SUFFIX_CODE },
    { name: "a builder", filename: "src/Builders/ArticleBuilder.ts", code: FILE_SUFFIX_CODE },
    { name: "a schema", filename: CHAT_SCHEMA_FILE, code: FILE_SUFFIX_CODE },
    { name: "index.ts is exempt", filename: "src/Services/index.ts", code: FILE_SUFFIX_CODE },
    { name: "a folder that is not in the map", filename: "src/types/turndown-plugin-gfm.d.ts", code: FILE_SUFFIX_CODE },
    { name: "components/ is outside the rule", filename: "components/ChatThread/Sample.tsx", code: FILE_SUFFIX_CODE },
    { name: "app/ is outside the rule", filename: "app/api/chat/route.ts", code: FILE_SUFFIX_CODE },
    { name: "scripts/ is outside the rule", filename: "scripts/anything.mjs", code: FILE_SUFFIX_CODE },
    { name: "e2e/ is outside the rule", filename: "e2e/chat.spec.ts", code: FILE_SUFFIX_CODE },
  ],
  invalid: [
    {
      name: "ArticleBuilder.ts in Services",
      filename: "src/Services/ArticleBuilder.ts",
      code: FILE_SUFFIX_CODE,
      errors: [
        { messageId: MISSING_SUFFIX, data: { file: "ArticleBuilder.ts", folder: "Services", suffix: "Service" } },
      ],
    },
    {
      name: "ChatService.helper.test.ts in Services",
      filename: "src/Services/ChatService.helper.test.ts",
      code: FILE_SUFFIX_CODE,
      errors: [
        {
          messageId: MISSING_SUFFIX,
          data: { file: "ChatService.helper.test.ts", folder: "Services", suffix: "Service" },
        },
      ],
    },
    {
      name: "TimeHelper.ts in Utils",
      filename: "src/Utils/TimeHelper.ts",
      code: FILE_SUFFIX_CODE,
      errors: [{ messageId: MISSING_SUFFIX, data: { file: "TimeHelper.ts", folder: "Utils", suffix: "Util" } }],
    },
    {
      name: "ReadDocs.ts in Tools",
      filename: "src/Tools/ReadDocs.ts",
      code: FILE_SUFFIX_CODE,
      errors: [{ messageId: MISSING_SUFFIX, data: { file: "ReadDocs.ts", folder: "Tools", suffix: "Tool" } }],
    },
    {
      name: "Chat.ts in Protocols",
      filename: "src/Protocols/Chat.ts",
      code: FILE_SUFFIX_CODE,
      errors: [{ messageId: MISSING_SUFFIX, data: { file: "Chat.ts", folder: "Protocols", suffix: "Protocol" } }],
    },
    {
      name: "ChatActionFactory.ts in Actions",
      filename: "src/Actions/ChatActionFactory.ts",
      code: FILE_SUFFIX_CODE,
      errors: [
        { messageId: MISSING_SUFFIX, data: { file: "ChatActionFactory.ts", folder: "Actions", suffix: "Action" } },
      ],
    },
    {
      name: "Daily.ts in Errors",
      filename: "src/Errors/Daily.ts",
      code: FILE_SUFFIX_CODE,
      errors: [{ messageId: MISSING_SUFFIX, data: { file: "Daily.ts", folder: "Errors", suffix: "Error" } }],
    },
    {
      name: "DrizzleChatRepository.ts in Adapters",
      filename: "src/Adapters/Database/DrizzleChatRepository.ts",
      code: FILE_SUFFIX_CODE,
      errors: [
        {
          messageId: MISSING_SUFFIX,
          data: { file: "DrizzleChatRepository.ts", folder: "Adapters", suffix: "Adapter" },
        },
      ],
    },
    {
      name: "AnalysisRules.ts in Validations",
      filename: "src/Validations/AnalysisRules.ts",
      code: FILE_SUFFIX_CODE,
      errors: [
        { messageId: MISSING_SUFFIX, data: { file: "AnalysisRules.ts", folder: "Validations", suffix: "Validation" } },
      ],
    },
    {
      name: "ChatAction.ts in Factories",
      filename: "src/Factories/ChatAction.ts",
      code: FILE_SUFFIX_CODE,
      errors: [{ messageId: MISSING_SUFFIX, data: { file: "ChatAction.ts", folder: "Factories", suffix: "Factory" } }],
    },
    {
      name: "ArticleFixture.ts in Builders",
      filename: "src/Builders/ArticleFixture.ts",
      code: FILE_SUFFIX_CODE,
      errors: [
        { messageId: MISSING_SUFFIX, data: { file: "ArticleFixture.ts", folder: "Builders", suffix: "Builder" } },
      ],
    },
    {
      name: "Chat.ts in Schemas",
      filename: "src/Schemas/Chat.ts",
      code: FILE_SUFFIX_CODE,
      errors: [{ messageId: MISSING_SUFFIX, data: { file: "Chat.ts", folder: "Schemas", suffix: "Schema" } }],
    },
  ],
});

const FIXTURE_PREFIX = join(tmpdir(), "describe-target-");
const FIXTURE_ROOT = mkdtempSync(FIXTURE_PREFIX);
mkdirSync(join(FIXTURE_ROOT, "src/Utils"), { recursive: true });
mkdirSync(join(FIXTURE_ROOT, "src/Adapters/ClaudeCode"), { recursive: true });
const TIME_UTIL_SOURCE = join(FIXTURE_ROOT, TIME_UTIL_FILE);
writeFileSync(TIME_UTIL_SOURCE, "export class TimeUtil { static parsePointInTime() {} }");
const ADAPTER_SOURCE = join(FIXTURE_ROOT, "src/Adapters/ClaudeCode/ClaudeCodeProviderAdapter.ts");
writeFileSync(
  ADAPTER_SOURCE,
  "export class ClaudeCodeProviderAdapter { parseSession() {} private sessionService() {} }",
);
const TIME_UTIL_TEST = join(FIXTURE_ROOT, "src/Utils/TimeUtil.test.ts");
const ADAPTER_TEST = join(FIXTURE_ROOT, "src/Adapters/ClaudeCode/ClaudeCodeProviderAdapter.test.ts");

ruleTester.run("describe-target", localRules.rules["describe-target"], {
  valid: [
    {
      name: "the outer describe names the class and a public static method, with contexts inside",
      filename: TIME_UTIL_TEST,
      code: 'describe("TimeUtil.parsePointInTime()", () => { describe("on a period", () => { it("reads days", () => {}); }); });',
    },
    {
      name: "a public instance method, next to hooks at the top level",
      filename: ADAPTER_TEST,
      code: 'beforeEach(() => {}); describe("ClaudeCodeProviderAdapter.parseSession()", () => {});',
    },
  ],
  invalid: [
    {
      name: "a method without the class",
      filename: TIME_UTIL_TEST,
      code: 'describe("parsePointInTime", () => {});',
      errors: [{ messageId: "format", data: { className: "TimeUtil" } }],
    },
    {
      name: "a theme instead of a method",
      filename: TIME_UTIL_TEST,
      code: 'describe("TimeUtil", () => {});',
      errors: [{ messageId: "format", data: { className: "TimeUtil" } }],
    },
    {
      name: "another class than the file's",
      filename: TIME_UTIL_TEST,
      code: 'describe("RedactUtil.redact()", () => {});',
      errors: [{ messageId: "otherClass", data: { className: "TimeUtil", named: "RedactUtil" } }],
    },
    {
      name: "a private method",
      filename: ADAPTER_TEST,
      code: 'describe("ClaudeCodeProviderAdapter.sessionService()", () => {});',
      errors: [
        {
          messageId: "notPublic",
          data: {
            className: "ClaudeCodeProviderAdapter",
            method: "sessionService",
            source: "ClaudeCodeProviderAdapter.ts",
          },
        },
      ],
    },
    {
      name: "a method the class doesn't have, as after a rename",
      filename: TIME_UTIL_TEST,
      code: 'describe("TimeUtil.parseDate()", () => {});',
      errors: [{ messageId: "notPublic", data: { className: "TimeUtil", method: "parseDate", source: "TimeUtil.ts" } }],
    },
    {
      name: "a test outside any describe",
      filename: TIME_UTIL_TEST,
      code: 'it("reads days", () => {});',
      errors: [{ messageId: "outside", data: { className: "TimeUtil" } }],
    },
  ],
});

const tsRuleTester = new RuleTester({
  languageOptions: { parser: tseslint.parser, ecmaVersion: 2024, sourceType: "module" },
});

tsRuleTester.run("comment-placement", localRules.rules["comment-placement"], {
  valid: [
    {
      name: "a comment next to the line whose rule it explains",
      filename: TIME_UTIL_FILE,
      code: 'export class TimeUtil {\n  static parse(value: string) {\n    // Why: "3m" means months.\n    return value;\n  }\n}',
    },
    {
      name: "a comment on a constant",
      filename: "src/Utils/GitUtil.ts",
      code: 'import { x } from "y";\n// Why: porcelain prints a status and a space first.\nconst OFFSET = 3;',
    },
    {
      name: "tool directives anywhere, even in a type file",
      filename: "src/Protocols/SessionProtocol.ts",
      code: "// eslint-disable-next-line no-var\nexport interface ThreadRef { id: string }",
    },
  ],
  invalid: [
    {
      name: "a file header",
      filename: "src/Modules/CLIModule.ts",
      code: '// Why: the only module that writes to stdout.\n\nimport { x } from "y";',
      errors: [{ messageId: "header" }],
    },
    {
      name: "any comment in a type file",
      filename: "src/Protocols/ConfigProtocol.ts",
      code: "export interface ModelPrice {\n  // Why: USD per million tokens.\n  input: number;\n}",
      errors: [{ messageId: "protocol" }],
    },
    {
      name: "a comment above a method, once for consecutive lines",
      filename: "src/Services/StoreService.ts",
      code: "export class StoreService {\n  // Why: writes atomically,\n  // so a crash never leaves half a file.\n  async writeJson() {}\n}",
      errors: [{ messageId: "declaration", line: 2 }],
    },
    {
      name: "a comment above an exported class or a function constant",
      filename: "src/Services/GapService.ts",
      code: 'import { x } from "y";\n// Why: what the script couldn\'t map.\nexport class GapService {}\n// Why: numeric order.\nconst compare = () => 0;',
      errors: [
        { messageId: "declaration", line: 2 },
        { messageId: "declaration", line: 4 },
      ],
    },
  ],
});

tsRuleTester.run("map-name", localRules.rules["map-name"], {
  valid: [
    {
      name: "a property named after key and value",
      code: "interface R { suggestionIdToCost: Record<string, number> }",
    },
    { name: "a constant map", code: "const STATUS_TO_RECORD: Record<string, () => void> = {};" },
    { name: "a new Map named after key and value", code: "const pathToDate = new Map<string, number>();" },
    { name: "a record of unknown values is a plain object", code: "type UnknownRecord = Record<string, unknown>;" },
    { name: "a list is not a map", code: "interface R { costs: number[] }" },
  ],
  invalid: [
    {
      name: "a Record property",
      code: "interface R { costs: Record<string, number> }",
      errors: [{ messageId: "unnamed" }],
    },
    {
      name: "a type alias of a Record",
      code: "type PriceTable = Record<string, number>;",
      errors: [{ messageId: "unnamed" }],
    },
    {
      name: "a Map inside Partial, and a Map parameter",
      code: "interface R { counters: Partial<Record<string, number>> }\nfunction f(seen: Map<string, number>) {}",
      errors: [{ messageId: "unnamed" }, { messageId: "unnamed" }],
    },
    {
      name: "a new Map without a type",
      code: "const seen = new Map();",
      errors: [{ messageId: "unnamed" }],
    },
  ],
});

tsRuleTester.run("known-keys", localRules.rules["known-keys"], {
  valid: [
    { name: "a record keyed by a union", code: "const LEVEL_TO_RANK: Record<Level, number> = { low: 1, high: 2 };" },
    { name: "a list typed with a union", code: 'const LEVELS: readonly Level[] = ["low", "high"];' },
    {
      name: "a set typed with a union",
      code: 'const OPEN: ReadonlySet<Status> = new Set(["submitted", "streaming"]);',
    },
    {
      name: "a record whose keys are computed",
      code: "const KEY_TO_VALUE: Record<string, number> = { [first]: 1, [second]: 2 };",
    },
    { name: "a list that is not all literals", code: 'const NAMES: string[] = [first, "b"];' },
    { name: "a set built from a variable", code: "const SEEN: ReadonlySet<string> = new Set(names);" },
    {
      name: "a map keyed by a union",
      code: 'const NAME_TO_TEXT = new Map<SkillName, string>([["analyze-case", "x"]]);',
    },
    {
      name: "a map built from computed keys",
      code: "const IDS = new Map<string, number>(items.map((item) => [item.id, 1]));",
    },
    { name: "a map keyed by free text, filled later", code: "const doiToRanked = new Map<string, Ranked>();" },
    {
      name: "a map keyed by free text entries",
      code: "const doiToRanked = new Map<string, Ranked>([[first.doi, first]]);",
    },
  ],
  invalid: [
    {
      name: "a record keyed by string with all keys known",
      code: 'class A { static readonly CODE_TO_TEXT: Record<string, string> = { a: "x", b: "y" }; }',
      errors: [{ messageId: "keys" }],
    },
    {
      name: "a list of string with all values known",
      code: 'const LEVELS: string[] = ["low", "high"];',
      errors: [{ messageId: "values" }],
    },
    {
      name: "a readonly list of string",
      code: 'const LEVELS: readonly string[] = ["low", "high"];',
      errors: [{ messageId: "values" }],
    },
    {
      name: "a set of string with all values known",
      code: 'const KEYS: ReadonlySet<string> = new Set(["Escape"]);',
      errors: [{ messageId: "values" }],
    },
    {
      name: "a new Map keyed by string with fixed keys",
      code: 'const NAME_TO_TEXT = new Map<string, string>([["analyze-case", "x"]]);',
      errors: [{ messageId: "keys" }],
    },
    {
      name: "an annotated Map built from fixed keys",
      code: 'const NAME_TO_TEXT: ReadonlyMap<string, string> = new Map([["a", "x"], ["b", "y"]]);',
      errors: [{ messageId: "keys" }],
    },
  ],
});

tsRuleTester.run("no-bare-string-field", localRules.rules["no-bare-string-field"], {
  valid: [
    { name: "a property typed with a union", code: 'type A = { state: "running" | "done" };' },
    { name: "a property typed with a declared type", code: "type A = { state: StepState; role?: Role };" },
    { name: "a property typed with a template literal", code: "type A = { type: `tool-${string}` };" },
    { name: "a free text property with another name", code: "type A = { title: string; label: string };" },
    { name: "a type literal with a declared type", code: "type A = { kind: Kind; mode?: Mode | null };" },
  ],
  invalid: [
    {
      name: "state typed string",
      code: "type A = { state: string };",
      errors: [{ messageId: "bare", data: { name: "state" } }],
    },
    {
      name: "an optional type",
      code: "type A = { type?: string };",
      errors: [{ messageId: "bare", data: { name: "type" } }],
    },
    {
      name: "string or undefined",
      code: "type A = { role: string | undefined };",
      errors: [{ messageId: "bare", data: { name: "role" } }],
    },
    {
      name: "kind, status, mode and phase",
      code: "type A = { kind: string; status: string | null; mode: string; phase: string };",
      errors: [{ messageId: "bare" }, { messageId: "bare" }, { messageId: "bare" }, { messageId: "bare" }],
    },
  ],
});

ruleTester.run("error-location", localRules.rules["error-location"], {
  valid: [
    {
      name: "an error class in src/Errors named after what went wrong",
      code: "export class DailyLimitError extends Error {}",
      filename: "src/Errors/DailyLimitError.ts",
    },
    {
      name: "a class that is not an error, anywhere",
      code: "export class ChatService extends Base {}",
      filename: SERVICE_FILE,
    },
    {
      name: "an error that extends another project error, in src/Errors",
      code: "export class NotFoundError extends HttpError {}",
      filename: "/repo/src/Errors/NotFoundError.ts",
    },
  ],
  invalid: [
    {
      name: "an error class outside src/Errors",
      code: "export class ChatAccessError extends Error {}",
      filename: "src/Services/ChatAccessError.ts",
      errors: [{ messageId: "folder" }],
    },
    {
      name: "an error class in src/Errors without the Error suffix",
      code: "export class DailyLimit extends Error {}",
      filename: "src/Errors/DailyLimit.ts",
      errors: [{ messageId: "suffix" }],
    },
  ],
});

const PANEL_FILE = "components/Panel.tsx";

const jsxRuleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2024, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

jsxRuleTester.run("one-component-per-file", localRules.rules["one-component-per-file"], {
  valid: [
    {
      name: "one component named after its file",
      code: "export function Panel() { return <div />; }",
      filename: PANEL_FILE,
    },
    {
      name: "the main component in index.tsx is named after its folder",
      code: "export function Panel() { return <div />; }",
      filename: "components/Panel/index.tsx",
    },
    {
      name: "a helper that returns no markup",
      code: "function Format() { return 1; }\nexport function Panel() { return <div />; }",
      filename: PANEL_FILE,
    },
  ],
  invalid: [
    {
      name: "a subcomponent in the same file, declared before the main one",
      code: "function Row() { return <li />; }\nexport function Panel() { return <ul><Row /></ul>; }",
      filename: PANEL_FILE,
      errors: [{ messageId: "extra" }],
    },
    {
      name: "an arrow subcomponent in index.tsx",
      code: "export function Panel() { return <ul />; }\nconst Row = () => <li />;",
      filename: "components/Panel/index.tsx",
      errors: [{ messageId: "extra" }],
    },
  ],
});

ruleTester.run("tokens-only", localRules.rules["tokens-only"], {
  valid: [
    {
      name: "tokens and the spacing scale",
      code: 'const A = "h-11 px-2.5 rounded-md bg-accent text-ink-2 max-sidebar:size-11";',
    },
    {
      name: "a color derived from a token",
      code: 'const A = "border-[color-mix(in_oklch,var(--color-accent)_22%,transparent)]";',
    },
    {
      name: "a gradient that only uses tokens",
      code: 'const A = "bg-[linear-gradient(to_bottom,var(--color-accent-top),var(--color-accent))]";',
    },
    {
      name: "a safe area padded with a spacing token",
      code: 'const A = "pr-[max(--spacing(6),env(safe-area-inset-right,0px))]";',
    },
    { name: "a zero length", code: 'const A = "pl-[env(safe-area-inset-left,0px)]";' },
    { name: "a grid template, which is layout and not a size", code: 'const A = "grid-cols-[18px_minmax(0,1fr)]";' },
    { name: "units that are not px, rem or em", code: 'const A = "w-[86vw] max-w-[40ch] min-w-[12ch]";' },
    { name: "an unitless value", code: 'const A = "stroke-[1.75]";' },
    {
      name: "a selector variant and a data variant",
      code: 'const A = "[&_p]:text-sm group-data-[drawer-open=true]/app:visible aria-[selected=true]:bg-surface-1";',
    },
    { name: "a string that is not a class list", code: 'const A = "Veja [1] e [2] no texto";' },
    { name: "a template with named breakpoints", code: "const A = `grid ${flag} max-split:hidden`;" },
  ],
  invalid: [
    {
      name: "an oklch color in a background",
      code: 'const A = "bg-[oklch(0.15_0.02_210/0.45)]";',
      errors: [{ messageId: "rawColor" }],
    },
    {
      name: "a hex color in an arbitrary property",
      code: 'const A = "[mask-image:radial-gradient(80%_70%_at_50%_50%,#000,transparent)]";',
      errors: [{ messageId: "rawColor" }],
    },
    {
      name: "black inside a color mix",
      code: 'const A = "border-[color-mix(in_oklch,var(--color-accent)_78%,black)]";',
      errors: [{ messageId: "rawColor" }],
    },
    {
      name: "a raw color in a shadow",
      code: 'const A = "shadow-[0_1px_2px_oklch(0.2_0.03_210/0.18)]";',
      errors: [{ messageId: "rawColor" }],
    },
    {
      name: "a raw color behind a variant",
      code: 'const A = "hover:bg-[oklch(1_0_0/0.15)]";',
      errors: [{ messageId: "rawColor" }],
    },
    { name: "a size in px", code: 'const A = "h-[52px]";', errors: [{ messageId: "oneOffLength" }] },
    { name: "a size in rem", code: 'const A = "text-[1.25rem]";', errors: [{ messageId: "oneOffLength" }] },
    { name: "a negative size", code: 'const A = "after:inset-x-[-1px]";', errors: [{ messageId: "oneOffLength" }] },
    {
      name: "a px length inside min()",
      code: 'const A = "w-[min(100%,780px)]";',
      errors: [{ messageId: "oneOffLength" }],
    },
    {
      name: "a px length inside a safe area max()",
      code: 'const A = "pr-[max(24px,env(safe-area-inset-right,0px))]";',
      errors: [{ messageId: "oneOffLength" }],
    },
    {
      name: "a breakpoint in px",
      code: 'const A = "max-[1024px]:hidden";',
      errors: [{ messageId: "oneOffBreakpoint" }],
    },
    {
      name: "a container query in px",
      code: 'const A = "@max-[480px]:grid-cols-1";',
      errors: [{ messageId: "oneOffBreakpoint" }],
    },
    {
      name: "a class list in a template literal",
      code: "const A = `flex ${flag} px-[7px]`;",
      errors: [{ messageId: "oneOffLength" }],
    },
    {
      name: "two problems in one class list",
      code: 'const A = "bg-[oklch(1_0_0/0.1)] py-[7px]";',
      errors: [{ messageId: "rawColor" }, { messageId: "oneOffLength" }],
    },
  ],
});

const E2E_SPEC_FILE = "e2e/chat.spec.ts";
const ALLOWED_TAGS_MESSAGE = "Use only these tags: @critical-flow, @needs-browser.";

ruleTester.run("e2e-tag", localRules.rules["e2e-tag"], {
  valid: [
    {
      name: "a critical flow tag",
      code: 'test("sends a case", { tag: "@critical-flow" }, async () => {});',
      filename: E2E_SPEC_FILE,
    },
    {
      name: "a browser-only tag",
      code: 'test("fits the phone", { tag: "@needs-browser" }, async () => {});',
      filename: E2E_SPEC_FILE,
    },
    {
      name: "the constants of e2e/tags.ts",
      code: 'test("x", { tag: CRITICAL_FLOW }, async () => {}); test("y", { tag: [NEEDS_BROWSER] }, async () => {});',
      filename: E2E_SPEC_FILE,
    },
    {
      name: "both tags in a list",
      code: 'test("both", { tag: ["@critical-flow", "@needs-browser"] }, async () => {});',
      filename: E2E_SPEC_FILE,
    },
    {
      name: "a helper file with no test",
      code: 'export async function openNewChat(page) { await page.goto("/"); }',
      filename: "e2e/helpers.ts",
    },
    {
      name: "a describe, a use and a step are not tests",
      code: 'test.describe("group", () => { test.use({}); test.step("s", () => {}); });',
      filename: E2E_SPEC_FILE,
    },
  ],
  invalid: [
    {
      name: "a test with no options",
      code: 'test("sends a case", async () => {});',
      filename: E2E_SPEC_FILE,
      errors: [{ messageId: "missing" }],
    },
    {
      name: "options with no tag",
      code: 'test("sends a case", { annotation: [] }, async () => {});',
      filename: E2E_SPEC_FILE,
      errors: [{ messageId: "missing" }],
    },
    {
      name: "a tag outside the allowed ones",
      code: 'test("sends a case", { tag: "@slow" }, async () => {});',
      filename: E2E_SPEC_FILE,
      errors: [{ message: ALLOWED_TAGS_MESSAGE }],
    },
    {
      name: "one wrong tag in a list",
      code: 'test("x", { tag: ["@critical-flow", "@slow"] }, async () => {});',
      filename: E2E_SPEC_FILE,
      errors: [{ messageId: "unknown" }],
    },
    {
      name: "a tag that is not a literal or a constant of e2e/tags.ts",
      code: 'test("x", { tag: someTag }, async () => {});',
      filename: E2E_SPEC_FILE,
      errors: [{ messageId: "unknown" }],
    },
  ],
});

ruleTester.run("no-fixed-wait", localRules.rules["no-fixed-wait"], {
  valid: [
    { name: "an expect that retries", code: 'await expect(page.getByText("x")).toBeVisible();' },
    { name: "a poll", code: "await expect.poll(() => read()).toBe(0);" },
    { name: "a fake timer", code: "vi.advanceTimersByTime(1000);" },
  ],
  invalid: [
    { name: "page.waitForTimeout", code: "await page.waitForTimeout(500);", errors: [{ messageId: "fixed" }] },
    {
      name: "a sleep built with setTimeout",
      code: "await new Promise((resolve) => setTimeout(resolve, 100));",
      errors: [{ messageId: "fixed" }],
    },
    { name: "window.setTimeout", code: "window.setTimeout(done, 100);", errors: [{ messageId: "fixed" }] },
  ],
});

ruleTester.run("no-test-retries", localRules.rules["no-test-retries"], {
  valid: [
    { name: "retries kept at 0", code: "export default defineConfig({ retries: 0 });" },
    { name: "a config with no retries", code: "export default defineConfig({ workers: 1 });" },
  ],
  invalid: [
    {
      name: "retries above 0",
      code: "export default defineConfig({ retries: 2 });",
      errors: [{ messageId: "retries" }],
    },
    {
      name: "retries chosen by the environment",
      code: "export default defineConfig({ retries: process.env.CI ? 2 : 0 });",
      errors: [{ messageId: "retries" }],
    },
    {
      name: "retries set for one group",
      code: "test.describe.configure({ retries: 1 });",
      errors: [{ messageId: "retries" }],
    },
  ],
});

ruleTester.run("verb-function-name", localRules.rules["verb-function-name"], {
  valid: [
    { name: "a function that starts with a verb", code: "function getBlocks() {}" },
    { name: "an arrow function that starts with a verb", code: "const buildCard = () => {};" },
    { name: "a method that starts with a verb", code: "class A { findLicense() {} }" },
    { name: "a predicate", code: "const isVisible = () => true; function hasLicense() {}" },
    { name: "a React hook", code: "function useWorkspaceLayout() {}" },
    { name: "a PascalCase component", code: "function ChatThread() {}\nconst Panel = () => null;" },
    { name: "a constructor and a getter", code: "class A { constructor() {} get title() { return 1; } }" },
    { name: "a value that is not a function", code: "const blocks = [];" },
    { name: "a predicate with a modal prefix", code: "const canEdit = () => true; const mustReview = () => true;" },
  ],
  invalid: [
    {
      name: "a name that reads as a noun phrase",
      code: "function blocksOf() {}",
      errors: [{ messageId: "verb", data: { name: "blocksOf" } }],
    },
    {
      name: "a preposition as the first word",
      code: "function fromHtml() {}",
      errors: [{ messageId: "verb", data: { name: "fromHtml" } }],
    },
    {
      name: "a noun or a third-person verb as the first word",
      code: "const htmlToText = () => {}; function issueList() {} const needsSkill = () => {};",
      errors: [{ messageId: "verb" }, { messageId: "verb" }, { messageId: "verb" }],
    },
    {
      name: "an arrow function and a method with no verb",
      code: "const cardOf = () => {};\nclass A { history() {} }",
      errors: [{ messageId: "verb" }, { messageId: "verb" }],
    },
    {
      name: "a verb stuck to another word",
      code: "const getter = () => {}; function reader() {}",
      errors: [{ messageId: "verb" }, { messageId: "verb" }],
    },
  ],
});

tsRuleTester.run("schema-file", localRules.rules["schema-file"], {
  valid: [
    {
      name: "a schema built in a Schema file",
      filename: CHAT_SCHEMA_FILE,
      code: "const ChatSchema = z.object({ id: z.string() });",
    },
    {
      name: "a schema imported from a Schema file",
      filename: SERVICE_FILE,
      code: 'import { ChatSchema } from "../Schemas/ChatSchema"; ChatSchema.parse(x);',
    },
    {
      name: "a schema methods call on an imported schema",
      filename: "src/Utils/A.ts",
      code: "SCHEMA.safeParse(value);",
    },
  ],
  invalid: [
    {
      name: "z.object outside a Schema file",
      filename: SERVICE_FILE,
      code: "const ChatSchema = z.object({ id: z.string() });",
      errors: [{ messageId: "builder" }, { messageId: "builder" }],
    },
    {
      name: "z.uuid inside a function, and in a Protocol file",
      filename: PROTOCOL_FILE,
      code: "function f(id) { return z.uuid().safeParse(id); }",
      errors: [{ messageId: "builder" }],
    },
  ],
});

tsRuleTester.run("protocol-types-only", localRules.rules["protocol-types-only"], {
  valid: [
    {
      name: "types, interfaces, enums and imports in a Protocol file",
      filename: PROTOCOL_FILE,
      code: 'import type { A } from "x"; export type B = A; export interface CPort { run(): void } export enum D { E } export type { A };',
    },
    {
      name: "values in a Schema file",
      filename: CHAT_SCHEMA_FILE,
      code: "export const MAX = 1; export function f() {}",
    },
    { name: "values in any other file", filename: SERVICE_FILE, code: "export const MAX = 1; export class A {}" },
  ],
  invalid: [
    { name: "a constant", filename: PROTOCOL_FILE, code: "export const MAX = 1;", errors: [{ messageId: "value" }] },
    {
      name: "a function and a class",
      filename: PROTOCOL_FILE,
      code: "function f() {} export class A {}",
      errors: [{ messageId: "value" }, { messageId: "value" }],
    },
  ],
});

tsRuleTester.run("interface-for-contracts", localRules.rules["interface-for-contracts"], {
  valid: [
    { name: "an interface that is the contract of a class", code: "interface ChatRepositoryPort { find(): void }" },
    { name: "a type", code: "type Chat = { id: string };" },
  ],
  invalid: [
    { name: "an interface for data", code: "interface Chat { id: string }", errors: [{ messageId: "contract" }] },
    {
      name: "an exported interface that extends",
      code: "export interface Chat extends Base { id: string }",
      errors: [{ messageId: "contract" }],
    },
  ],
});

tsRuleTester.run("no-inferred-type", localRules.rules["no-inferred-type"], {
  valid: [
    {
      name: "a declared type and a schema checked against it",
      code: "interface A { id: string } const SCHEMA: z.ZodType<A> = z.object({ id: z.string() });",
    },
    { name: "typeof import in a type", code: 'type Module = typeof import("./module");' },
    { name: "an as const object that only feeds a call", code: "const OPTIONS = { a: 1 } as const; call(OPTIONS);" },
    {
      name: "typeof a function or a global",
      code: "let timer: ReturnType<typeof setTimeout>; const f: typeof fetch = fetch;",
    },
    { name: "a scalar const assertion", code: 'const part = { type: "finish" as const };' },
    {
      name: "a private static as const object",
      code: "class A { private static readonly OPTIONS = { a: 1 } as const; }",
    },
    { name: "an instance as const object", code: "class A { readonly options = { a: 1 } as const; }" },
    { name: "a typed static constant", code: "class A { static readonly OPTIONS: Record<Kind, number> = { a: 1 }; }" },
    { name: "a typed map", filename: "src/A.ts", code: "const KIND_TO_SIZE: Record<Kind, number> = { a: 1, b: 2 };" },
    { name: "a typed Map", filename: "src/A.ts", code: 'const KIND_TO_SIZE = new Map<Kind, number>([["a", 1]]);' },
    { name: "an object with mixed values", filename: "src/A.ts", code: 'const STYLE = { color: INK, size: "24px" };' },
    { name: "a typed role constant", filename: "src/A.ts", code: 'const ASSISTANT_ROLE: MessageRole = "assistant";' },
    {
      name: "a string whose name is not a known-value name",
      filename: "src/A.ts",
      code: 'const BASE_URL = "https://example.org";',
    },
    { name: "an untyped map in a test", filename: "src/A.test.ts", code: UNTYPED_MAP_CODE },
    { name: "an untyped map in tooling", filename: "scripts/a.mjs", code: UNTYPED_MAP_CODE },
    {
      name: "a local variable in a function",
      filename: "src/A.ts",
      code: "function f() { const sizes = { a: 1, b: 2 }; return sizes; }",
    },
    { name: "a plain union", code: 'type Level = "low" | "high";' },
    { name: "typeof as a runtime check", code: 'const isText = typeof value === "string";' },
  ],
  invalid: [
    { name: "z.infer", code: "type A = z.infer<typeof SCHEMA>;", errors: [{ messageId: "zod" }] },
    {
      name: "z.input and z.output",
      code: "type A = z.input<Schema>; type B = z.output<Schema>;",
      errors: [{ messageId: "zod" }, { messageId: "zod" }],
    },
    { name: "typeof a constant", code: "type A = (typeof LEVELS)[number];", errors: [{ messageId: "typeof" }] },
    { name: "keyof typeof a constant", code: "type A = keyof typeof KIND_TO_SIZE;", errors: [{ messageId: "typeof" }] },
    {
      name: "an exported as const array",
      code: 'export const LEVELS = ["low", "high"] as const;',
      errors: [{ messageId: "constant" }],
    },
    {
      name: "an as const object read by a type",
      code: "const KIND_TO_SIZE = { a: 1 } as const; type K = Foo<typeof KIND_TO_SIZE>;",
      errors: [{ messageId: "constant" }, { messageId: "typeof" }],
    },
    {
      name: "an untyped map of literals",
      filename: "src/A.ts",
      code: UNTYPED_MAP_CODE,
      errors: [{ messageId: "map" }],
    },
    {
      name: "an untyped Map",
      filename: "src/A.ts",
      code: 'export const KIND_TO_SIZE = new Map([["a", 1]]);',
      errors: [{ messageId: "map" }],
    },
    {
      name: "an untyped static map",
      filename: "src/A.ts",
      code: "class A { static readonly KIND_TO_SIZE = { a: 1, b: 2 }; }",
      errors: [{ messageId: "map" }],
    },
    {
      name: "a bare role string",
      filename: "src/A.ts",
      code: 'const ASSISTANT_ROLE = "assistant";',
      errors: [{ messageId: "value" }],
    },
    {
      name: "a bare static status string",
      filename: "src/A.ts",
      code: 'class A { static readonly UNAVAILABLE_STATUS = "unavailable"; }',
      errors: [{ messageId: "value" }],
    },
    {
      name: "a public static as const object",
      code: "class A { static readonly OPTIONS = { a: 1 } as const; }",
      errors: [{ messageId: "constant" }],
    },
    {
      name: "a public static as const array",
      code: 'class A { public static readonly LEVELS = ["a"] as const; }',
      errors: [{ messageId: "constant" }],
    },
    {
      name: "an exported as const satisfies object",
      code: "export const KIND_TO_SIZE = { a: 1 } as const satisfies Record<Kind, number>;",
      errors: [{ messageId: "constant" }],
    },
    {
      name: "a static as const satisfies object",
      code: "class A { static readonly KIND_TO_SIZE = { a: 1 } as const satisfies Record<Kind, number>; }",
      errors: [{ messageId: "constant" }],
    },
  ],
});

tsRuleTester.run("arrow-function", localRules.rules["arrow-function"], {
  valid: [
    { name: "an arrow assigned to a const", code: "const readName = (user: User): string => user.name;" },
    { name: "a generator, which has no arrow form", code: "function* ids() { yield 1; }" },
    { name: "a function expression that generates", code: "const ids = function* () { yield 1; };" },
    { name: "a function that uses its own this", code: "function readName() { return this.name; }" },
    {
      name: "a function expression that uses its own this",
      code: "const readName = function () { return this.name; };",
    },
    { name: "a function that uses its own arguments", code: "function count() { return arguments.length; }" },
    {
      name: "an arrow inside a function still reads that function's this",
      code: "function readAll() { return items.map(() => this.name); }",
    },
    {
      name: "an overloaded function, with its signatures",
      code: "function parse(text: string): string; function parse(text: unknown): unknown { return text; }",
    },
    {
      name: "an assertion signature",
      code: 'function assertText(value: unknown): asserts value is string { if (typeof value !== "string") { throw new Error(); } }',
    },
    { name: "a class method", code: "class Chat { readName() { return this.name; } }" },
    { name: "an object method", code: "const chat = { readName() { return 1; } };" },
  ],
  invalid: [
    {
      name: "a function declaration",
      code: "function readName(user) { return user.name; }",
      output: "const readName = (user) => { return user.name; };",
      errors: [{ messageId: "declaration", data: { name: "readName" } }],
    },
    {
      name: "an async declaration with types",
      code: "async function load(id: string): Promise<number> { return 1; }",
      output: "const load = async (id: string): Promise<number> => { return 1; };",
      errors: [{ messageId: "declaration" }],
    },
    {
      name: "an exported declaration",
      code: "export function parse(text: string) { return text; }",
      output: "export const parse = (text: string) => { return text; };",
      errors: [{ messageId: "declaration" }],
    },
    {
      name: "a default export with a name",
      code: "export default function Page() { return null; }",
      output: "const Page = () => { return null; };\n\nexport default Page;",
      errors: [{ messageId: "declaration" }],
    },
    {
      name: "a function expression assigned to a const",
      code: "const readName = function (user) { return user.name; };",
      output: "const readName = (user) => { return user.name; };",
      errors: [{ messageId: "expression", data: { name: "readName" } }],
    },
    {
      name: "a function that only nests a function with its own this",
      code: "function run() { return function () { return this.name; }; }",
      output: "const run = () => { return function () { return this.name; }; };",
      errors: [{ messageId: "declaration", data: { name: "run" } }],
    },
    {
      name: "a declaration inside a block",
      code: "if (ready) { function show() { return 1; } }",
      output: "if (ready) { const show = () => { return 1; }; }",
      errors: [{ messageId: "declaration" }],
    },
  ],
});

jsxRuleTester.run("no-inline-svg", localRules.rules["no-inline-svg"], {
  valid: [
    {
      name: "an svg in the own icons folder",
      code: `export const PlusMinusIcon = () => ${SVG_ELEMENT};`,
      filename: "components/Icons/PlusMinusIcon.tsx",
    },
    {
      name: "an icon from the library, through Icon",
      code: 'export const Panel = () => <Icon name="plus" />;',
      filename: PANEL_FILE,
    },
  ],
  invalid: [
    {
      name: "an svg in a component outside the own icons folder",
      code: `export const Panel = () => ${SVG_ELEMENT};`,
      filename: PANEL_FILE,
      errors: [{ messageId: "inlineSvg" }],
    },
    {
      name: "an svg in a page",
      code: "export default function Page() { return <div><svg /></div>; }",
      filename: "app/login/page.tsx",
      errors: [{ messageId: "inlineSvg" }],
    },
  ],
});

// Why: the layer rule reads the file's place in the repository, so each case names a file path under the layer it tests.
const LAYER_FORBIDDEN = "forbidden";
const LAYER_UTIL_FILE = TIME_UTIL_FILE;
const LAYER_PROTOCOL_FILE = "src/Protocols/PostProtocol.ts";
const LAYER_SERVICE_FILE = "src/Services/PostService.ts";
const LAYER_COMPONENT_FILE = "components/PostRow.tsx";
const LAYER_SERVICE_IMPORT = 'import { PostService } from "@/Services/PostService.ts";';
const LAYER_FORBIDDEN_ERRORS = [{ messageId: LAYER_FORBIDDEN }];
ruleTester.run("layer-imports", localRules.rules["layer-imports"], {
  valid: [
    {
      name: "a Util imports a Protocol",
      filename: LAYER_UTIL_FILE,
      code: 'import { Clock } from "@/Protocols/ClockProtocol.ts";',
    },
    {
      name: "a Service imports a Util",
      filename: LAYER_SERVICE_FILE,
      code: 'import { SlugUtil } from "@/Utils/SlugUtil.ts";',
    },
    { name: "a Factory imports a Service", filename: "src/Factories/ContentFactory.ts", code: LAYER_SERVICE_IMPORT },
    {
      name: "a component imports a Util",
      filename: "components/Footer.tsx",
      code: 'import { ClassNameUtil } from "@/Utils/ClassNameUtil.ts";',
    },
    {
      name: "a component imports a Protocol",
      filename: "components/Footer.tsx",
      code: 'import { ContactProtocol } from "@/Protocols/ContactProtocol.ts";',
    },
    {
      name: "a page imports a Factory",
      filename: "app/page.tsx",
      code: 'import { ContentFactory } from "@/Factories/ContentFactory.ts";',
    },
    { name: "a package is not a layer", filename: LAYER_UTIL_FILE, code: 'import { z } from "zod";' },
    {
      name: "a relative import in the same layer",
      filename: LAYER_SERVICE_FILE,
      code: 'import { PostRow } from "./PostRow.ts";',
    },
  ],
  invalid: [
    {
      name: "a Util imports a Service",
      filename: LAYER_UTIL_FILE,
      code: LAYER_SERVICE_IMPORT,
      errors: LAYER_FORBIDDEN_ERRORS,
    },
    {
      name: "a Protocol imports a Schema",
      filename: LAYER_PROTOCOL_FILE,
      code: 'import { PostSchema } from "@/Schemas/PostSchema.ts";',
      errors: LAYER_FORBIDDEN_ERRORS,
    },
    {
      name: "a Service imports a Factory",
      filename: LAYER_SERVICE_FILE,
      code: 'import { ContentFactory } from "@/Factories/ContentFactory.ts";',
      errors: LAYER_FORBIDDEN_ERRORS,
    },
    {
      name: "a component imports a Service",
      filename: LAYER_COMPONENT_FILE,
      code: LAYER_SERVICE_IMPORT,
      errors: LAYER_FORBIDDEN_ERRORS,
    },
    {
      name: "a hook imports a Schema",
      filename: "hooks/useInView.ts",
      code: 'import { PostSchema } from "@/Schemas/PostSchema.ts";',
      errors: LAYER_FORBIDDEN_ERRORS,
    },
    {
      name: "a component re-exports a Service",
      filename: LAYER_COMPONENT_FILE,
      code: 'export { PostService } from "@/Services/PostService.ts";',
      errors: LAYER_FORBIDDEN_ERRORS,
    },
    {
      name: "a relative import that climbs to a higher layer",
      filename: LAYER_UTIL_FILE,
      code: 'import { PostService } from "../Services/PostService.ts";',
      errors: LAYER_FORBIDDEN_ERRORS,
    },
  ],
});
