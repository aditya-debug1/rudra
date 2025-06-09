import { useAlertDialog } from "@/components/custom ui/alertDialog";
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
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import {
  ClientPartnerType,
  EmployeeType,
  useClientPartners,
} from "@/store/client-partner";
import withStopPropagation from "@/utils/events/withStopPropagation";
import { CustomAxiosError } from "@/utils/types/axios";
import { Ellipsis } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { CP_ClientTable } from "./client-table";
import EmployeeFormDialog from "./employee-form"; // Import the form dialog

interface EmployeesInfoProps {
  data?: ClientPartnerType;
  pageCursor: { pageNo: number; _id: string };
}

export const EmployeesInfo = ({ data, pageCursor }: EmployeesInfoProps) => {
  const { combinedRole } = useAuth(true);
  const showContacts = hasPermission(
    combinedRole,
    "ClientPartner",
    "view-cp-contacts",
  );

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [heights, setHeights] = useState<Record<string, number>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { removeEmployeeMutation } = useClientPartners();

  const dialog = useAlertDialog({
    alertType: "Danger",
    iconName: "Trash2",
    title: "Delete Employee",
    description: `Are you sure you want to delete this employee?`,
    actionLabel: "Delete Employee", // Fixed label text
    cancelLabel: "Cancel",
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      // ...prev, //for multiple row toggle uncomment this line.
      [id]: !prev[id],
    }));
  };

  // useEffects
  useEffect(() => {
    const newHeights: Record<string, number> = {};
    Object.keys(contentRefs.current).forEach((id) => {
      const element = contentRefs.current[id];
      if (element) {
        newHeights[id] = element.scrollHeight;
      }
    });
    setHeights(newHeights);
  }, [data?.employees, openItems]); // Add openItems as dependency

  // Event Handler
  const handleDelete = (id: string, employeeId: string, name: string) => {
    dialog.show({
      config: {
        description: `Are you sure you want to delete this employee: ${name}?`,
      },
      onAction: async () => {
        try {
          await removeEmployeeMutation.mutateAsync({ id, employeeId });
          toast({
            title: "Success",
            description: "Employee deleted successfully", // Fixed success message
          });
        } catch (error) {
          const err = error as CustomAxiosError;
          toast({
            title: "Error",
            description:
              err.response?.data.error || "Failed to delete employee", // Fixed error message
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6 pt-6 border-t">
      <h3 className="text-lg font-medium">Employees Information</h3>

      <div className="rounded-md border w-full mx-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-card">
              <TableHead className="text-center italic">#</TableHead>
              <TableHead className="text-center">Name</TableHead>
              {showContacts && (
                <>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center whitespace-nowrap">
                    Phone No
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap">
                    Alt No
                  </TableHead>
                </>
              )}
              <TableHead className="text-center">Position</TableHead>
              <TableHead className="text-center whitespace-nowrap">
                Total Clients
              </TableHead>
              <TableHead className="text-center whitespace-nowrap">
                Commission Percentage
              </TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data?.employees || data.employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6 + (showContacts ? 3 : 0)}
                  className="text-center"
                >
                  No Employees Available
                </TableCell>
              </TableRow>
            ) : (
              data.employees.map((emp, index) => {
                const empId = emp._id?.toString() || "";

                const isOpen = openItems[empId] || false;
                return (
                  <React.Fragment key={`emp-group-${empId}`}>
                    <TableRow
                      className={`transition-colors duration-200 cursor-pointer ${isOpen ? "bg-muted/30" : ""}`}
                      onClick={() => toggleItem(empId)}
                    >
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="text-center">
                        {emp.firstName + " " + emp.lastName}
                      </TableCell>
                      {showContacts && (
                        <>
                          <TableCell className="text-center">
                            {emp.email || "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            {emp.phoneNo}
                          </TableCell>
                          <TableCell className="text-center">
                            {emp.altNo || "N/A"}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-center">
                        {emp.position || "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {emp.referredClients?.length}
                      </TableCell>
                      <TableCell className="text-center">
                        {emp.commissionPercentage || "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        <EmpAction
                          handleDelete={handleDelete}
                          cpId={data._id!}
                          employee={emp}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow className="hover:bg-card expandable-row">
                      <TableCell
                        colSpan={6 + (showContacts ? 3 : 0)}
                        className="p-0 border-b border-t-0"
                      >
                        <div
                          style={{
                            height: isOpen ? `${heights[empId] || 0}px` : "0px",
                            opacity: isOpen ? 1 : 0,
                            overflow: "hidden",
                            transition: "height 0.3s ease, opacity 0.3s ease",
                          }}
                        >
                          <div ref={(e) => (contentRefs.current[empId] = e)}>
                            <CP_ClientTable
                              data={emp.referredClients || []}
                              pageCursor={pageCursor}
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

interface EmpActionProps {
  cpId: string;
  employee: EmployeeType; // Changed from empId to full employee object
  handleDelete: (cpId: string, empId: string, name: string) => void;
}

const EmpAction = ({ handleDelete, cpId, employee }: EmpActionProps) => {
  const { combinedRole } = useAuth(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Permissions
  const deleteEmployee = hasPermission(
    combinedRole,
    "ClientPartner",
    "delete-cp-employee",
  );
  const updateEmployee = hasPermission(
    combinedRole,
    "ClientPartner",
    "update-cp-employee",
  );
  const hasPerms = deleteEmployee || updateEmployee;

  // Transform the employee data to match the form's expected format
  const employeeFormData = {
    id: employee._id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email || "",
    phoneNo: employee.phoneNo || "",
    altNo: employee.altNo || "",
    position: employee.position || "",
    commissionPercentage: employee.commissionPercentage || 0,
    referredClients: employee.referredClients || [],
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={withStopPropagation()}>
          <Button size="miniIcon" variant="secondary" disabled={!hasPerms}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        {hasPerms && (
          <DropdownMenuContent className="mx-3">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {updateEmployee && (
              <DropdownMenuItem
                onClick={withStopPropagation(() => setIsUpdateDialogOpen(true))}
              >
                Update Employee
              </DropdownMenuItem>
            )}

            {deleteEmployee && (
              <DropdownMenuItem
                onClick={withStopPropagation(() =>
                  handleDelete(
                    cpId,
                    employee._id,
                    employee.firstName + " " + employee.lastName,
                  ),
                )}
              >
                Delete Employee
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {/* Employee Form Dialog for updating */}
      <EmployeeFormDialog
        isOpen={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        cpId={cpId}
        initialData={employeeFormData}
        mode="update"
      />
    </>
  );
};
