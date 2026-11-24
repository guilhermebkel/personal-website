export const BOARD_DIR = "design/prototype";
export const CANVAS_FILE = "design/prototype/canvas.json";
export const BOARD_EXTENSION = ".dc.html";

const DESKTOP = 1440;
const MOBILE = 390;
const ROOT_ROUTE = "/";
const MAIN_TARGET = "main";
const POST_ROUTE = "/blog/how-to-install-rancher-inside-aws-eks/";
const NOT_FOUND_ROUTE = "/404/";
const SECTION_IDS = { intro: "#intro", projects: "#projects", posts: "#posts", quotes: "#quotes", contact: "#contact" };

// Why: a board maps to one route, one viewport width and one element to capture (or "page" for the whole viewport);
// Why: LogoRound and Curvas are reference only, so they have no route.
export const BOARD_MAPPING = {
  Intro: { route: ROOT_ROUTE, width: DESKTOP, target: SECTION_IDS.intro },
  IntroMobile: { route: ROOT_ROUTE, width: MOBILE, target: SECTION_IDS.intro },
  Projetos: { route: ROOT_ROUTE, width: DESKTOP, target: SECTION_IDS.projects },
  ProjetosMobile: { route: ROOT_ROUTE, width: MOBILE, target: SECTION_IDS.projects },
  Posts: { route: ROOT_ROUTE, width: DESKTOP, target: SECTION_IDS.posts },
  PostsMobile: { route: ROOT_ROUTE, width: MOBILE, target: SECTION_IDS.posts },
  Citacoes: { route: ROOT_ROUTE, width: DESKTOP, target: SECTION_IDS.quotes },
  CitacoesMobile: { route: ROOT_ROUTE, width: MOBILE, target: SECTION_IDS.quotes },
  Contato: { route: ROOT_ROUTE, width: DESKTOP, target: SECTION_IDS.contact },
  ContatoMobile: { route: ROOT_ROUTE, width: MOBILE, target: SECTION_IDS.contact },
  Blog: { route: "/blog/", width: DESKTOP, target: MAIN_TARGET },
  BlogMobile: { route: "/blog/", width: MOBILE, target: MAIN_TARGET },
  Post: { route: POST_ROUTE, width: DESKTOP, target: MAIN_TARGET },
  PostMobile: { route: POST_ROUTE, width: MOBILE, target: MAIN_TARGET },
  Assinatura: { route: POST_ROUTE, width: DESKTOP, target: "p:text-is('Written by') >> xpath=.." },
  MenuMobile: { route: ROOT_ROUTE, width: MOBILE, target: "page", openMenu: true },
  NotFound: { route: NOT_FOUND_ROUTE, width: DESKTOP, target: MAIN_TARGET },
  NotFoundMobile: { route: NOT_FOUND_ROUTE, width: MOBILE, target: MAIN_TARGET },
};

export const REFERENCE_ONLY_BOARDS = ["LogoRound", "Curvas"];

export const loadBoards = (canvas) => {
  // Why: pure, so the tests need no files or browser. the board list from canvas.json, one entry per .dc.html file, sorted by name.
  return Object.entries(canvas.boards)
    .map(([file, size]) => ({
      file,
      name: file.slice(0, -BOARD_EXTENSION.length),
      title: size.title ?? file,
      width: size.w,
      height: size.h,
    }))
    .sort((first, second) => first.name.localeCompare(second.name));
};

export const resolveBoardNames = ({ requested, boards }) => {
  // Why: pure, so the tests need no files or browser. the requested names (with or without the extension) checked against the boards; an unknown name lists the valid ones.
  const valid = boards.map((board) => board.name);
  if (requested.length === 0) {
    return { names: valid };
  }
  const names = requested.map((raw) => (raw.endsWith(BOARD_EXTENSION) ? raw.slice(0, -BOARD_EXTENSION.length) : raw));
  const unknown = names.filter((name) => !valid.includes(name));
  if (unknown.length > 0) {
    return { error: `Unknown board: ${unknown.join(", ")}. Valid boards: ${valid.join(", ")}.` };
  }
  return { names };
};

export const listMappedBoardNames = (boards) => {
  // Why: pure, so the tests need no files or browser. The board names that have a route, in the order of the boards.
  return boards.map((board) => board.name).filter((name) => name in BOARD_MAPPING);
};

export const selectBoardsForRoutes = ({ routes, boards }) => {
  // Why: pure, so the tests need no files or browser. the boards for a route (prototype:compare takes routes); an unknown route is an error.
  const known = new Set(Object.values(BOARD_MAPPING).map((mapping) => mapping.route));
  if (routes.length === 0) {
    return { names: listMappedBoardNames(boards) };
  }
  const unknown = routes.filter((route) => !known.has(route));
  if (unknown.length > 0) {
    return { error: `No board is mapped to: ${unknown.join(", ")}. Mapped routes: ${[...known].join(", ")}.` };
  }
  const selected = listMappedBoardNames(boards).filter((name) => routes.includes(BOARD_MAPPING[name].route));
  return { names: selected };
};

export const captureFileName = (name, kind) => {
  // Why: pure, so the tests need no files or browser. where a board's PNG goes, relative to the repository root: <Board>.png for the board, <Board>.site.png or <Board>.compare.png for the rest.
  const suffix = kind === undefined ? "" : `.${kind}`;
  return `test-results/prototype/${name}${suffix}.png`;
};
