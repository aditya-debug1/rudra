import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientType, VisitType } from "@/store/client";
import { Ellipsis } from "lucide-react";

interface ClientData extends Omit<ClientType, "_id" | "visits"> {
  visitData: Omit<VisitType, "client" | "_id">;
}

interface VisitInfoProps {
  client: ClientData;
}

export const VisitInfo = ({ client }: VisitInfoProps) => {
  return (
    <div className="space-y-6 pt-6 border-t">
      <h3 className="text-lg font-medium">Visit Information</h3>

      <div className="rounded-md border w-full mx-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-card">
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead>Closing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                {client.visitData.date.toLocaleDateString()}
              </TableCell>
              <TableCell>
                {client.visitData.reference
                  ? client.visitData.reference
                  : "N/A"}
              </TableCell>
              <TableCell>
                {client.visitData.source ? client.visitData.source : "N/A"}
              </TableCell>
              <TableCell>
                {client.visitData.relation ? client.visitData.relation : "N/A"}
              </TableCell>
              <TableCell>
                {client.visitData.closing ? client.visitData.closing : "N/A"}
              </TableCell>
              <TableCell>
                {client.visitData.status ? client.visitData.status : "N/A"}
              </TableCell>
              <TableCell>
                <Button variant="secondary" size="miniIcon">
                  <Ellipsis />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
