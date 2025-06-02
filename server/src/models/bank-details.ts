import mongoose, { Schema } from "mongoose";
import {
  EncryptionUtil,
  isEncrypted,
  transformBankDetailsDocument, // Use the correct function name
} from "../utils/bank-encryption";

export enum BankAccountType {
  SAVINGS = "savings",
  CURRENT = "current",
}

export interface BankDetailsPayload {
  holderName: string;
  accountNumber: string;
  name: string;
  branch: string;
  ifscCode: string;
  accountType: BankAccountType;
}

export interface BankDetailsType {
  projectId: mongoose.Types.ObjectId;
  holderName: string;
  accountNumber: string;
  name: string;
  branch: string;
  ifscCode: string;
  accountType: BankAccountType;
}

const BankDetailsSchema = new Schema<BankDetailsType>({
  projectId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Project",
  },
  holderName: {
    type: String,
    required: true,
    trim: true,
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
  ifscCode: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, "Please provide a valid IFSC code"],
  },
  accountType: {
    type: String,
    enum: Object.values(BankAccountType),
    required: true,
  },
});

// Bank Schema Hooks for encryption
BankDetailsSchema.pre<BankDetailsType>("save", function (next) {
  try {
    // Only encrypt if not already encrypted
    if (!isEncrypted(this.holderName)) {
      this.holderName = EncryptionUtil.encryptString(this.holderName);
    }
    if (!isEncrypted(this.accountNumber)) {
      this.accountNumber = EncryptionUtil.encryptString(this.accountNumber);
    }
    if (!isEncrypted(this.name)) {
      this.name = EncryptionUtil.encryptString(this.name);
    }
    if (!isEncrypted(this.branch)) {
      this.branch = EncryptionUtil.encryptString(this.branch);
    }
    if (!isEncrypted(this.ifscCode)) {
      this.ifscCode = EncryptionUtil.encryptString(this.ifscCode);
    }
  } catch (error) {
    console.error("Bank encryption error:", error);
    return next(new Error("Failed to encrypt bank details"));
  }
  next();
});

// Post hooks for Bank decryption - FIXED: Use correct function name
BankDetailsSchema.post("find", function (docs: BankDetailsType[]) {
  if (docs && Array.isArray(docs)) {
    docs.forEach(transformBankDetailsDocument); // Changed from transformBankDetails
  }
});

BankDetailsSchema.post("findOne", function (doc: BankDetailsType | null) {
  if (doc) {
    transformBankDetailsDocument(doc); // Changed from transformBankDetails
  }
});

BankDetailsSchema.post(
  "findOneAndUpdate",
  function (doc: BankDetailsType | null) {
    if (doc) {
      transformBankDetailsDocument(doc); // Changed from transformBankDetails
    }
  },
);

// Add toJSON transform to ensure decryption when converting to JSON
BankDetailsSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.holderName = EncryptionUtil.decryptString(ret.holderName);
    ret.accountNumber = EncryptionUtil.decryptString(ret.accountNumber);
    ret.name = EncryptionUtil.decryptString(ret.name);
    ret.branch = EncryptionUtil.decryptString(ret.branch);
    ret.ifscCode = EncryptionUtil.decryptString(ret.ifscCode);
    return ret;
  },
});

// Add toObject transform to ensure decryption when converting to object
BankDetailsSchema.set("toObject", {
  transform: function (doc, ret) {
    ret.holderName = EncryptionUtil.decryptString(ret.holderName);
    ret.accountNumber = EncryptionUtil.decryptString(ret.accountNumber);
    ret.name = EncryptionUtil.decryptString(ret.name);
    ret.branch = EncryptionUtil.decryptString(ret.branch);
    ret.ifscCode = EncryptionUtil.decryptString(ret.ifscCode);
    return ret;
  },
});

export const Bank = mongoose.model<BankDetailsType>("Bank", BankDetailsSchema);
