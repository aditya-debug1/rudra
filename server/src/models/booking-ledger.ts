import { Document, model, Model, Schema, Types } from "mongoose";

// Enums for better type safety and autocompletion
export enum PaymentMethod {
  CASH = "cash",
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

// Payment Details Schema for method-specific information
export interface IPaymentDetails {
  // Common fields for all payment methods
  referenceNumber?: string;
  transactionDate?: Date;
  bankName?: string;

  // Cheque specific
  chequeNumber?: string;
  chequeDate?: Date;
  dueDate?: Date;
  chequeStatus?: "issued" | "cleared" | "bounced" | "cancelled";

  // UPI/Online specific
  transactionId?: string;

  // Additional
  notes?: string;
}

// Define instance methods interface
export interface IBookingLedgerMethods {
  softDelete(deletedBy: string, reason?: string): Promise<this>;
  restore(): Promise<this>;
}

// Define static methods interface
export interface IBookingLedgerStatics {
  findActive(): any;
  findByClient(clientId: Types.ObjectId): any;
}

// Main interface extending Document with custom methods
export interface IBookingLedger extends Document, IBookingLedgerMethods {
  // Reference Information
  clientId: Types.ObjectId;

  // Transaction Details
  transactionId: string; // Unique transaction identifier
  date: Date;
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
  toAccount: Types.ObjectId;

  // Metadata
  createdBy: string; //for username
  createdAt: Date;

  // Additional fields for audit trail
  isDeleted: boolean;
  deletedBy?: string; //for username
  deletedDate?: Date;
  deletionReason?: string;
}

// Define the model type
export interface IBookingLedgerModel
  extends Model<IBookingLedger>,
    IBookingLedgerStatics {}

// Payment Details Schema
const PaymentDetailsSchema = new Schema<IPaymentDetails>(
  {
    // Common fields for all payment methods
    referenceNumber: {
      type: String,
      trim: true,
    },
    transactionDate: {
      type: Date,
    },
    bankName: {
      type: String,
      trim: true,
    },
    // Cheque specific
    chequeNumber: {
      type: String,
      trim: true,
    },
    chequeDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    chequeStatus: {
      type: String,
      enum: ["issued", "cleared", "bounced", "cancelled"],
    },
    // UPI/Online specific
    transactionId: {
      type: String,
      trim: true,
    },
    // Additional
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
); // Disable _id for subdocument

// Main Booking Ledger Schema
const BookingLedgerSchema = new Schema<IBookingLedger, IBookingLedgerModel>(
  {
    // Reference Information
    clientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ClientBooking",
      index: true,
    },

    // Transaction Details
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    demand: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(PaymentType),
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: Object.values(PaymentMethod),
      index: true,
    },
    paymentDetails: {
      type: PaymentDetailsSchema,
      required: true,
    },

    // Project Stage Information
    stagePercentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    // Account Information (Source and Destination)
    fromAccount: {
      type: String,
    },
    toAccount: {
      type: Schema.Types.ObjectId,
      ref: "Bank",
      required: true,
    },

    // Metadata
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // Additional fields for audit trail
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedBy: {
      type: String,
      trim: true,
    },
    deletedDate: {
      type: Date,
    },
    deletionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "bookingledgers", // Explicit collection name
  },
);

// Indexes for better query performance
BookingLedgerSchema.index({ clientId: 1, date: -1 });
BookingLedgerSchema.index({ transactionId: 1 }, { unique: true });
BookingLedgerSchema.index({ type: 1, method: 1 });
BookingLedgerSchema.index({ isDeleted: 1, date: -1 });
BookingLedgerSchema.index({ createdBy: 1, date: -1 });

// Pre-save middleware for validation and business logic
BookingLedgerSchema.pre("save", function (next) {
  // Validate cheque-specific fields
  if (this.method === PaymentMethod.CHEQUE) {
    if (!this.paymentDetails.chequeNumber) {
      return next(new Error("Cheque number is required for cheque payments"));
    }
    if (!this.paymentDetails.chequeDate) {
      return next(new Error("Cheque date is required for cheque payments"));
    }
    if (!this.paymentDetails.dueDate) {
      return next(new Error("Cheque due date is required for cheque payments"));
    }
  }

  // Validate UPI/Online payment fields
  if (
    this.method === PaymentMethod.UPI ||
    this.method === PaymentMethod.ONLINE_PAYMENT
  ) {
    if (!this.paymentDetails.transactionId) {
      return next(
        new Error("Transaction ID is required for UPI/Online payments"),
      );
    }
  }

  // Set deletion audit fields
  if (this.isDeleted && !this.deletedDate) {
    this.deletedDate = new Date();
  }

  next();
});

// Instance methods
BookingLedgerSchema.methods.softDelete = function (
  deletedBy: string,
  reason?: string,
) {
  this.isDeleted = true;
  this.deletedBy = deletedBy;
  this.deletedDate = new Date();
  this.deletionReason = reason;
  return this.save();
};

BookingLedgerSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedBy = undefined;
  this.deletedDate = undefined;
  this.deletionReason = undefined;
  return this.save();
};

// Static methods
BookingLedgerSchema.statics.findActive = function () {
  return this.find({ isDeleted: false });
};

BookingLedgerSchema.statics.findByClient = function (clientId: Types.ObjectId) {
  return this.find({ clientId, isDeleted: false }).sort({ date: -1 });
};

// Create and export the model
const BookingLedger = model<IBookingLedger, IBookingLedgerModel>(
  "BookingLedger",
  BookingLedgerSchema,
);

export default BookingLedger;
