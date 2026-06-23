import { pathBasename } from "./formUtils";

export const formatLauncherName = (path: string) =>
  pathBasename(path).replace(/\.app$/i, "").trim();

export const isMacAppPath = (path: string) => /\.app$/i.test(path.trim());
