import mongoose, { Document, Schema, Types } from "mongoose";

// Interface extending Document for TypeScript type safety
export interface ClientBookingType extends Document {
  _id: Types.ObjectId;
  date: Date;
  applicant: string;
  coApplicant?: string;
  status: string;
  project: string;
  wing?: string;
  floor: string;
  unit: Types.ObjectId;
  phoneNo: string;
  altNo?: string;
  email?: string;
  address?: string;
  paymentType: "regular-payment" | "down-payment";
  paymentStatus: string;
  bookingAmt: number;
  dealTerms: string;
  paymentTerms: string;
  salesManager: string;
  clientPartner: Types.ObjectId | string;
}

// Create the schema
const ClientBookingSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    applicant: {
      type: String,
      required: true,
      trim: true,
    },
    coApplicant: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
    },
    wing: {
      type: String,
      trim: true,
    },
    floor: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Unit", // Assuming there's a Unit model
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    altNo: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    paymentType: {
      type: String,
      enum: ["regular-payment", "down-payment"],
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      trim: true,
    },
    bookingAmt: {
      type: Number,
      required: true,
      min: [0, "Booking amount cannot be negative"],
    },
    dealTerms: {
      type: String,
      required: true,
      trim: true,
    },
    paymentTerms: {
      type: String,
      required: true,
      trim: true,
    },
    salesManager: {
      type: String,
      required: true,
      trim: true,
    },
    clientPartner: {
      type: Schema.Types.Mixed, // Use Mixed type to allow both ObjectId and String
      required: true,
      ref: "ClientPartner", // Reference will only be used when it's an ObjectId
      validate: {
        validator: function (v: any) {
          // Valid if it's a string or a valid ObjectId
          return typeof v === "string" || mongoose.Types.ObjectId.isValid(v);
        },
        message: "clientPartner must be either a string or a valid ObjectId",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  },
);

// Create and export the model
export default mongoose.model<ClientBookingType>(
  "ClientBooking",
  ClientBookingSchema,
);
