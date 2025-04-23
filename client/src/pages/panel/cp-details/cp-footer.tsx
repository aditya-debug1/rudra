import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Save, SquarePen, Trash2, UserPlus2 } from "lucide-react";
import { useState } from "react";
import EmployeeFormDialog from "./employee-form";
import { useAuth } from "@/store/auth";
import { hasPermission } from "@/hooks/use-role";

interface CPFotterProps {
  cpId: string;
  isEditable: boolean;
  handleDelete: () => void;
  handleUpdate: () => void;
}

export const CPFotter = ({
  cpId,
  isEditable,
  handleDelete,
  handleUpdate,
}: CPFotterProps) => {
  const { combinedRole } = useAuth(true);
  const [open, setOpen] = useState(false);

  // Permissions
  const deleteCP = hasPermission(
    combinedRole,
    "ClientPartner",
    "delete-client-partner",
  );
  const updateCP = hasPermission(
    combinedRole,
    "ClientPartner",
    "update-client-partner",
  );
  const addEmployee = hasPermission(
    combinedRole,
    "ClientPartner",
    "create-cp-employee",
  );

  return (
    <div className="flex items-center justify-end gap-2">
      {deleteCP && (
        <Tooltip content="Delete Client Partner">
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 />
          </Button>
        </Tooltip>
      )}

      {updateCP && (
        <Tooltip
          content={isEditable ? "Save Client Partner" : "Edit Client Partner"}
        >
          <Button
            className={`text-white ${
              isEditable
                ? "bg-green-700 hover:bg-green-600"
                : "bg-blue-700 hover:bg-blue-600"
            }`}
            size="icon"
            onClick={handleUpdate}
          >
            {isEditable ? <Save /> : <SquarePen />}
          </Button>
        </Tooltip>
      )}

      {addEmployee && (
        <>
          <Tooltip content="Add Employee">
            <Button
              size="icon"
              className="text-white bg-yellow-600 hover:bg-yellow-500"
              onClick={() => setOpen(true)}
            >
              <UserPlus2 strokeWidth={2} />
            </Button>
          </Tooltip>
          <EmployeeFormDialog
            cpId={cpId}
            isOpen={open}
            onOpenChange={setOpen}
            mode="add"
          />
        </>
      )}
    </div>
  );
};
