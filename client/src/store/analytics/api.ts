import newRequest from "@/utils/func/request";

// Response types
type StatusCounts = {
  hot: number;
  warm: number;
  cold: number;
  lost: number;
  booked: number;
};

type MonthlyStats = {
  month: string;
  client: number;
  booking: number;
};

type YearlyBookingStats = {
  year: number;
  monthlyStats: MonthlyStats[];
  summary: {
    totalClientsForYear: number;
    totalBookingsForYear: number;
    averageBookingRate: number;
  };
};

type RegistrationMonthlyStats = {
  month: string;
  booking: number;
  registration: number;
  canceled: number;
};

type YearlyRegistrationStats = {
  year: number;
  monthlyStats: RegistrationMonthlyStats[];
  summary: {
    totalBookingsForYear: number;
    totalRegistrationsForYear: number;
    totalCanceledForYear: number;
    registrationRate: number;
  };
};

export const analyticsApi = {
  getClientStatusCounts: async (params?: {
    startDate?: string;
    endDate?: string;
    manager?: string;
  }) => {
    const { data } = await newRequest.get<StatusCounts>(
      "/analytics/client-status",
      {
        params,
      },
    );
    return data;
  },

  getYearlyBookingStats: async (params?: {
    year?: number;
    manager?: string;
  }) => {
    const { data } = await newRequest.get<YearlyBookingStats>(
      "/analytics/booking-status",
      {
        params,
      },
    );
    return data;
  },

  getYearlyRegistrationStats: async (params?: {
    year?: number;
    manager?: string;
  }) => {
    const { data } = await newRequest.get<YearlyRegistrationStats>(
      "/analytics/registration-status",
      {
        params,
      },
    );
    return data;
  },
};
