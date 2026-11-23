import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import tseslint from "typescript-eslint";

const getFileStem = (filename) => {
  const base = filename.split(/[\\/]/).at(-1) ?? "";
  return base.replace(/\.[^.]+$/, "");
};

const SUFFIX_BY_FOLDER = {
  Factories: "Factory",
  Protocols: "Protocol",
  Schemas: "Schema",
  Services: "Service",
  Utils: "Util",
};
// Why: the only exempt name is `index` (a barrel has no role of its own); `components/`, `app/`, `scripts/` and `e2e/` are outside `src/`, so SUFFIX_BY_FOLDER is the only list of folders the rule covers.
const EXEMPT_STEMS = new Set(["index"]);
const SOURCE_FOLDER = /(?:^|\/)src\/([^/]+)\/(?:[^/]+\/)*([^/]+)$/;
const NAME_PARTS = /\.(?:test|d)$/;

const fileSuffix = {
  meta: {
    type: "suggestion",
    messages: {
      missing:
        '"{{file}}" is in src/{{folder}}/, so its name must end with "{{suffix}}" (before the extension, and before ".test").',
    },
  },
  create(context) {
    const match = SOURCE_FOLDER.exec(context.filename.replaceAll("\\", "/"));
    const folder = match?.[1] ?? "";
    const suffix = Object.hasOwn(SUFFIX_BY_FOLDER, folder) ? SUFFIX_BY_FOLDER[folder] : undefined;
    const file = match?.[2] ?? "";
    const stem = getFileStem(file).replace(NAME_PARTS, "");
    return {
      "Program:exit"(node) {
        if (suffix !== undefined && !EXEMPT_STEMS.has(stem) && !stem.endsWith(suffix)) {
          context.report({ node, messageId: "missing", data: { file, folder, suffix } });
        }
      },
    };
  },
};

const DESCRIBE_TARGET = /^([A-Z]\w*)\.(\w+)\(\)$/;
const HIDDEN_ACCESSIBILITY = new Set(["private", "protected"]);
const TEST_SUFFIX = /\.test$/;
const SOURCE_EXTENSION = ".ts";

const isPublicMember = (member) => {
  const isNamed = member.key?.type === "Identifier";
  return isNamed && !HIDDEN_ACCESSIBILITY.has(member.accessibility) && member.kind !== "constructor";
};

const listPublicMethods = (sourcePath, className) => {
  const { ast: program } = tseslint.parser.parseForESLint(readFileSync(sourcePath, "utf8"), { sourceType: "module" });
  const declarations = program.body.map((node) => node.declaration ?? node);
  const classNode = declarations.find((node) => node.type === "ClassDeclaration" && node.id?.name === className);
  const members = classNode?.body.body ?? [];
  return new Set(members.filter((member) => isPublicMember(member)).map((member) => member.key.name));
};

const getCalleeName = (statement) => {
  return statement.expression?.callee?.name;
};

const describeTarget = {
  meta: {
    type: "suggestion",
    messages: {
      format:
        'Name the outer describe "{{className}}.<method>()": the class this file tests and the public method the tests go through.',
      otherClass: 'This file tests {{className}}; the outer describe names "{{named}}".',
      notPublic: '{{className}} has no public method "{{method}}" in {{source}}; test through a public method.',
      outside: 'Put this test inside a describe named "{{className}}.<method>()".',
    },
  },
  create(context) {
    const className = getFileStem(context.filename).replace(TEST_SUFFIX, "");
    const testFolder = dirname(resolve(context.filename));
    const sourcePath = join(testFolder, `${className}${SOURCE_EXTENSION}`);
    let publicMethods;
    const listMethodsOfSource = () => {
      publicMethods ??= existsSync(sourcePath) ? listPublicMethods(sourcePath, className) : new Set();
      return publicMethods;
    };
    const checkDescribe = (call) => {
      const title = call.arguments[0];
      const match = DESCRIBE_TARGET.exec(typeof title?.value === "string" ? title.value : "");
      if (!match) {
        context.report({ node: title ?? call, messageId: "format", data: { className } });
        return;
      }
      const [, named, method] = match;
      if (named !== className) {
        context.report({ node: title, messageId: "otherClass", data: { className, named } });
        return;
      }
      if (!listMethodsOfSource().has(method)) {
        context.report({
          node: title,
          messageId: "notPublic",
          data: { className, method, source: `${className}${SOURCE_EXTENSION}` },
        });
      }
    };
    const reportOutside = (call) => {
      context.report({ node: call, messageId: "outside", data: { className } });
    };
    const CALLEE_TO_CHECK = { describe: checkDescribe, it: reportOutside, test: reportOutside };
    return {
      Program(program) {
        for (const statement of program.body) {
          const name = getCalleeName(statement);
          const check = Object.hasOwn(CALLEE_TO_CHECK, name ?? "") ? CALLEE_TO_CHECK[name] : undefined;
          check?.(statement.expression);
        }
      },
    };
  },
};

const COLOR_FUNCTIONS = new Set(["oklch", "oklab", "rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch"]);
const COLOR_KEYWORDS = new Set(["black", "white"]);
const WORD_SEPARATOR = /[^a-z-]+/iu;
const NUMBER_SEPARATOR = /[^a-z\d.-]+/iu;
const HEX_COLOR = /#[\da-f]{3,8}\b/iu;
const LENGTH_WITH_UNIT = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(?:px|rem|em)$/u;
const BREAKPOINT_VARIANTS = new Set(["min", "max", "@min", "@max"]);
const SPACING_SIDES = ["", "x", "y", "t", "r", "b", "l", "s", "e"];
const CORNER_SIDES = ["", "t", "r", "b", "l", "s", "e", "tl", "tr", "br", "bl", "ss", "se", "es", "ee"];
const SIZE_PREFIXES = new Set([
  ...["p", "m"].flatMap((base) => SPACING_SIDES.map((side) => `${base}${side}`)),
  ...["border", "scroll-m", "scroll-p"].flatMap((base) =>
    SPACING_SIDES.map((side) => (side === "" ? base : `${base}-${side}`)),
  ),
  ...CORNER_SIDES.map((corner) => (corner === "" ? "rounded" : `rounded-${corner}`)),
  "gap",
  "gap-x",
  "gap-y",
  "space-x",
  "space-y",
  "inset",
  "inset-x",
  "inset-y",
  "top",
  "right",
  "bottom",
  "left",
  "start",
  "end",
  "size",
  "w",
  "h",
  "min-w",
  "min-h",
  "max-w",
  "max-h",
  "text",
  "leading",
  "tracking",
  "outline",
  "outline-offset",
  "underline-offset",
  "decoration",
  "basis",
  "translate-x",
  "translate-y",
]);

const hasRawColor = (value) => {
  const lower = value.toLowerCase();
  const hasColorFunction = [...COLOR_FUNCTIONS].some((name) => lower.includes(`${name}(`));
  const hasColorKeyword = lower.split(WORD_SEPARATOR).some((word) => COLOR_KEYWORDS.has(word));
  return hasColorFunction || hasColorKeyword || HEX_COLOR.test(value);
};

const hasOneOffLength = (value) => {
  return value.split(NUMBER_SEPARATOR).some((word) => {
    const match = LENGTH_WITH_UNIT.exec(word);
    return match !== null && Number(match[1]) !== 0;
  });
};

const listTopLevelSegments = (token) => {
  const segments = [];
  for (const part of token.split(":")) {
    const previous = segments.at(-1);
    // Why: a colon inside brackets (`[&:hover]`, `[mask:url(a)]`) belongs to the arbitrary value, not to the variant chain.
    const isInsideBrackets = previous !== undefined && previous.split("[").length > previous.split("]").length;
    if (isInsideBrackets) {
      segments[segments.length - 1] = `${previous}:${part}`;
    } else {
      segments.push(part);
    }
  }
  return segments;
};

const findThemeProblems = (token) => {
  const segments = listTopLevelSegments(token);
  const lastIndex = segments.length - 1;
  return segments.flatMap((segment, index) => {
    const isVariant = index < lastIndex;
    const open = segment.indexOf("[");
    const close = segment.lastIndexOf("]");
    if (open === -1 || close < open || (isVariant && open === 0)) {
      return [];
    }
    const prefix = segment.slice(0, open).replace(/-$/u, "");
    const value = segment.slice(open + 1, close);
    if (isVariant) {
      return BREAKPOINT_VARIANTS.has(prefix) && hasOneOffLength(value) ? ["oneOffBreakpoint"] : [];
    }
    if (hasRawColor(value)) {
      return ["rawColor"];
    }
    return SIZE_PREFIXES.has(prefix.replace(/^-/u, "")) && hasOneOffLength(value) ? ["oneOffLength"] : [];
  });
};

const tokensOnly = {
  meta: {
    type: "problem",
    messages: {
      rawColor:
        "`{{token}}` writes a color in the class. Use a color token (add it to design/system/tokens.json and run `pnpm design:tokens` if it is missing).",
      oneOffLength:
        "`{{token}}` writes a size in the class. Use the spacing scale or a token (add it to design/system/tokens.json and run `pnpm design:tokens` if it is missing).",
      oneOffBreakpoint:
        "`{{token}}` writes a breakpoint in the class. Use a Tailwind breakpoint (`sm:`, `md:`, `max-md:`), never a width in the class.",
    },
  },
  create(context) {
    const check = (node, text) => {
      const tokens = text.split(/\s+/u).filter((token) => token.includes("["));
      for (const token of tokens) {
        for (const messageId of findThemeProblems(token)) {
          context.report({ node, messageId, data: { token } });
        }
      }
    };
    return {
      Literal(node) {
        if (typeof node.value === "string") {
          check(node, node.value);
        }
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? "");
      },
    };
  },
};

const OWN_ICONS_FOLDER = "components/Icons/";

const noInlineSvg = {
  meta: {
    type: "problem",
    messages: {
      inlineSvg:
        'An inline <svg> belongs only in components/Icons/. For a standard icon use the icon library (lucide-react, through <Icon name="..." />); for an icon of our own add a file to components/Icons/ and say in it why the library has no equal.',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll("\\", "/");
    if (filename.includes(OWN_ICONS_FOLDER)) {
      return {};
    }
    return {
      "JSXOpeningElement[name.name='svg']"(node) {
        context.report({ node, messageId: "inlineSvg" });
      },
    };
  },
};

const E2E_TAGS = ["@critical-flow", "@needs-browser"];
// Why: the same tag repeats in every test, so specs may name it through the constants of e2e/tags.ts.
const E2E_TAG_CONSTANTS = ["CRITICAL_FLOW", "NEEDS_BROWSER"];

const tagValues = (tagProperty) => {
  return tagProperty.value.elements ?? [tagProperty.value];
};

const NODE_TYPE_TO_IS_ALLOWED_TAG = new Map([
  ["Literal", (node) => E2E_TAGS.includes(node.value)],
  ["Identifier", (node) => E2E_TAG_CONSTANTS.includes(node.name)],
]);

const isAllowedTag = (value) => {
  return NODE_TYPE_TO_IS_ALLOWED_TAG.get(value?.type)?.(value) ?? false;
};

const e2eTag = {
  meta: {
    type: "problem",
    messages: {
      missing: `Give this test a tag: test("...", { tag: "@critical-flow" }, ...). Allowed tags: ${E2E_TAGS.join(", ")}.`,
      unknown: `Use only these tags: ${E2E_TAGS.join(", ")}.`,
    },
  },
  create(context) {
    return {
      "CallExpression[callee.type='Identifier'][callee.name='test']"(node) {
        const options = node.arguments.find((argument) => argument.type === "ObjectExpression");
        const tagProperty = options?.properties.find(
          (property) => property.type === "Property" && property.key.name === "tag",
        );
        if (tagProperty === undefined) {
          context.report({ node, messageId: "missing" });
          return;
        }
        for (const value of tagValues(tagProperty).filter((candidate) => !isAllowedTag(candidate))) {
          context.report({ node: value ?? tagProperty, messageId: "unknown" });
        }
      },
    };
  },
};

const noFixedWait = {
  meta: {
    type: "problem",
    messages: {
      fixed:
        "Wait for the condition, not for time: use an expect that retries (toBeVisible, expect.poll) or a fake timer.",
    },
  },
  create(context) {
    return {
      "CallExpression[callee.name=/^(waitForTimeout|setTimeout)$/], CallExpression[callee.property.name=/^(waitForTimeout|setTimeout)$/]"(
        node,
      ) {
        context.report({ node, messageId: "fixed" });
      },
    };
  },
};

const noTestRetries = {
  meta: {
    type: "problem",
    messages: {
      retries:
        "Do not retry tests: a test that passes on a rerun hides a flaky test. Fix its cause and keep `retries` at 0.",
    },
  },
  create(context) {
    return {
      "Property[key.name='retries']"(node) {
        const isZero = node.value.type === "Literal" && node.value.value === 0;
        if (!isZero) {
          context.report({ node, messageId: "retries" });
        }
      },
    };
  },
};

const NOT_OWN_THIS_SCOPE_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ClassBody"]);
const IGNORED_NODE_KEYS = new Set(["parent", "loc", "range", "typeAnnotation"]);

const getChildNodes = (node) => {
  return Object.entries(node)
    .filter(([key]) => !IGNORED_NODE_KEYS.has(key))
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter((value) => typeof value?.type === "string");
};

const isPropertyName = (node) => {
  const { parent } = node;
  return !parent.computed && (parent.property === node || parent.key === node);
};

const isOwnThisOrArguments = (node) => {
  const isArgumentsName = node.name === "arguments" && !isPropertyName(node);
  return node.type === "ThisExpression" || isArgumentsName;
};

const readOwnThisOrArguments = (node) => {
  // Why: an arrow has no `this` or `arguments` of its own, so a function that reads them has to stay a function.
  if (isOwnThisOrArguments(node)) {
    return true;
  }
  if (NOT_OWN_THIS_SCOPE_TYPES.has(node.type)) {
    return false;
  }
  return getChildNodes(node).some(readOwnThisOrArguments);
};

const isAssertionSignature = (node) => {
  return node.returnType?.typeAnnotation?.type === "TSTypePredicate" && node.returnType.typeAnnotation.asserts === true;
};

const isConvertible = (node) => {
  // Why: an arrow cannot be a generator, cannot declare an assertion signature and has its own `this`, so these stay functions.
  return !node.generator && !isAssertionSignature(node) && !getChildNodes(node).some(readOwnThisOrArguments);
};

const arrowFunction = {
  meta: {
    type: "suggestion",
    fixable: "code",
    messages: {
      declaration: 'Use an arrow function instead of the function declaration "{{ name }}".',
      expression: 'Use an arrow function instead of the function expression assigned to "{{ name }}".',
    },
  },
  create(context) {
    const { sourceCode } = context;

    const buildArrow = (node, afterName) => {
      // Why: an arrow keeps the parameters, the return type and the body text; only the `function` keyword goes.
      const asyncPrefix = node.async ? "async " : "";
      const signature = sourceCode.text.slice(afterName, node.body.range[0]).trim();
      return `${asyncPrefix}${signature} => ${sourceCode.getText(node.body)}`;
    };

    const reportDeclaration = (node) => {
      const { id } = node;
      // Why: an overloaded function needs its signatures declared with `function`, so the implementation keeps the form too.
      const isOverloaded = id && sourceCode.getDeclaredVariables(node)[0]?.defs.length > 1;
      if (isOverloaded || !isConvertible(node)) {
        return;
      }
      const name = id?.name ?? "default";
      const arrow = buildArrow(
        node,
        id ? id.range[1] : sourceCode.getFirstToken(node, { filter: (token) => token.value === "function" }).range[1],
      );
      const isDefaultExport = node.parent.type === "ExportDefaultDeclaration";
      const fix = (fixer) => {
        if (isDefaultExport && id) {
          return fixer.replaceText(node.parent, `const ${name} = ${arrow};\n\nexport default ${name};`);
        }
        if (isDefaultExport) {
          return fixer.replaceText(node.parent, `export default ${arrow};`);
        }
        return fixer.replaceText(node, `const ${name} = ${arrow};`);
      };
      context.report({ node: id ?? node, messageId: "declaration", data: { name }, fix });
    };

    const reportExpression = (declarator, node) => {
      if (!isConvertible(node)) {
        return;
      }
      const name = declarator.id.name;
      const functionKeyword = sourceCode.getFirstToken(node, { filter: (token) => token.value === "function" });
      const arrow = buildArrow(node, node.id ? node.id.range[1] : functionKeyword.range[1]);
      context.report({
        node,
        messageId: "expression",
        data: { name },
        fix: (fixer) => fixer.replaceText(node, arrow),
      });
    };

    return {
      FunctionDeclaration: reportDeclaration,
      "VariableDeclarator[id.type='Identifier'][init.type='FunctionExpression']": (node) =>
        reportExpression(node, node.init),
    };
  },
};

export const localRules = {
  rules: {
    "file-suffix": fileSuffix,
    "describe-target": describeTarget,
    "tokens-only": tokensOnly,
    "no-inline-svg": noInlineSvg,
    "e2e-tag": e2eTag,
    "no-fixed-wait": noFixedWait,
    "no-test-retries": noTestRetries,
    "arrow-function": arrowFunction,
  },
};

export default { meta: { name: "local" }, rules: localRules.rules };
