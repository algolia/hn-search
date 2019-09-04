import { HNSettings } from "../providers/Search.types";

const supportsMatchMedia = (): boolean =>
  typeof window.matchMedia === "function";

const getPreferredTheme = (): HNSettings["theme"] => {
  if (!supportsMatchMedia()) return "light";
  if (window.matchMedia("prefers-color-scheme: dark").matches) return "dark";
  return "light";
};

export default getPreferredTheme;
