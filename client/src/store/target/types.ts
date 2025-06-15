// types.ts
export interface ProjectStats {
  projectName: string;
  bookings: number;
}

export interface SalesManagerStats {
  salesManager: string;
  totalBookings: number;
  totalRegisterations: number;
  canceledBookings: number;
  totalVisits: number;
  projects: ProjectStats[];
}

export interface SalesManagerStatsResponse {
  success: boolean;
  data: SalesManagerStats[];
  message: string;
}

export interface SalesManagerStatsParams {
  startDate: string;
  endDate: string;
}
