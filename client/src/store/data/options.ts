import { ComboboxOption } from "@/components/custom ui/combobox";

export const requirementOptions = [
  { label: "1 BHK", value: "1bhk" },
  { label: "2 BHK", value: "2bhk" },
  { label: "2.5 BHK", value: "2.5bhk" },
  { label: "3.5 BHK", value: "3.5bhk" },
  { label: "4.5 BHK", value: "4.5bhk" },
  { label: "Shop", value: "shop" },
  { label: "Office", value: "office" },
];

export const budgetOptions = [
  { label: "₹", value: 1 },
  { label: "K", value: 1000 },
  { label: "Lacs", value: 100000 },
  { label: "Cr", value: 10000000 },
];

export const refDefaultOptions: ComboboxOption[] = [
  { label: "N/A", value: "N/A" },
  { label: "Direct Walking", value: "walking" },
];

export const ignoreRole = ["Developer", "SkipRole"];

export const statusOptions = [
  { label: "Lost", value: "lost" },
  { label: "Cold", value: "cold" },
  { label: "Warm", value: "warm" },
  { label: "Hot", value: "hot" },
  { label: "Booked", value: "booked" },
];
