import mongoose, { Document, Schema, Types } from "mongoose";
import {
  EncryptionUtil,
  isEncrypted,
  safeDecryptBankDetails,
  transformBankDetails,
} from "../utils/bank-encryption";

// Types
export enum BankAccountType {
  SAVINGS = "savings",
  CURRENT = "current",
}

export type UnitStatus =
  | "reserved"
  | "available"
  | "booked"
  | "registered"
  | "canceled"
  | "investor"
  | "not-for-sale"
  | "others";

export interface BankDetails {
  holderName: string;
  accountNumber: string;
  name: string;
  branch: string;
  ifscCode: string;
  accountType: BankAccountType;
}

export interface UnitType extends Document {
  _id: Types.ObjectId;
  floorId: Types.ObjectId;
  unitNumber: string;
  area: number;
  configuration: string;
  unitSpan: number;
  status: UnitStatus;
  reservedByOrReason?: string;
  referenceId?: Types.ObjectId;
}

export interface FloorType extends Document {
  _id: Types.ObjectId;
  wingId?: Types.ObjectId;
  projectId: Types.ObjectId;
  type: "residential" | "commercial";
  displayNumber: number;
  showArea: boolean;
  units: Types.ObjectId[];
}

export interface WingType extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  commercialFloors?: Types.ObjectId[];
  floors: Types.ObjectId[];
  unitsPerFloor: number;
  headerFloorIndex: number;
}

export interface ProjectType extends Document {
  _id: Types.ObjectId;
  name: string;
  by: string;
  location: string;
  description?: string;
  startDate: Date;
  completionDate?: Date;
  status: "planning" | "under-construction" | "completed";
  commercialUnitPlacement: "projectLevel" | "wingLevel";
  wings: Types.ObjectId[];
  projectStage: number;
  bank?: BankDetails;
  commercialFloors?: Types.ObjectId[];
}

// Schemas
const UnitSchema = new Schema<UnitType>(
  {
    floorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Floor",
    },
    unitNumber: {
      type: String,
      required: true,
      index: true,
    },
    area: {
      type: Number,
      required: true,
      min: 0,
    },
    configuration: {
      type: String,
      required: true,
    },
    unitSpan: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: [
        "reserved",
        "available",
        "booked",
        "registered",
        "canceled",
        "investor",
        "not-for-sale",
        "others",
      ],
      required: true,
      index: true,
    },
    reservedByOrReason: {
      type: String,
    },
    referenceId: {
      type: String,
    },
  },
  { timestamps: true },
);

const FloorSchema = new Schema<FloorType>(
  {
    wingId: {
      type: Schema.Types.ObjectId,
      ref: "Wing",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    type: {
      type: String,
      enum: ["residential", "commercial"],
      required: true,
    },
    displayNumber: {
      type: Number,
      required: true,
    },
    showArea: {
      type: Boolean,
      default: true,
    },
    units: [
      {
        type: Schema.Types.ObjectId,
        ref: "Unit",
      },
    ],
  },
  { timestamps: true },
);

const WingSchema = new Schema<WingType>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    commercialFloors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Floor",
      },
    ],
    floors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Floor",
      },
    ],
    unitsPerFloor: {
      type: Number,
      required: true,
      min: 0,
    },
    headerFloorIndex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const BankDetailsSchema = new Schema<BankDetails>({
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

const ProjectSchema = new Schema<ProjectType>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    by: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["planning", "under-construction", "completed"],
      required: true,
    },
    commercialUnitPlacement: {
      type: String,
      enum: ["projectLevel", "wingLevel"],
      required: true,
    },
    projectStage: {
      type: Number,
      default: 0,
    },
    wings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Wing",
      },
    ],
    commercialFloors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Floor",
      },
    ],
    bank: {
      type: BankDetailsSchema,
    },
  },
  { timestamps: true },
);

// Pre-save hook for encryption
ProjectSchema.pre<ProjectType>("save", function (next) {
  if (this.isModified("bank") && this.bank) {
    try {
      // Only encrypt if not already encrypted
      const bankDetails = this.bank;
      if (!isEncrypted(bankDetails.holderName)) {
        this.bank = EncryptionUtil.encryptBankDetails(bankDetails);
      }
    } catch (error) {
      console.error("Encryption error:", error);
      return next(new Error("Failed to encrypt bank details"));
    }
  }
  next();
});

// Post hooks for decryption - use transform approach
ProjectSchema.post("find", function (docs: ProjectType[]) {
  if (docs && Array.isArray(docs)) {
    docs.forEach(transformBankDetails);
  }
});

ProjectSchema.post("findOne", function (doc: ProjectType | null) {
  if (doc) {
    transformBankDetails(doc);
  }
});

ProjectSchema.post("findOneAndUpdate", function (doc: ProjectType | null) {
  if (doc) {
    transformBankDetails(doc);
  }
});

// Add toJSON transform to ensure decryption when converting to JSON
ProjectSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.bank) {
      ret.bank = safeDecryptBankDetails(ret.bank);
    }
    return ret;
  },
});

// Add toObject transform to ensure decryption when converting to object
ProjectSchema.set("toObject", {
  transform: function (doc, ret) {
    if (ret.bank) {
      ret.bank = safeDecryptBankDetails(ret.bank);
    }
    return ret;
  },
});

// Create models
export const Unit = mongoose.model<UnitType>("Unit", UnitSchema);
export const Floor = mongoose.model<FloorType>("Floor", FloorSchema);
export const Wing = mongoose.model<WingType>("Wing", WingSchema);
export const Project = mongoose.model<ProjectType>("Project", ProjectSchema);
