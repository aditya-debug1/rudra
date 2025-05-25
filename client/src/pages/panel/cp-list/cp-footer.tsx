import { GetClientPartnersResponse } from "@/store/client-partner";

interface ClientFooterProps {
  data?: GetClientPartnersResponse;
}

export const ClientPartnerFooter = ({ data }: ClientFooterProps) => {
  return (
    <div className="mt-4 flex justify-around items-center gap-3 flex-wrap-reverse md:justify-between">
      <div className="text-sm text-muted-foreground">
        {`Showing ${data?.clientPartners.length || 0} of ${data?.totalClientPartners || 0} channel partners`}
      </div>
    </div>
  );
};
