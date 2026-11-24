import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@components/ProjectCard.tsx";
import type { ProjectKind } from "@/Protocols/ProjectProtocol.ts";

const URL_WITH_PATH = "https://zerod.guilherr.me/room/abc";
const UNBROKEN_NAME = "Supercalifragilisticexpialidociousxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const KIND_LABELS: [ProjectKind, string][] = [
  ["application", "Application"],
  ["mcp", "MCP server"],
  ["skill", "Skill"],
  ["library", "Library"],
  ["game", "Game"],
  ["other", "Other"],
];

describe("ProjectCard", () => {
  it("shows only the host as text and no P/NN label", () => {
    const markup = renderToStaticMarkup(
      <ProjectCard name="Zerod" description="A game" url={URL_WITH_PATH} kind="game" />,
    );

    expect(markup).not.toMatch(/P\/\d\d/u);
    expect(markup).toContain("zerod.guilherr.me");
    expect(markup).toMatch(/<span[^>]*>zerod\.guilherr\.me<\/span>/u);
  });

  it.each(KIND_LABELS)("shows the %s kind as one chip reading %s", (kind, label) => {
    const markup = renderToStaticMarkup(
      <ProjectCard name="Zerod" description="A game" url={URL_WITH_PATH} kind={kind} />,
    );

    expect(markup).toContain(`>${label}</span>`);
    expect(markup).not.toContain("<ul");
  });

  it("lets an unbroken 60-character name wrap inside the card", () => {
    const markup = renderToStaticMarkup(
      <ProjectCard name={UNBROKEN_NAME} description="A game" url={URL_WITH_PATH} kind="game" />,
    );

    expect(markup).toMatch(/<h3[^>]*wrap-anywhere[^>]*>/u);
  });

  it("truncates only the host, with an ellipsis", () => {
    const markup = renderToStaticMarkup(
      <ProjectCard name="Zerod" description="A game" url={URL_WITH_PATH} kind="game" />,
    );

    expect(markup).toMatch(/<span[^>]*truncate[^>]*>zerod\.guilherr\.me<\/span>/u);
  });
});
