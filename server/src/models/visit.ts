import mongoose, { Schema, Document, Types } from "mongoose";

export interface RemarkType extends Document {
  _id: Types.ObjectId;
  date: Date;
  remark: string;
}

export interface VisitType extends Document {
  _id: Types.ObjectId;
  date: Date;
  reference: string;
  source: string;
  relation: string;
  closing: string;
  status: "lost" | "cold" | "warm" | "hot" | "booked";
  remarks: RemarkType[];
  client: Types.ObjectId | string;
}

export interface PopulatedVisit extends Omit<VisitType, "client"> {
  client: Types.ObjectId;
}

const RemarkSchema = new Schema({
  date: { type: Date, default: Date.now },
  remark: { type: String, required: true },
});

const VisitSchema = new Schema({
  date: { type: Date, required: true },
  reference: { type: String, required: true },
  source: { type: String, required: true },
  relation: { type: String, required: true },
  closing: { type: String, required: true },
  status: {
    type: String,
    enum: ["lost", "cold", "warm", "hot", "booked"],
    required: true,
  },
  remarks: [RemarkSchema],
  client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
});

export const Visit = mongoose.model<VisitType>("Visit", VisitSchema);
