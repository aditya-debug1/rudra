import mongoose, { Document, Schema } from "mongoose";

export interface Category extends Document {
  displayName: string;
  name: string;
  colorHex: string;
  precedence: number;
  type: "mutable" | "immutable";
}

const CategorySchema: Schema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    colorHex: {
      type: String,
      required: true,
      match: /^#([0-9A-F]{3}){1,2}$/i, // validates hex color format
    },
    precedence: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["mutable", "immutable"],
      required: true,
      default: "mutable",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

export default mongoose.model<Category>("Category", CategorySchema);
