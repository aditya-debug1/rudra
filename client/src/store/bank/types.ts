export enum BankAccountType {
  SAVINGS = "savings",
  CURRENT = "current",
}

export interface BankDetailsType {
  _id: string;
  holderName: string;
  accountNumber: string;
  name: string;
  branch: string;
  ifscCode: string;
  accountType: BankAccountType;
  createdAt: string;
  updatedAt: string;
}

export interface BankDetailsResponse {
  success: boolean;
  data: BankDetailsType;
}

export interface BankDetailsListResponse {
  success: boolean;
  data: BankDetailsType[];
}
