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

const CHAT_SCHEMA_FILE = "src/Schemas/ChatSchema.ts";
const SVG_ELEMENT = '<svg viewBox="0 0 24 24" />';

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2024, sourceType: "module" } });

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
    { name: "a factory", filename: "src/Factories/ChatActionFactory.ts", code: FILE_SUFFIX_CODE },
    { name: "a schema", filename: CHAT_SCHEMA_FILE, code: FILE_SUFFIX_CODE },
    { name: "index.ts is exempt", filename: "src/Services/index.ts", code: FILE_SUFFIX_CODE },
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
      name: "Chat.ts in Protocols",
      filename: "src/Protocols/Chat.ts",
      code: FILE_SUFFIX_CODE,
      errors: [{ messageId: MISSING_SUFFIX, data: { file: "Chat.ts", folder: "Protocols", suffix: "Protocol" } }],
    },
    {
      name: "ChatAction.ts in Factories",
      filename: "src/Factories/ChatAction.ts",
      code: FILE_SUFFIX_CODE,
      errors: [{ messageId: MISSING_SUFFIX, data: { file: "ChatAction.ts", folder: "Factories", suffix: "Factory" } }],
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
mkdirSync(join(FIXTURE_ROOT, "src/Services"), { recursive: true });
const TIME_UTIL_SOURCE = join(FIXTURE_ROOT, "src/Utils/TimeUtil.ts");
writeFileSync(TIME_UTIL_SOURCE, "export class TimeUtil { static parsePointInTime() {} }");
const SERVICE_SOURCE = join(FIXTURE_ROOT, "src/Services/PostService.ts");
writeFileSync(SERVICE_SOURCE, "export class PostService { readPost() {} private loadFile() {} }");
const TIME_UTIL_TEST = join(FIXTURE_ROOT, "src/Utils/TimeUtil.test.ts");
const SERVICE_TEST = join(FIXTURE_ROOT, "src/Services/PostService.test.ts");

ruleTester.run("describe-target", localRules.rules["describe-target"], {
  valid: [
    {
      name: "the outer describe names the class and a public static method, with contexts inside",
      filename: TIME_UTIL_TEST,
      code: 'describe("TimeUtil.parsePointInTime()", () => { describe("on a period", () => { it("reads days", () => {}); }); });',
    },
    {
      name: "a public instance method, next to hooks at the top level",
      filename: SERVICE_TEST,
      code: 'beforeEach(() => {}); describe("PostService.readPost()", () => {});',
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
      filename: SERVICE_TEST,
      code: 'describe("PostService.loadFile()", () => {});',
      errors: [
        {
          messageId: "notPublic",
          data: { className: "PostService", method: "loadFile", source: "PostService.ts" },
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

const PANEL_FILE = "components/Panel.tsx";

const jsxRuleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2024, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("tokens-only", localRules.rules["tokens-only"], {
  valid: [
    {
      name: "tokens and the spacing scale",
      code: 'const A = "h-11 px-2.5 rounded-md bg-accent text-ink-2 max-md:size-11";',
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
    { name: "a template with named breakpoints", code: "const A = `grid ${flag} max-md:hidden`;" },
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

const E2E_SPEC_FILE = "e2e/home.spec.ts";
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
