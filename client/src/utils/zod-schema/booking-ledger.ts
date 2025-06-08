import { z } from "zod";

// Enum schemas
export const PaymentMethodSchema = z.enum([
  "cheque",
  "bank-transfer",
  "online-payment",
  "upi",
  "demand-draft",
  "neft",
  "rtgs",
  "imps",
]);

export const PaymentTypeSchema = z.enum([
  "schedule-payment",
  "advance",
  "penalty",
  "adjustment",
  "refund",
]);

// Base schemas for common validations
const MongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
const DateSchema = z.union([z.date(), z.string().datetime()]);
const AmountSchema = z
  .number()
  .positive("Amount must be positive")
  .max(999999999, "Amount too large");
const DemandSchema = z
  .number()
  .min(0, "Demand cannot be negative")
  .max(999999999, "Demand too large");

const PercentageSchema = z
  .number()
  .min(0)
  .max(100, "Percentage must be between 0 and 100");

// Payment Details Schema with conditional validation
export const PaymentDetailsSchema = z
  .object({
    referenceNumber: z
      .string()
      .min(1, "Reference number cannot be empty")
      .max(50, "Reference number too long")
      .optional(),
    bankName: z
      .string()
      .min(2, "Bank name must be at least 2 characters")
      .max(100, "Bank name too long")
      .optional(),
    chequeNumber: z
      .string()
      .min(1, "Cheque number cannot be empty")
      .max(20, "Cheque number too long")
      .optional(),
    chequeDate: DateSchema.optional(),
    dueDate: DateSchema.optional(),
    transactionDate: DateSchema.optional(),
    transactionId: z
      .string()
      .min(1, "Transaction ID cannot be empty")
      .max(100, "Transaction ID too long")
      .optional(),
    notes: z.string().max(500, "Notes too long").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.chequeNumber && (!data.chequeDate || !data.dueDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cheque date and due date is required",
        path: ["chequeDate"],
      });
    }

    if (data.chequeDate && data.dueDate) {
      const chequeDate = new Date(data.chequeDate);
      const dueDate = new Date(data.dueDate);
      if (dueDate < chequeDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Due date cannot be before cheque date",
          path: ["dueDate"],
        });
      }
    }
  });

// Create Payload Schema - Simplified for payment creation
export const CreatePaymentSchema = z
  .object({
    clientId: MongoIdSchema,
    date: DateSchema,
    amount: AmountSchema,
    demand: DemandSchema,
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description too long"),
    type: PaymentTypeSchema,
    method: PaymentMethodSchema,
    paymentDetails: PaymentDetailsSchema,
    stagePercentage: PercentageSchema.optional(),
    fromAccount: z.string().optional(),
    toAccount: z.string().min(1, "To account is required").max(100),
    createdBy: z.string().min(1, "Created by is required").max(100),
  })
  .superRefine((data, ctx) => {
    switch (data.method) {
      case "cheque":
        if (!data.paymentDetails.chequeNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cheque number is required for cheque payments",
            path: ["paymentDetails", "chequeNumber"],
          });
        }
        if (!data.paymentDetails.bankName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Bank name is required for cheque payments",
            path: ["paymentDetails", "bankName"],
          });
        }
        if (!data.paymentDetails.chequeDate || !data.paymentDetails.dueDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cheque date and dueDate is required for cheque payments",
            path: ["paymentDetails", "chequeDate"],
          });
        }
        break;

      case "upi":
      case "online-payment":
        if (!data.paymentDetails.transactionId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Transaction ID is required for UPI/online payments",
            path: ["paymentDetails", "transactionId"],
          });
        }
        if (!data.paymentDetails.transactionDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Transaction date is required for UPI/online payments",
            path: ["paymentDetails", "transactionDate"],
          });
        }
        break;

      case "neft":
      case "rtgs":
      case "imps":
      case "bank-transfer":
        if (!data.paymentDetails.referenceNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Reference number is required for bank transfers",
            path: ["paymentDetails", "referenceNumber"],
          });
        }
        if (!data.paymentDetails.bankName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Bank name is required for bank transfers",
            path: ["paymentDetails", "bankName"],
          });
        }
        if (!data.paymentDetails.transactionDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Transaction date is required for bank transfers",
            path: ["paymentDetails", "transactionDate"],
          });
        }
        break;
    }
  });

// Type exports for TypeScript inference
export type PaymentMethodType = z.infer<typeof PaymentMethodSchema>;
export type PaymentTypeType = z.infer<typeof PaymentTypeSchema>;
export type PaymentDetailsType = z.infer<typeof PaymentDetailsSchema>;
export type CreatePaymentType = z.infer<typeof CreatePaymentSchema>;

// Helper function for validation
export const validatePaymentCreation = (data: unknown) => {
  return CreatePaymentSchema.safeParse(data);
};
