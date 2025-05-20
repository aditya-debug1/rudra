import { CombinedRoleType } from "@/store/role";
import { userType } from "@/store/users";

export interface LoginData {
  loginId: string;
  password: string;
}

export interface AuthStore {
  user: userType | null;
  combinedRole: CombinedRoleType | null;
  setUser: (user: userType | null) => void;
  setCombinedRole: (combinedRole: CombinedRoleType | null) => void;
}

export interface AuthLogType {
  _id: string;
  action: "login" | "logout";
  userID: string;
  username: string;
  timestamp: string;
}

export interface AuthLogsResponse {
  logs: AuthLogType[];
  currentPage: number;
  limitNumber: number;
  totalLogs: number;
  totalPages: number;
}

export interface AuthLogsParams {
  page: number;
  limit: number;
  search: string;
  userId?: string;
  username?: string;
  action?: string;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}
