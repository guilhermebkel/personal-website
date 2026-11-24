type Viewport = { width: number; height: number };

export const screenNameToViewport: Record<"desktop" | "tablet" | "mobile", Viewport> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};
