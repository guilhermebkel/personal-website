import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export class ClassNameUtil {
  static merge(...inputs: ClassValue[]): string {
    const joined = clsx(inputs);
    return twMerge(joined);
  }
}
