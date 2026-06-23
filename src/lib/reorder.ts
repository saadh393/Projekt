export const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);

  if (item === undefined) {
    return items;
  }

  next.splice(toIndex, 0, item);
  return next;
};
