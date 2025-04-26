export const toProperCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function formatAddress(input: string): string {
  const cleaned = input.replace(/^function:/i, "");
  const parts = cleaned.split(",");
  const formatted = parts.map((part) =>
    part
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "),
  );
  return formatted.join(", ");
}

export function capitalizeWords(str: string) {
  return str
    .split(" ")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function addNumberingToLines(input: string): string {
  return input
    .split("\n")
    .map((line, index) => `${index + 1}) ${toProperCase(line)}`)
    .join("\n");
}
