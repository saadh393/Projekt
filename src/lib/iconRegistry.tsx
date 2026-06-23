import {
  AppWindow,
  Archive,
  Blocks,
  BookOpen,
  Box,
  Briefcase,
  Building2,
  CircleDashed,
  Code2,
  Database,
  Folder,
  Globe2,
  GraduationCap,
  Hammer,
  Landmark,
  Layers3,
  Library,
  LucideIcon,
  Package,
  Palette,
  Rocket,
  Server,
  Shield,
  Store,
  SquareTerminal,
  Wrench,
} from "lucide-react";

export const categoryIconNames = [
  "app-window",
  "archive",
  "blocks",
  "book-open",
  "box",
  "briefcase",
  "building-2",
  "code-2",
  "database",
  "folder",
  "globe-2",
  "graduation-cap",
  "hammer",
  "landmark",
  "layers-3",
  "library",
  "package",
  "palette",
  "rocket",
  "server",
  "shield",
  "store",
  "terminal-square",
  "wrench",
];

const iconMap: Record<string, LucideIcon> = {
  "app-window": AppWindow,
  archive: Archive,
  blocks: Blocks,
  "book-open": BookOpen,
  box: Box,
  briefcase: Briefcase,
  "building-2": Building2,
  "code-2": Code2,
  database: Database,
  folder: Folder,
  "globe-2": Globe2,
  "graduation-cap": GraduationCap,
  hammer: Hammer,
  landmark: Landmark,
  "layers-3": Layers3,
  library: Library,
  package: Package,
  palette: Palette,
  rocket: Rocket,
  server: Server,
  shield: Shield,
  store: Store,
  "terminal-square": SquareTerminal,
  wrench: Wrench,
};

export const getCategoryIcon = (name: string) => iconMap[name] ?? CircleDashed;

export const filterIconNames = (query: string) => {
  const value = query.trim().toLowerCase();
  if (!value) {
    return categoryIconNames;
  }

  return categoryIconNames.filter((name) => name.includes(value));
};
