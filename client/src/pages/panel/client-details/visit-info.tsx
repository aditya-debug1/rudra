import { useAlertDialog } from "@/components/custom ui/alertDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hasPermission } from "@/hooks/use-role";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import { ClientType, VisitType } from "@/store/client";
import { RefernceListType, useClientPartners } from "@/store/client-partner";
import { customReferenceOptions } from "@/store/data/options";
import { usersSummaryType, useUsersSummary } from "@/store/users";
import { useVisits } from "@/store/visit";
import withStopPropagation from "@/utils/events/withStopPropagation";
import { toProperCase } from "@/utils/func/strUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { Ellipsis } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { RemarkForm } from "./remark-form";
import { RemarkTable } from "./remark-table";
import { VisitForm } from "./visit-form";

interface VisitInfoProps {
  client: ClientType;
}

function getStatusClr(status: string | null) {
  switch (status) {
    case "lost":
      return "destructive";
    case "cold":
      return "info";
    case "warm":
      return "warning";
    case "hot":
      return "urgent";
    case "booked":
      return "success";
    default:
      return "default";
  }
}

export const VisitInfo = ({ client }: VisitInfoProps) => {
  const { data: managers } = useUsersSummary();
  const { useReferenceWithDelete } = useClientPartners();
  const { data: refData } = useReferenceWithDelete();

  const { deleteVisitMutation } = useVisits();
  const { toast } = useToast();
  const dialog = useAlertDialog({
    alertType: "Danger",
    iconName: "Trash2",
    title: "Delete Visit",
    description: `Are you sure you want to delete this visit?`,
    actionLabel: "Delete Visit",
    cancelLabel: "Cancel",
  });

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [heights, setHeights] = useState<Record<string, number>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      // ...prev, //for multiple row toggle uncomment this line.
      [id]: !prev[id],
    }));
  };

  const handleDelete = (visitId: string) => {
    dialog.show({
      onAction: async () => {
        try {
          await deleteVisitMutation.mutateAsync(visitId);
          toast({
            title: "Success",
            description: "Visit deleted successfully",
          });
        } catch (error) {
          const err = error as CustomAxiosError;
          toast({
            title: "Error",
            description: err.response?.data.error || "Failed to delete visit",
            variant: "destructive",
          });
        }
      },
    });
  };

  const getManagerName = (
    username: string,
    managers: usersSummaryType[] | undefined,
  ) => {
    if (!managers || !username) return username;
    const manager = managers.find((m) => m.username === username);
    return manager ? manager.firstName : username;
  };

  const getRefernceName = (
    ref: string,
    references: RefernceListType[] | undefined,
  ) => {
    if (!references || !ref) return ref;
    const reference = references.find((r) => r._id === ref);
    return reference ? reference.companyName : ref;
  };

  useEffect(() => {
    const newHeights: Record<string, number> = {};
    Object.keys(contentRefs.current).forEach((id) => {
      const element = contentRefs.current[id];
      if (element) {
        newHeights[id] = element.scrollHeight;
      }
    });
    setHeights(newHeights);
  }, [client.visits]);

  return (
    <div className="space-y-6 pt-6 border-t">
      <h3 className="text-lg font-medium">Visit Information</h3>

      <div className="rounded-md border w-full mx-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-card">
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Reference</TableHead>
              <TableHead className="text-center">Source</TableHead>
              <TableHead className="text-center">Relation</TableHead>
              <TableHead className="text-center">Closing</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!client.visits || client.visits.length === 0 ? (
              <TableRow className="hover:bg-card">
                <TableCell colSpan={7} className="text-center">
                  No Visits Available
                </TableCell>
              </TableRow>
            ) : (
              client.visits.map((visit) => {
                const visitId = visit._id?.toString() || "";
                const isOpen = openItems[visitId] || false;

                return (
                  <React.Fragment key={`visit-group-${visitId}`}>
                    <TableRow
                      className={`transition-colors duration-200 cursor-pointer ${isOpen ? "bg-muted/30" : ""}`}
                      onClick={() => toggleItem(visitId)}
                    >
                      <TableCell className="text-center whitespace-nowrap">
                        {visit.date
                          ? new Date(visit.date)
                              .toLocaleString("en-GB", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .replace(",", "")
                              .toUpperCase()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {customReferenceOptions.includes(
                          client.visits[0].reference,
                        )
                          ? client.visits[0].otherRefs
                          : getRefernceName(
                              client.visits[0].reference,
                              refData?.references,
                            ) || "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {getManagerName(visit.source, managers) || "N/A"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {getManagerName(visit.relation, managers) || "N/A"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {getManagerName(visit.closing, managers) || "N/A"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {
                          <Badge variant={getStatusClr(visit.status || "N/A")}>
                            {visit.status ? toProperCase(visit.status) : "N/A"}
                          </Badge>
                        }
                      </TableCell>
                      <TableCell className="text-center">
                        <VisitAction
                          visit={visit}
                          handleDelete={handleDelete}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow className="hover:bg-card expandable-row">
                      <TableCell
                        colSpan={7}
                        className="p-0 border-b border-t-0"
                      >
                        <div
                          style={{
                            height: isOpen
                              ? `${heights[visitId] || 0}px`
                              : "0px",
                            opacity: isOpen ? 1 : 0,
                            overflow: "hidden",
                            transition: "height 0.3s ease, opacity 0.3s ease",
                          }}
                        >
                          <div ref={(e) => (contentRefs.current[visitId] = e)}>
                            <RemarkTable
                              remarks={visit.remarks}
                              visitId={visit._id!}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>

        <dialog.AlertDialog />
      </div>
    </div>
  );
};

function VisitAction({
  visit,
  handleDelete,
}: {
  visit: VisitType;
  handleDelete: (id: string) => void;
}) {
  const [isVisitOpen, setIsVisitOpen] = useState<boolean>(false);
  const [isRemarkOpen, setIsRemarkOpen] = useState<boolean>(false);
  const { combinedRole } = useAuth(true);

  const Permissions = {
    updateVisit: hasPermission(combinedRole, "Clients", "update-visits"),
    deleteVisit: hasPermission(combinedRole, "Clients", "delete-visits"),
    createRemark: hasPermission(combinedRole, "Clients", "create-remarks"),
  };

  const hasPerms =
    Permissions.updateVisit ||
    Permissions.deleteVisit ||
    Permissions.createRemark;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="miniIcon"
            onClick={withStopPropagation()}
            disabled={!hasPerms}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        {hasPerms && (
          <DropdownMenuContent className="mx-3">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Permissions.updateVisit && (
              <DropdownMenuItem
                onClick={withStopPropagation(() => setIsVisitOpen(true))}
              >
                Update Visit
              </DropdownMenuItem>
            )}

            {Permissions.deleteVisit && (
              <DropdownMenuItem
                onClick={withStopPropagation(() => handleDelete(visit._id!))}
              >
                Delete Visit
              </DropdownMenuItem>
            )}

            {Permissions.createRemark && (
              <DropdownMenuItem
                onClick={withStopPropagation(() => setIsRemarkOpen(true))}
              >
                Add Remark
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      <VisitForm
        isOpen={isVisitOpen}
        onOpenChange={setIsVisitOpen}
        mode="update"
        initialData={visit}
      />
      <RemarkForm
        id={visit._id || ""}
        isOpen={isRemarkOpen}
        onOpenChange={setIsRemarkOpen}
      />
    </>
  );
}
