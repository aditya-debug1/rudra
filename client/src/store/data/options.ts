import { ComboboxOption } from "@/components/custom ui/combobox";

export const projectOptions = [
  { label: "Rudra Kristina", value: "rudra_kristina" },
  { label: "Rudra Kristina 2", value: "rudra_kristina_2" },
  { label: "Rudra Kristina 3", value: "rudra_kristina_3" },
  { label: "Rudra Kristina 4", value: "rudra_kristina_4" },
  { label: "Rudra Kristina 7", value: "rudra_kristina_4" },
  { label: "Rudra Dream City", value: "rudra_dream_city" },
];

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
  { label: "Thousands", value: 1000 },
  { label: "Lacs", value: 100000 },
  { label: "Crores", value: 10000000 },
];

export const refDefaultOptions: ComboboxOption[] = [
  { label: "Not Available", value: "N/A" },
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
