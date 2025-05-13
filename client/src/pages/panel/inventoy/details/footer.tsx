import { Button } from "@/components/ui/button";
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
  return (
    <>
      <Button
        size="icon"
        className={`${!isEditable ? "bg-blue-700 hover:bg-blue-800" : "bg-green-700 hover:bg-green-800"} text-white`}
        onClick={handleEditToggle}
      >
        {!isEditable ? <Edit /> : <Save />}
      </Button>
      <Button onClick={handleDeleteProject} variant="destructive" size="icon">
        <Trash2 />
      </Button>
    </>
  );
};

export default ProjectDetailsFooter;
