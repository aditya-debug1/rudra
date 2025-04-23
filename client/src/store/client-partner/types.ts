import { PopulatedVisit } from "../client/types";

export interface RefernceListType {
  _id: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface EmployeeType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  altNo?: string;
  position: string;
  commissionPercentage: number;
  referredClients?: PopulatedVisit[];
}

export interface ClientPartnerType {
  _id?: string;
  cpId?: string;
  name: string;
  ownerName: string;
  email: string;
  phoneNo?: string;
  address?: string;
  notes?: string;
  companyWebsite?: string;
  employees: EmployeeType[];
}
