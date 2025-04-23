import { useAlertDialog } from "@/components/custom ui/alertDialog";
import { Button } from "@/components/ui/button";
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
import { RemarkType } from "@/store/client";
import { useVisits } from "@/store/visit";
import { CustomAxiosError } from "@/utils/types/axios";
import { Trash2 } from "lucide-react";

interface RemarkTableProps {
  remarks: RemarkType[] | undefined;
  visitId: string;
}

export const RemarkTable = ({ remarks, visitId }: RemarkTableProps) => {
  const { deleteRemarkMutation } = useVisits();
  const { combinedRole } = useAuth(true);
  const showDelete = hasPermission(combinedRole, "Clients", "delete-remarks");
  const { toast } = useToast();
  const dialog = useAlertDialog({
    alertType: "Danger",
    iconName: "Trash2",
    title: "Delete Remark",
    description: `Are you sure you want to delete this remark?`,
    actionLabel: "Delete",
    cancelLabel: "Cancel",
  });

  const handleDelete = (remarkId: string) => {
    dialog.show({
      onAction: async () => {
        try {
          await deleteRemarkMutation.mutateAsync({
            visitId: visitId,
            remarkId: remarkId,
          });
          toast({
            title: "Success",
            description: "Remark deleted successfully",
          });
        } catch (error) {
          const err = error as CustomAxiosError;
          toast({
            title: "Error",
            description: err.response?.data.error || "Failed to delete remark",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="border p-0 overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="hover:bg-card">
            <TableHead className="text-center w-1/6">Date</TableHead>
            <TableHead className="text-center" colSpan={5}>
              Remark
            </TableHead>
            {showDelete && (
              <TableHead className="text-center w-1/12">Action</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!remarks || remarks.length === 0 ? (
            <TableRow className="hover:bg-card">
              <TableCell />
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-4"
              >
                No Remarks Available
              </TableCell>

              <TableCell />
            </TableRow>
          ) : (
            remarks.map((remark, index) => (
              <TableRow key={index} className="hover:bg-card">
                <TableCell className="text-center text-sm">
                  {new Date(remark.date)
                    .toLocaleString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .replace(",", "")
                    .toUpperCase()}
                </TableCell>
                <TableCell className="text-center" colSpan={5}>
                  {remark.remark}
                </TableCell>

                {showDelete && (
                  <TableCell className="text-center">
                    <Button
                      size="miniIcon"
                      variant="destructive"
                      onClick={() => handleDelete(remark._id!)}
                    >
                      <Trash2 size={20} />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <dialog.AlertDialog />
    </div>
  );
};
