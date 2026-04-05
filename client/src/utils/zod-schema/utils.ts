import { z } from "zod";

// Verhoeff tables
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const ENTITY_TYPES = new Set([
  "P",
  "C",
  "H",
  "F",
  "A",
  "T",
  "B",
  "L",
  "J",
  "G",
]);

export const aadhaarSchema = z
  .string()
  .transform((val) => val.replace(/[\s\-]/g, ""))
  .pipe(
    z
      .string()
      .min(0)
      .refine(
        (val) => val === "" || /^[2-9][0-9]{11}$/.test(val),
        "Aadhaar must be 12 digits and start with 2-9",
      )
      .refine((cleaned) => {
        if (cleaned === "") return true;
        let c = 0;
        const reversed = cleaned.split("").reverse().map(Number);
        for (let i = 0; i < reversed.length; i++) {
          c = d[c][p[i % 8][reversed[i]]];
        }
        return c === 0;
      }, "Invalid Aadhaar number (checksum failed)"),
  );

export const panSchema = z
  .string()
  .transform((val) => val.trim().toUpperCase())
  .pipe(
    z
      .string()
      .min(0)
      .refine(
        (val) => val === "" || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val),
        "PAN must be in format AAAAA9999A",
      )
      .refine(
        (cleaned) => cleaned === "" || ENTITY_TYPES.has(cleaned[3]),
        "Invalid entity type in PAN (4th character)",
      ),
  );

// Inferred types
export type Aadhaar = z.infer<typeof aadhaarSchema>;
export type PAN = z.infer<typeof panSchema>;
