import { Button } from "@/components/ui/button";
import { hasPermission } from "@/hooks/use-role";
import { useAuth } from "@/store/auth";
import { Edit, Save, Trash2 } from "lucide-react";

interface ProjectDetailsFooterProps {
  isEditable: boolean;
  handleEditToggle: () => void;
  handleDeleteProject: () => void;
}

const ProjectDetailsFooter = ({
  isEditable,
  handleDeleteProject,
  handleEditToggle,
}: ProjectDetailsFooterProps) => {
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
      {updateInventory && (
        <Button
          size="icon"
          className={`${!isEditable ? "bg-blue-700 hover:bg-blue-800" : "bg-green-700 hover:bg-green-800"} text-white`}
          onClick={handleEditToggle}
        >
          {!isEditable ? <Edit /> : <Save />}
        </Button>
      )}
      {deleteInventory && (
        <Button onClick={handleDeleteProject} variant="destructive" size="icon">
          <Trash2 />
        </Button>
      )}
    </>
  );
};

export default ProjectDetailsFooter;
