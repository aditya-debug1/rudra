export interface RemarkType {
  _id?: string;
  date: Date;
  remark: string;
}

export interface VisitType {
  _id?: string;
  date: Date;
  reference: string;
  otherRefs?: string;
  source: string;
  relation: string;
  closing: string;
  status: null | "lost" | "cold" | "warm" | "hot" | "booked";
  remarks?: RemarkType[];
}

export interface PopulatedVisit extends VisitType {
  client: Partial<ClientType>;
}

export interface ClientType {
  _id: string;
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
  visits: VisitType[];
}
