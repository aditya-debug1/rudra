import { ClientBookingPaginatedResponse } from "@/store/client-booking/types";

interface BookingFooterProps {
  data: ClientBookingPaginatedResponse | undefined;
}

export const BookingFooter = ({ data }: BookingFooterProps) => {
  return (
    <div className="mt-4 flex justify-around items-center gap-3 flex-wrap-reverse md:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {data?.data.length || 0} of {data?.total || 0} clients
      </div>
    </div>
  );
};
