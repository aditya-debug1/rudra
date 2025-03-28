import mongoose, { Schema, Document } from "mongoose";

export const generateCustomCPId = (companyName: string): string => {
  const initials = companyName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase(); // Extract initials from company name

  const timestamp = Date.now().toString().slice(-6); // Use last 6 digits of timestamp

  return `CP-${initials}-${timestamp}`; // Example: "CP-XYZ-654321"
};

export interface CPEmployeeType extends Document {
  name: string;
  email?: string;
  phoneNo: string;
  altNo?: string;
  position?: string; // Role in the company (e.g., Sales Manager)
}

export interface ClientPartnerType extends Document {
  cpId: string;
  name: string; // Company name
  employees: CPEmployeeType[]; // List of employees handling clients
  email?: string; // General company email
  phoneNo?: string; // General contact number
  address?: string;
  companyWebsite?: string;
  commissionPercentage?: number; // If they receive a commission for referrals
  referredClients: mongoose.Types.ObjectId[]; // References to Client documents
  createdAt: Date;
  updatedAt: Date;
}
