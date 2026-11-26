import { createCssVariablesTheme, createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import diff from "shiki/langs/diff.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import markdown from "shiki/langs/markdown.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import yaml from "shiki/langs/yaml.mjs";

const THEME_NAME = "site";
const VARIABLE_PREFIX = "--shiki-";
const LANGUAGE_PREFIX = "language-";
const VARIABLE_IN_STYLE = /var\((--shiki-[a-z-]+)\)/u;

type ShikiVariable =
  | "--shiki-token-keyword"
  | "--shiki-token-string"
  | "--shiki-token-string-expression"
  | "--shiki-token-comment"
  | "--shiki-token-constant"
  | "--shiki-token-function";

const variableToClassName: Record<ShikiVariable, string> = {
  "--shiki-token-keyword": "tok-keyword",
  "--shiki-token-string": "tok-string",
  "--shiki-token-string-expression": "tok-string",
  "--shiki-token-comment": "tok-comment",
  "--shiki-token-constant": "tok-constant",
  "--shiki-token-function": "tok-function",
};

type TreeNode = {
  type: "element" | "text" | "root";
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: TreeNode[];
};

const highlighter = createHighlighterCoreSync({
  themes: [createCssVariablesTheme({ name: THEME_NAME, variablePrefix: VARIABLE_PREFIX, fontStyle: false })],
  langs: [bash, css, diff, html, javascript, json, markdown, tsx, typescript, yaml],
  engine: createJavaScriptRegexEngine(),
});

const readClassName = (style: unknown): string | undefined => {
  // Why: the colors are variables, not inline styles, because an inline style fails the html-validate rule that keeps the page free of them; the variables resolve to the site's syntax tokens.
  const text = typeof style === "string" ? style : "";
  const match = VARIABLE_IN_STYLE.exec(text);
  const variable = match?.[1];
  return variable !== undefined && variable in variableToClassName
    ? variableToClassName[variable as ShikiVariable]
    : undefined;
};

const extractText = (node: TreeNode): string => {
  if (node.type === "text") {
    return node.value ?? "";
  }
  const parts = (node.children ?? []).map(extractText);
  return parts.join("");
};

const applyHighlight = (code: TreeNode, language: string): TreeNode[] | undefined => {
  try {
    const root = highlighter.codeToHast(extractText(code), {
      lang: language,
      theme: THEME_NAME,
      transformers: [
        {
          span(node) {
            const element = node as unknown as TreeNode;
            const className = readClassName(element.properties?.style);
            delete element.properties?.style;
            if (className !== undefined) {
              element.properties = { ...element.properties, className: [className] };
            }
          },
        },
      ],
    });
    const pre = root.children[0] as TreeNode | undefined;
    const codeNode = pre?.children?.[0];
    return codeNode?.children;
  } catch {
    // Why: a language the highlighter does not know is shown as plain text, never as a failed build.
    return undefined;
  }
};

const readLanguage = (code: TreeNode): string | undefined => {
  const classes = (code.properties?.className as string[] | undefined) ?? [];
  const name = classes.find((item) => item.startsWith(LANGUAGE_PREFIX));
  return name?.slice(LANGUAGE_PREFIX.length);
};

const visitTree = (node: TreeNode): void => {
  if (node.tagName === "pre") {
    const code = node.children?.find((child) => child.tagName === "code");
    const language = code === undefined ? undefined : readLanguage(code);
    if (code !== undefined && language !== undefined) {
      const highlighted = applyHighlight(code, language);
      if (highlighted !== undefined) {
        code.children = highlighted;
      }
    }
    return;
  }
  for (const child of node.children ?? []) {
    visitTree(child);
  }
};

export class CodeHighlightUtil {
  static buildRehypePlugin = () => (tree: TreeNode) => {
    visitTree(tree);
  };
}
