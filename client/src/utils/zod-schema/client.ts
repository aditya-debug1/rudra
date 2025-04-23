import { z } from "zod";

const RemarkSchema = z.object({
  date: z.date(),
  remark: z.string().min(1, "Remark is required"),
});

export const VisitSchema = z.object({
  date: z.date(),
  reference: z.string().min(1, "Reference is required"),
  source: z.string().min(1, "Source is required"),
  relation: z.string().min(1, "Relation is required"),
  closing: z.string().min(1, "Closing is required"),
  status: z
    .union([
      z.literal("lost"),
      z.literal("cold"),
      z.literal("warm"),
      z.literal("hot"),
      z.literal("booked"),
    ])
    .nullable(),
  remarks: RemarkSchema.array().optional(),
});

export const ClientSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, {
      message: "Only alphabetic characters are allowed",
    }),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, {
      message: "Only alphabetic characters are allowed",
    }),
  occupation: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  email: z
    .union([z.string().email("Invalid email format"), z.string().length(0)])
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  phoneNo: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }),
  altNo: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || /^\d{10}$/.test(val), {
      message: "Alt Phone number must be 10 digits",
    }),
  address: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  note: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),

  project: z.string().min(1, "Project is required"),
  requirement: z.string().min(1, "Requirement is required"),
  budget: z.number().positive("Budget must be greater than zero"),
  visitData: VisitSchema,
});
