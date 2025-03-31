import { GetClientsResponse } from "@/store/client";

interface ClientFooterProps {
  data: GetClientsResponse;
}

export const ClientFooter = ({ data }: ClientFooterProps) => {
  return (
    <div className="mt-4 flex justify-around items-center gap-3 flex-wrap-reverse md:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {data.clients.length} of {data.totalClients} clients
      </div>
    </div>
  );
};
