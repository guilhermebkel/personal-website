import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@components/ProjectCard.tsx";

const URL_WITH_PATH = "https://zerod.guilherr.me/room/abc";
const UNBROKEN_NAME = "Supercalifragilisticexpialidociousxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

describe("ProjectCard", () => {
  it("labels the first project P/01 and shows only the host as text", () => {
    const markup = renderToStaticMarkup(
      <ProjectCard index={0} name="Zerod" description="A game" url={URL_WITH_PATH} tags={[]} />,
    );

    expect(markup).toContain("P/01");
    expect(markup).toContain("zerod.guilherr.me");
    expect(markup).toMatch(/<span[^>]*>zerod\.guilherr\.me<\/span>/u);
  });

  it("lets an unbroken 60-character name wrap inside the card", () => {
    const markup = renderToStaticMarkup(
      <ProjectCard index={0} name={UNBROKEN_NAME} description="A game" url={URL_WITH_PATH} tags={[]} />,
    );

    expect(markup).toMatch(/<h3[^>]*wrap-anywhere[^>]*>/u);
  });

  it("truncates only the host, with an ellipsis", () => {
    const markup = renderToStaticMarkup(
      <ProjectCard index={0} name="Zerod" description="A game" url={URL_WITH_PATH} tags={[]} />,
    );

    expect(markup).toMatch(/<span[^>]*truncate[^>]*>zerod\.guilherr\.me<\/span>/u);
  });

  it("renders no tag row when the project has no tags", () => {
    const markup = renderToStaticMarkup(
      <ProjectCard index={0} name="Zerod" description="A game" url={URL_WITH_PATH} tags={[]} />,
    );

    expect(markup).not.toContain("<ul");
  });
});
