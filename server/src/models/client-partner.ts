import mongoose, { Schema, Document, Types } from "mongoose";

// Types
export interface CPEmployeeType extends Document {
  _id: Types.ObjectId;
  clientPartnerId: Types.ObjectId; // Reference to parent ClientPartner
  firstName: string;
  lastName: string;
  email?: string;
  phoneNo: string;
  altNo?: string;
  position?: string; // Role in the company (e.g., Sales Manager)
  referredClients: Types.ObjectId[]; // References to Client documents
  commissionPercentage?: number; // If they receive a commission for referrals
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientPartnerType extends Document {
  _id: Types.ObjectId;
  cpId: string;
  name: string; // Company name
  employees: Types.ObjectId[]; // List of employee references instead of subdocuments
  email?: string; // General company email
  phoneNo?: string; // General contact number
  address?: string;
  notes?: string;
  companyWebsite?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// CPEmployee Schema (now a top-level schema)
const CPEmployeeSchema: Schema = new Schema(
  {
    clientPartnerId: {
      type: Schema.Types.ObjectId,
      ref: "ClientPartner",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phoneNo: { type: String, required: true },
    altNo: { type: String },
    position: { type: String },
    referredClients: [{ type: Schema.Types.ObjectId, ref: "Visit" }],
    commissionPercentage: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Updated ClientPartner Schema
const ClientPartnerSchema: Schema = new Schema(
  {
    cpId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    employees: [{ type: Schema.Types.ObjectId, ref: "CPEmployee" }], // Now stores references
    email: { type: String },
    phoneNo: { type: String },
    address: { type: String },
    notes: { type: String },
    companyWebsite: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const CPEmployee = mongoose.model<CPEmployeeType>(
  "CPEmployee",
  CPEmployeeSchema,
);

export const ClientPartner = mongoose.model<ClientPartnerType>(
  "ClientPartner",
  ClientPartnerSchema,
);
