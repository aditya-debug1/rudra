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

// This function gives us a value in what number ranges like K,L,CR
export const getNumericRangeBase = (num: number): string => {
  if (num === 0) return "";
  if (!num) return ""; // handles undefined/null

  const absoluteNum = Math.abs(num);

  // For thousands (1,000 - 99,999)
  if (absoluteNum >= 1000 && absoluteNum < 100000) return "1000";

  // For lakhs (1,00,000 - 99,99,999)
  if (absoluteNum >= 100000 && absoluteNum < 10000000) return "100000";

  // For crores (1,00,00,000 and above)
  if (absoluteNum >= 10000000) return "10000000";

  // For numbers less than 1000 or others
  return "";
};

export function formatToCurrency(amount: number): string {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function numberToWords(amount: number): string {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function inWords(num: number): string {
    if (num < 20) return a[num];
    if (num < 100)
      return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
    if (num < 1000)
      return (
        a[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " and " + inWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        inWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + inWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        inWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 ? " " + inWords(num % 100000) : "")
      );
    return (
      inWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 ? " " + inWords(num % 10000000) : "")
    );
  }

  return inWords(amount) + " Only";
}

export const getOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
