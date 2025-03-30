import mongoose, { Schema, Document, Types } from "mongoose";
import { PopulatedVisit, VisitType } from "./visit";

export interface ClientType extends Document {
  firstName: string;
  lastName: string;
  occupation?: string;
  email?: string;
  phoneNo: string;
  altNo?: string;
  address?: string;
  note?: string;
  project: string;
  requirement: string;
  budget: number;
  visits: Types.ObjectId[];
}

export interface PopulatedClients extends Omit<ClientType, "visits"> {
  visits: PopulatedVisit[];
}

const ClientSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  occupation: String,
  email: String,
  phoneNo: { type: String, required: true },
  altNo: String,
  address: String,
  note: String,
  project: { type: String, required: true },
  requirement: { type: String, required: true },
  budget: { type: Number, required: true },
  visits: [{ type: Schema.Types.ObjectId, ref: "Visit" }],
});

export const Client = mongoose.model<ClientType>("Client", ClientSchema);
