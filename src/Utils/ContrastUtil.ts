export type Rgb = { red: number; green: number; blue: number };

export type ParsedColor = { rgb: Rgb; alpha: number };

const HEX = /^#([\da-f]{6})$/iu;
const FUNCTIONAL = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/iu;
const HEX_DIGITS_PER_CHANNEL = 2;
const HEX_RADIX = 16;
const RED_INDEX = 0;
const GREEN_INDEX = 1;
const BLUE_INDEX = 2;
const MATCH_RED = 1;
const MATCH_GREEN = 2;
const MATCH_BLUE = 3;
const MATCH_ALPHA = 4;
const CHANNEL_MAX = 255;
const LINEAR_CUTOFF = 0.040_45;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_SCALE = 1.055;
const GAMMA_EXPONENT = 2.4;
const LUMINANCE_RED = 0.2126;
const LUMINANCE_GREEN = 0.7152;
const LUMINANCE_BLUE = 0.0722;
const CONTRAST_OFFSET = 0.05;
const OPAQUE = 1;

const readHexChannel = (hex: string, index: number): number => {
  const start = index * HEX_DIGITS_PER_CHANNEL;
  return Number.parseInt(hex.slice(start, start + HEX_DIGITS_PER_CHANNEL), HEX_RADIX);
};

const resolveChannel = (foreground: number, background: number, alpha: number): number =>
  foreground * alpha + background * (OPAQUE - alpha);

const resolveLinearChannel = (channel: number): number => {
  const scaled = channel / CHANNEL_MAX;
  return scaled <= LINEAR_CUTOFF ? scaled / LINEAR_DIVISOR : ((scaled + GAMMA_OFFSET) / GAMMA_SCALE) ** GAMMA_EXPONENT;
};

export class ContrastUtil {
  static parseColor(value: string): ParsedColor {
    // Why: a color is written as #rrggbb or rgb()/rgba() in tokens.json; anything else is refused, so a typo cannot pass as a color.
    const trimmed = value.trim();
    const hex = HEX.exec(trimmed);
    if (hex !== null) {
      const digits = hex[1] ?? "";
      return {
        rgb: {
          red: readHexChannel(digits, RED_INDEX),
          green: readHexChannel(digits, GREEN_INDEX),
          blue: readHexChannel(digits, BLUE_INDEX),
        },
        alpha: OPAQUE,
      };
    }
    const functional = FUNCTIONAL.exec(trimmed);
    if (functional !== null) {
      const red = functional[MATCH_RED] ?? "";
      const green = functional[MATCH_GREEN] ?? "";
      const blue = functional[MATCH_BLUE] ?? "";
      const alpha = functional[MATCH_ALPHA];
      return {
        rgb: { red: Number(red), green: Number(green), blue: Number(blue) },
        alpha: alpha === undefined ? OPAQUE : Number(alpha),
      };
    }
    throw new Error(`ContrastUtil: unsupported color "${value}"`);
  }

  static resolveComposite(foreground: ParsedColor, background: Rgb): Rgb {
    // Why: a translucent color is what the eye sees only over what is behind it, so its ratio is computed over the named background.
    const { rgb, alpha } = foreground;
    return {
      red: resolveChannel(rgb.red, background.red, alpha),
      green: resolveChannel(rgb.green, background.green, alpha),
      blue: resolveChannel(rgb.blue, background.blue, alpha),
    };
  }

  static resolveLuminance({ red, green, blue }: Rgb): number {
    return (
      LUMINANCE_RED * resolveLinearChannel(red) +
      LUMINANCE_GREEN * resolveLinearChannel(green) +
      LUMINANCE_BLUE * resolveLinearChannel(blue)
    );
  }

  static resolveContrastRatio(first: Rgb, second: Rgb): number {
    // Why: WCAG's ratio is the lighter luminance over the darker, each with the same 0.05 offset, so the order of the two colors does not matter.
    const firstLuminance = ContrastUtil.resolveLuminance(first);
    const secondLuminance = ContrastUtil.resolveLuminance(second);
    const lighter = Math.max(firstLuminance, secondLuminance);
    const darker = Math.min(firstLuminance, secondLuminance);
    return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
  }
}
