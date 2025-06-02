// types.ts
export enum PaymentMethod {
  CHEQUE = "cheque",
  BANK_TRANSFER = "bank-transfer",
  ONLINE_PAYMENT = "online-payment",
  UPI = "upi",
  DEMAND_DRAFT = "demand-draft",
  NEFT = "neft",
  RTGS = "rtgs",
  IMPS = "imps",
}

export enum PaymentType {
  SCHEDULE_PAYMENT = "schedule-payment",
  ADVANCE = "advance",
  PENALTY = "penalty",
  ADJUSTMENT = "adjustment",
  REFUND = "refund",
}

export enum AccountType {
  SAVINGS = "savings",
  CURRENT = "current",
  LOAN = "loan",
}

export interface IPaymentDetails {
  // Common fields for all payment methods
  referenceNumber?: string;
  transactionDate?: Date | string;
  bankName?: string;

  // Cheque specific
  chequeNumber?: string;
  chequeDate?: Date | string;
  dueDate?: Date | string;
  chequeStatus?: "issued" | "cleared" | "bounced" | "cancelled";

  // UPI/Online specific
  transactionId?: string;

  // Additional
  notes?: string;
}

export interface IBookingLedger {
  _id?: string;

  // Reference Information
  clientId: string;

  // Transaction Details
  transactionId: string;
  date: Date | string;
  amount: number;
  demand: number;
  description: string;
  type: PaymentType;
  method: PaymentMethod;
  paymentDetails: IPaymentDetails;

  // Project Stage Information
  stagePercentage?: number;

  // Account Information (Source and Destination)
  fromAccount?: string;
  toAccount: string;

  // Metadata
  createdBy: string;
  createdAt: Date | string;

  // Additional fields for audit trail
  isDeleted: boolean;
  deletedBy?: string;
  deletedDate?: Date | string;
  deletionReason?: string;
}

export interface ClientBookingReference {
  _id: string;
  applicant: string;
  project: string;
  unit: string;
  phoneNo: string;
  email: string;
}

export interface BankReference {
  _id: string;
  holderName: string;
  name: string;
  branch: string;
  accountNumber: string;
}

export interface IBookingLedgerPopulated
  extends Omit<IBookingLedger, "clientId" | "toAccount"> {
  clientId: ClientBookingReference;
  toAccount: BankReference;
}

export interface BookingLedgerSummary {
  totalAmount: number;
  totalPayments: number;
  totalRefunds: number;
  totalPenalties: number;
}

export interface BookingLedgerFilters {
  page: number;
  limit: number;
  fromDate?: string;
  toDate?: string;
  type?: PaymentType;
  method?: PaymentMethod;
  includeDeleted: boolean;
}

export interface CreateBookingLedgerPayload {
  clientId: string;
  amount: number;
  demand: number;
  description: string;
  type: PaymentType;
  method: PaymentMethod;
  paymentDetails: IPaymentDetails;
  stagePercentage?: number;
  fromAccount?: string;
  toAccount: string;
  date?: Date | string;
  createdBy?: string;
}

export interface SoftDeletePayload {
  reason?: string;
  deletedBy?: string;
}
