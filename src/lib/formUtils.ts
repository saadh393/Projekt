export const pathBasename = (path: string) => {
  const normalized = path.trim().replace(/\/+$/, "");
  const parts = normalized.split("/");
  return parts.at(-1) ?? "";
};

export const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const formatTags = (tags: string[]) => tags.join(", ");

export const timestamp = () => Date.now();
