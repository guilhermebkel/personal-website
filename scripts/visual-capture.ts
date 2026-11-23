import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { page, userEvent } from "vitest/browser";

export type CaptureState = {
  name: string;
  // Why: a state is forced on the element the render selected with `target`; the rest state has no action.
  act?: (target: HTMLElement) => Promise<void>;
};

export type CaptureOptions = {
  // Why: the name becomes the PNG file name, so each component's captures stay apart in test-results/visual/.
  name: string;
  element: ReactElement;
  target: string;
  states: CaptureState[];
};

// Why: transitions and animations are frozen at their end state, as with the reduced-motion reset of the site.
const FROZEN_MOTION_CSS = "*,*::before,*::after{transition:none!important;animation:none!important;}";
// Why: the browser resolves a screenshot path from the render file's folder (test-results/visual-renders/), so the output is one level up.
const OUTPUT_DIR = "../visual";

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });

// Why: a state is compared with the others only when its fonts are loaded, so the capture waits for them.
const mountRender = (element: ReactElement) => {
  const container = document.createElement("div");
  container.id = "visual-root";
  document.body.append(container);
  const style = document.createElement("style");
  style.textContent = FROZEN_MOTION_CSS;
  document.head.append(style);
  const root = createRoot(container);
  root.render(element);
  return { container, root };
};

// Why: React 19 mounts asynchronously, so the target may not be in the DOM on the first frame; it is waited for a bounded number of frames.
const MAX_MOUNT_FRAMES = 60;
const waitForTarget = async (container: HTMLElement, target: string) => {
  for (let frame = 0; frame < MAX_MOUNT_FRAMES; frame += 1) {
    const found = container.querySelector<HTMLElement>(target);
    if (found !== null) {
      return found;
    }
    await waitForPaint();
  }
  return null;
};

export const captureStates = async ({ name, element, target, states }: CaptureOptions): Promise<void> => {
  const { container, root } = mountRender(element);
  await document.fonts.ready;
  for (const state of states) {
    const targetElement = await waitForTarget(container, target);
    if (targetElement === null) {
      throw new Error(`No element matches "${target}" in the render of ${name}.`);
    }
    // Why: the pointer goes back to the body first, so a hoverTarget from the previous state does not stay on.
    await userEvent.hover(document.body);
    await waitForPaint();
    await state.act?.(targetElement);
    await waitForPaint();
    await page.screenshot({ path: `${OUTPUT_DIR}/${name}-${state.name}.png` });
  }
  root.unmount();
  container.remove();
};

export const hoverTarget = async (target: HTMLElement) => {
  await userEvent.hover(target);
};

export const focusWithKeyboard = async (target: HTMLElement) => {
  // Why: focus-visible shows only after keyboard focus, so the state is reached with Tab, as a keyboard user does.
  target.focus();
  await userEvent.keyboard("{Tab}");
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
};
