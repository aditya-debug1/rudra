export function removeElementAtIndex<T>(arr: T[], index: number): T[] {
  if (index >= 0 && index < arr.length) {
    arr.splice(index, 1);
  }
  return arr;
}

export const getLabelFromValue = (
  options: { label: string; value: string }[],
  value: string,
): string | undefined => {
  return options.find((option) => option.value === value)?.label;
};
