import { GetClientPartnersResponse } from "@/store/client-partner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";

interface ClientPartnerTableProps {
  data?: GetClientPartnersResponse;
  handleOpenDetails: (id: string) => void;
}

export const ClientPartnerTable = ({
  data,
  handleOpenDetails,
}: ClientPartnerTableProps) => {
  const { combinedRole } = useAuth(true);
  const showDetails = hasPermission(
    combinedRole,
    "ClientPartner",
    "view-cp-details",
  );
  const firstIndex = data
    ? data.currentPage * data.limitNumber - data.limitNumber
    : 0;

  return (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-card">
            <TableHead className="text-center">#</TableHead>
            <TableHead className="text-center">Company</TableHead>
            <TableHead className="text-center">Owner</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">Phone No</TableHead>
            <TableHead className="text-center whitespace-nowrap">
              Total Employee
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              Total Clients
            </TableHead>
            {showDetails && (
              <TableHead className="text-center">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data || !data.clientPartners.length ? (
            <TableRow className="hover:bg-card">
              <TableCell colSpan={showDetails ? 7 : 6} className="text-center">
                No Client Partners Data
              </TableCell>
            </TableRow>
          ) : (
            data.clientPartners.map((cp, index) => (
              <TableRow className="hover:bg-card" key={cp._id}>
                <TableCell className="text-center">
                  {firstIndex + index + 1}
                </TableCell>
                <TableCell className="text-center">{cp.name}</TableCell>
                <TableCell className="text-center">{cp.ownerName}</TableCell>
                <TableCell className="text-center">
                  {cp.email || "N/A"}
                </TableCell>
                <TableCell className="text-center">{cp.phoneNo}</TableCell>
                <TableCell className="text-center">
                  {cp.employees.length}
                </TableCell>
                <TableCell className="text-center">
                  {cp.employees.reduce(
                    (total, emp) => total + (emp.referredClients?.length || 0),
                    0,
                  )}
                </TableCell>
                {showDetails && (
                  <TableCell className="text-center">
                    <Button
                      size="miniIcon"
                      variant="secondary"
                      onClick={() => handleOpenDetails(cp._id!)}
                    >
                      <ChevronRight />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
