import { useAlertDialog } from "@/components/custom ui/alertDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { hasPermission } from "@/hooks/use-role";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import {
  GetBookingLedgerByClientResponse,
  IBookingLedgerPopulated,
  PaymentMethod,
  PaymentType,
} from "@/store/booking-ledger";
import { useBookingLedger } from "@/store/booking-ledger/query";
import withStopPropagation from "@/utils/events/withStopPropagation";
import { capitalizeWords } from "@/utils/func/strUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { MoreHorizontal, Trash2, Undo2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface BookingLedgerTableProps {
  data: GetBookingLedgerByClientResponse | undefined;
}

// Helper functions
const getPaymentTypeVariant = (type: PaymentType) => {
  switch (type) {
    case PaymentType.SCHEDULE_PAYMENT:
      return "default";
    case PaymentType.ADVANCE:
      return "info";
    case PaymentType.PENALTY:
      return "urgent";
    case PaymentType.ADJUSTMENT:
      return "warning";
    case PaymentType.REFUND:
      return "destructive";
    default:
      return "secondary";
  }
};

const getPaymentMethodBadge = (method: PaymentMethod) => {
  const methodLabels = {
    [PaymentMethod.CHEQUE]: "Cheque",
    [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
    [PaymentMethod.ONLINE_PAYMENT]: "Online",
    [PaymentMethod.UPI]: "UPI",
    [PaymentMethod.DEMAND_DRAFT]: "DD",
    [PaymentMethod.NEFT]: "NEFT",
    [PaymentMethod.RTGS]: "RTGS",
    [PaymentMethod.IMPS]: "IMPS",
  };
  return methodLabels[method] || method;
};

const formatPaymentType = (type: PaymentType) => {
  return type.replace(/-/g, " ").toUpperCase();
};

const formatCurrency = (amount: number) => {
  return `₹${Math.abs(amount).toLocaleString("en-IN")}`;
};

const getAmountColor = (type: PaymentType, amount: number) => {
  if (type === PaymentType.REFUND || amount < 0) {
    return "text-red-600";
  }
  if (type === PaymentType.PENALTY) {
    return "text-orange-600";
  }
  return "text-green-600";
};

export const BookingLedgerTable = ({ data }: BookingLedgerTableProps) => {
  const { combinedRole, user } = useAuth(true);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [paymentToDelete, setPaymentToDelete] =
    useState<IBookingLedgerPopulated | null>(null);
  const { softDeletePaymentMutation, restorePaymentMutation } =
    useBookingLedger();

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Permission checks
  const canDeletePayments = hasPermission(
    combinedRole,
    "BookingLedger",
    "delete-booking-payment",
  );
  const canRestorePayments = hasPermission(
    combinedRole,
    "BookingLedger",
    "restore-booking-payment",
  );
  const hasPerms = canDeletePayments || canRestorePayments;

  // Alert dialogs
  const deleteDialog = useAlertDialog({
    iconName: "Trash2",
    title: "Delete Payment",
    description: "Are you sure you want to delete this payment entry?",
    cancelLabel: "Cancel",
    actionLabel: "Delete Payment",
  });

  const restoreDialog = useAlertDialog({
    iconName: "RefreshCw",
    title: "Restore Payment",
    description: "Are you sure you want to restore this payment entry?",
    cancelLabel: "Cancel",
    actionLabel: "Restore Payment",
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      [id]: !prev[id],
    }));
  };

  const [heights, setHeights] = useState<Record<string, number>>({});

  // Improved height calculation with ResizeObserver and animation support
  useEffect(() => {
    const observers = new Map<string, ResizeObserver>();
    const newHeights: Record<string, number> = {};

    Object.keys(contentRefs.current).forEach((id) => {
      const element = contentRefs.current[id];
      if (element) {
        const updateHeight = () => {
          requestAnimationFrame(() => {
            const height = element.scrollHeight;
            newHeights[id] = height;
            setHeights((prev) => ({ ...prev, [id]: height }));
          });
        };

        const observer = new ResizeObserver(updateHeight);
        observer.observe(element);
        observers.set(id, observer);

        // Initial height calculation
        updateHeight();
      }
    });

    // Cleanup observers
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [data?.data]);

  const handleDelete = (payment: IBookingLedgerPopulated) => {
    setPaymentToDelete(payment);
    setDeleteReason("");
    setReasonDialogOpen(true);
  };

  const handleReasonSubmit = () => {
    if (!deleteReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for deletion.",
        variant: "destructive",
      });
      return;
    }

    setReasonDialogOpen(false);

    // Now show the alert dialog
    if (paymentToDelete) {
      deleteDialog.show({
        config: {
          alertType: "Danger",
          description: `Are you sure you want to delete this ${formatPaymentType(paymentToDelete.type).toLowerCase()} of ${formatCurrency(paymentToDelete.amount)}?`,
        },
        onAction: async () => {
          try {
            await softDeletePaymentMutation.mutateAsync({
              paymentId: paymentToDelete._id!,
              payload: {
                reason: deleteReason.trim(),
                deletedBy: user.username,
              },
            });
            toast({
              title: "Payment Deleted",
              description: "The payment entry was deleted successfully.",
            });
            // Reset state
            setPaymentToDelete(null);
            setDeleteReason("");
          } catch (error) {
            const err = error as CustomAxiosError;
            toast({
              title: "Error Occurred",
              description:
                err.response?.data.error || "An unknown error occurred.",
              variant: "destructive",
            });
          }
        },
      });
    }
  };

  const handleRestore = async (payment: IBookingLedgerPopulated) => {
    restoreDialog.show({
      config: {
        alertType: "Info",
        description: `Are you sure you want to restore this ${formatPaymentType(payment.type).toLowerCase()} of ${formatCurrency(payment.amount)}?`,
      },
      onAction: async () => {
        try {
          await restorePaymentMutation.mutateAsync(payment._id!);
          toast({
            title: "Payment Restored",
            description: "The payment entry was restored successfully.",
          });
        } catch (error) {
          const err = error as CustomAxiosError;
          toast({
            title: "Error Occurred",
            description:
              err.response?.data.error || "An unknown error occurred.",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-card">
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Method</TableHead>
            <TableHead className="text-center">Demand</TableHead>
            <TableHead className="text-center">Amount</TableHead>
            <TableHead className="text-center">Description</TableHead>
            <TableHead className="text-center whitespace-nowrap">
              Bank Account
            </TableHead>
            <TableHead className="text-center">Status</TableHead>
            {hasPerms && <TableHead className="text-center">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data?.data?.length ? (
            <TableRow>
              <TableCell colSpan={hasPerms ? 9 : 8} className="text-center">
                No Payment Data
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((payment) => {
              const paymentId = payment._id!.toString();
              const isOpen = openItems[paymentId] || false;
              const isDeleted = payment.isDeleted;

              return (
                <React.Fragment key={paymentId}>
                  <TableRow
                    className={`transition-colors duration-200 cursor-pointer ${
                      isOpen ? "bg-muted/30" : ""
                    }`}
                    onClick={() => toggleItem(paymentId)}
                  >
                    <TableCell className="text-center">
                      {new Date(payment.date)
                        .toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                        .replace(",", "")}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge variant={getPaymentTypeVariant(payment.type)}>
                        {formatPaymentType(payment.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge variant="outline">
                        {getPaymentMethodBadge(payment.method)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(payment.demand)}
                    </TableCell>
                    <TableCell
                      className={`text-center whitespace-nowrap font-semibold ${getAmountColor(payment.type, payment.amount)}`}
                    >
                      {payment.type === PaymentType.REFUND || payment.amount < 0
                        ? "-"
                        : "+"}
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-center max-w-[200px] truncate">
                      {payment.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs">
                        <div className="font-semibold">
                          {`${payment.toAccount.name}-${payment.toAccount.accountNumber.slice(-4)}`}
                        </div>
                        <div className="text-muted-foreground">
                          {payment.toAccount.branch}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isDeleted ? (
                        <Badge variant="destructive">Deleted</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </TableCell>
                    {hasPerms && (
                      <TableCell className="text-center">
                        <MoreAction
                          payment={payment}
                          handleDelete={handleDelete}
                          handleRestore={handleRestore}
                          canDelete={canDeletePayments && !isDeleted}
                          canRestore={canRestorePayments && isDeleted}
                        />
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Improved expandable details row */}
                  <TableRow className="expandable-row">
                    <TableCell
                      colSpan={hasPerms ? 9 : 8}
                      className="p-0 border-b border-t-0"
                    >
                      <div
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                          height: isOpen
                            ? `${heights[paymentId] || 0}px`
                            : "0px",
                          opacity: isOpen ? 1 : 0,
                        }}
                      >
                        <div
                          ref={(e) => (contentRefs.current[paymentId] = e)}
                          className="p-4 bg-muted/50"
                        >
                          <DetailsRow payment={payment} />
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

      <deleteDialog.AlertDialog />
      <restoreDialog.AlertDialog />
      <Dialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center sm:justify-start">
              <Trash2 className="w-5 h-5 text-destructive hidden sm:block" />
              Delete Payment - Provide Reason
            </DialogTitle>
            <DialogDescription>
              {paymentToDelete && (
                <>
                  You are about to delete this{" "}
                  {formatPaymentType(paymentToDelete.type).toLowerCase()} of{" "}
                  {formatCurrency(paymentToDelete.amount)}. Please provide a
                  reason.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deleteReason">
                Reason for deletion <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="deleteReason"
                placeholder="Please provide a reason for deleting this payment..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReasonDialogOpen(false);
                setPaymentToDelete(null);
                setDeleteReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReasonSubmit}
              disabled={!deleteReason.trim()}
            >
              Continue to Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DetailsRow = ({ payment }: { payment: IBookingLedgerPopulated }) => {
  const { paymentDetails } = payment;
  return (
    <div className="rounded-lg bg-card p-6 shadow-sm border">
      {/* Header with Transaction ID and Creation Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b">
        <div>
          <h3 className="text-lg font-semibold mb-1">Transaction Details</h3>
          <p className="text-sm text-muted-foreground">
            ID:{" "}
            <span className="font-mono font-medium">
              {payment.transactionId}
            </span>
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground mt-2 sm:mt-0">
          <p>
            Created by: <span className="font-medium">{payment.createdBy}</span>
          </p>
          <p>{new Date(payment.createdAt).toLocaleString("en-GB")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2  xl:grid-cols-3 gap-6">
        {/* Bank Account Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Bank Account
            </h4>
          </div>
          <div className="bg-muted/50 rounded-md p-4 space-y-2 border">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holder:</span>
                <span className="font-medium">
                  {payment.toAccount.holderName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium">{payment.toAccount.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{payment.toAccount.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">A/c No:</span>
                <span className="font-mono">
                  {payment.toAccount.accountNumber}
                </span>
              </div>
              {payment.fromAccount && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">From A/c:</span>
                  <span className="font-mono">{payment.fromAccount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Method Details */}
        <div className="space-y-3 xl:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Payment Details
            </h4>
          </div>
          <div className="bg-muted/50 rounded-md p-4 space-y-2 border">
            <div className="grid grid-cols-1 gap-2 text-sm">
              {/* Transaction Date */}
              {paymentDetails.transactionDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Transaction Date:
                  </span>
                  <span className="font-medium">
                    {new Date(
                      paymentDetails.transactionDate,
                    ).toLocaleDateString("en-GB")}
                  </span>
                </div>
              )}

              {/* Reference Number */}
              {paymentDetails.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ref No:</span>
                  <span className="font-mono">
                    {paymentDetails.referenceNumber}
                  </span>
                </div>
              )}

              {/* Transaction ID */}
              {paymentDetails.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono">
                    {paymentDetails.transactionId}
                  </span>
                </div>
              )}

              {/* Bank Name */}
              {paymentDetails.bankName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-medium">{paymentDetails.bankName}</span>
                </div>
              )}

              {/* Cheque Details */}
              {paymentDetails.chequeNumber && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cheque No:</span>
                    <span className="font-mono">
                      {paymentDetails.chequeNumber}
                    </span>
                  </div>
                  {paymentDetails.chequeDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Cheque Date:
                      </span>
                      <span className="font-medium">
                        {new Date(paymentDetails.chequeDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </span>
                    </div>
                  )}
                  {paymentDetails.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">
                        {new Date(paymentDetails.dueDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </span>
                    </div>
                  )}
                  {paymentDetails.chequeStatus && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Cheque Status:
                      </span>
                      <Badge
                        variant={
                          paymentDetails.chequeStatus === "cleared"
                            ? "success"
                            : paymentDetails.chequeStatus === "bounced"
                              ? "destructive"
                              : paymentDetails.chequeStatus === "cancelled"
                                ? "secondary"
                                : "warning"
                        }
                      >
                        {capitalizeWords(paymentDetails.chequeStatus)}
                      </Badge>
                    </div>
                  )}
                </>
              )}

              {/* Stage Percentage */}
              {payment.stagePercentage && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Stage:</span>
                  <span className="font-medium">
                    {payment.stagePercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section (Full Width) */}
      {paymentDetails.notes && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Notes
            </h4>
          </div>
          <div className="bg-muted/50 rounded-md p-4 border">
            <p className="text-sm leading-relaxed">{paymentDetails.notes}</p>
          </div>
        </div>
      )}

      {/* Deletion Information (if deleted) */}
      {payment.isDeleted && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <h4 className="text-sm font-bold text-destructive uppercase tracking-wide">
              Deletion Information
            </h4>
          </div>
          <div className="bg-destructive/10 rounded-md p-4 border border-destructive/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {payment.deletedBy && (
                <div>
                  <span className="font-medium text-destructive">
                    Deleted By:
                  </span>
                  <p className="text-muted-foreground mt-1">
                    {payment.deletedBy}
                  </p>
                </div>
              )}
              {payment.deletedDate && (
                <div>
                  <span className="font-medium text-destructive">
                    Deleted Date:
                  </span>
                  <p className="text-muted-foreground mt-1">
                    {new Date(payment.deletedDate).toLocaleString("en-GB")}
                  </p>
                </div>
              )}
              {payment.deletionReason && (
                <div className="sm:col-span-2 lg:col-span-1">
                  <span className="font-medium text-destructive">Reason:</span>
                  <p className="text-muted-foreground mt-1">
                    {payment.deletionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MoreAction = ({
  payment,
  handleDelete,
  handleRestore,
  canDelete,
  canRestore,
}: {
  payment: IBookingLedgerPopulated;
  handleDelete: (payment: IBookingLedgerPopulated) => void;
  handleRestore: (payment: IBookingLedgerPopulated) => void;
  canDelete: boolean;
  canRestore: boolean;
}) => {
  const hasAnyPermission = canDelete || canRestore;

  if (!hasAnyPermission) {
    return (
      <Button variant="secondary" size="miniIcon" disabled>
        <MoreHorizontal />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="miniIcon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Payment Actions</DropdownMenuLabel>
        {canDelete && (
          <DropdownMenuItem
            onClick={withStopPropagation(() => handleDelete(payment))}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Payment
          </DropdownMenuItem>
        )}
        {canRestore && (
          <DropdownMenuItem
            onClick={withStopPropagation(() => handleRestore(payment))}
            className="text-green-600 focus:text-green-600"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Restore Payment
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
