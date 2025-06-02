import { GetBookingLedgerByClientResponse } from "@/store/booking-ledger";

interface BookingFooterProps {
  data: GetBookingLedgerByClientResponse | undefined;
}

export const BookingLedgerFooter = ({ data }: BookingFooterProps) => {
  return (
    <div className="mt-4 flex justify-around items-center gap-3 flex-wrap-reverse md:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {data?.data.length || 0} of {data?.total || 0} payments
      </div>
    </div>
  );
};
