import mongoose, { Document } from "mongoose";

// Interface for the AuthLog document
export interface AuthLog extends Document {
  action: "login" | "logout" | "register" | "password-change";
  userID: string;
  username: string;
  sessionID: string;
  invalidated: boolean;
  timestamp: Date;
}

// Create the schema
const AuthLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["login", "logout", "register", "password-change"],
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    sessionID: {
      type: String,
      required: true,
    },
    invalidated: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Add indexes
// Compound index for userID and timestamp for efficient user history queries
AuthLogSchema.index({ userID: 1, timestamp: -1 });

// Index on timestamp for date-range queries
AuthLogSchema.index({ timestamp: -1 });

// Compound index for action and timestamp for filtering by action type within a time range
AuthLogSchema.index({ action: 1, timestamp: -1 });

// Create and export the model
export const AuthLogModel = mongoose.model<AuthLog>("AuthLog", AuthLogSchema);
