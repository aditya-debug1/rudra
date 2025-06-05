import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { Edit, ReceiptIndianRupee, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { BankDetailsForm } from "./bank-form";

interface ProjectDetailsFooterProps {
  isEditable: boolean;
  hasBank: boolean;
  projectId?: string;
  handleEditToggle: () => void;
  handleDeleteProject: () => void;
}

const ProjectDetailsFooter = ({
  isEditable,
  projectId,
  hasBank,
  handleDeleteProject,
  handleEditToggle,
}: ProjectDetailsFooterProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { combinedRole } = useAuth(true);
  const deleteInventory = hasPermission(
    combinedRole,
    "Inventory",
    "delete-inventory",
  );
  const updateInventory = hasPermission(
    combinedRole,
    "Inventory",
    "update-inventory",
  );

  return (
    <>
      {!hasBank && (
        <Tooltip content="Add Bank Account">
          <Button
            size="icon"
            className="text-zinc-100 bg-amber-400 hover:bg-amber-500"
            onClick={() => setIsOpen(true)}
          >
            <ReceiptIndianRupee />
          </Button>
        </Tooltip>
      )}

      {updateInventory && (
        <Tooltip content={!isEditable ? "Edit Project" : "Save Project"}>
          <Button
            size="icon"
            className={`${!isEditable ? "bg-blue-700 hover:bg-blue-800" : "bg-green-700 hover:bg-green-800"} text-white`}
            onClick={handleEditToggle}
          >
            {!isEditable ? <Edit /> : <Save />}
          </Button>
        </Tooltip>
      )}
      {deleteInventory && (
        <Tooltip content="Delete Project">
          <Button
            onClick={handleDeleteProject}
            variant="destructive"
            size="icon"
          >
            <Trash2 />
          </Button>
        </Tooltip>
      )}
      {projectId && (
        <BankDetailsForm
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          projectId={projectId}
        />
      )}
    </>
  );
};

export default ProjectDetailsFooter;
