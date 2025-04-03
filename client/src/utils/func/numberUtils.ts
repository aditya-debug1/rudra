export const simplifyNumber = (num: number): string => {
  if (num === 0) return "0";
  if (!num) return "0"; // handles undefined/null

  const absoluteNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  // For thousands (1,000 - 99,999)
  if (absoluteNum >= 1000 && absoluteNum < 100000) {
    const value = absoluteNum / 1000;
    return `${sign}${value % 1 === 0 ? value : value.toFixed(1)}K`.replace(
      ".0",
      "",
    );
  }

  // For lakhs (1,00,000 - 99,99,999)
  if (absoluteNum >= 100000 && absoluteNum < 10000000) {
    const value = absoluteNum / 100000;
    return `${sign}${value % 1 === 0 ? value : value.toFixed(1)}L`.replace(
      ".0",
      "",
    );
  }

  // For crores (1,00,00,000 and above)
  if (absoluteNum >= 10000000) {
    const value = absoluteNum / 10000000;
    return `${sign}${value % 1 === 0 ? value : value.toFixed(1)}Cr`.replace(
      ".0",
      "",
    );
  }

  // For numbers less than 1000
  return `${sign}${absoluteNum}`;
};
