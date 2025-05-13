import { useAlertDialog } from "@/components/custom ui/alertDialog";
import { CenterWrapper } from "@/components/custom ui/center-page";
import ErrorCard from "@/components/custom ui/error-display";
import { Loader } from "@/components/custom ui/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/auth";
import {
  commercialUnitPlacementType,
  projectStatus,
  ProjectType,
  useInventory,
} from "@/store/inventory";
import { CustomAxiosError } from "@/utils/types/axios";
import { isEqual } from "lodash";
import { Box } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectDetailsFooter from "./footer";
import { ProjectInfo } from "./project-info";
import { WingInfo } from "./wing-info";

export default function InventoryDetails() {
  // Hooks
  const { setBreadcrumbs } = useBreadcrumb();
  const { useProjectDetails, updateProjectMutation, deleteProjectMutation } =
    useInventory();
  const { logout: handleLogout } = useAuth(true);
  const { id, pageno } = useParams<{ id: string; pageno: string }>();
  const pageNo = Number(pageno) || 1;
  const navigate = useNavigate();
  const dialog = useAlertDialog({
    iconName: "CircleFadingArrowUp",
    title: "Update Project",
    description: "Are you sure you want to update this project",
    alertType: "Warn",
    actionLabel: "Confirm",
    cancelLabel: "Cancel",
  });
  const { data, isLoading, error } = useProjectDetails(id!);

  // Initialize state with proper default values
  const [isEditable, setIsEditable] = useState(false);
  const [originalProject, setOriginalProject] = useState<
    ProjectType | undefined
  >(undefined);
  const [editableProject, setEditableProject] = useState<
    ProjectType | undefined
  >(undefined);

  function handleProjectChange(
    field: keyof Omit<ProjectType, "_id" | "wings" | "commercialFloors">,
    value: Date | string | projectStatus | commercialUnitPlacementType,
  ) {
    if (!editableProject) return;
    const updatedProject = {
      ...editableProject,
      [field]: value,
    };
    setEditableProject(updatedProject);
  }

  async function handleUpdateProject() {
    if (!isEqual(originalProject, editableProject)) {
      dialog.show({
        config: {
          actionLabel: "Update",
        },
        onAction: () => {
          try {
            if (originalProject?._id) {
              updateProjectMutation.mutateAsync({
                projectId: originalProject?._id,
                ...editableProject,
              });

              toast({
                title: "Updated Project",
                description: "updated project details",
                variant: "success",
              });
            }
          } catch (error) {
            console.log(error);
            const err = error as CustomAxiosError;
            toast({
              title: "Error Occurred",
              description:
                err.response?.data.error ||
                err.message ||
                "unkown error occurred while updating project details",
              variant: "destructive",
            });
          }
        },
        onCancel: () => {
          setEditableProject(originalProject);
          setIsEditable(false);
        },
      });
    }
  }

  async function handleDeleteProject() {
    dialog.show({
      config: {
        iconName: "Trash",
        title: "Delete Project",
        description: `Are you sure you want to delete the project "${originalProject?.name}"?`,
        alertType: "Danger",
        actionLabel: "Delete",
      },
      onAction: async () => {
        try {
          if (originalProject?._id) {
            await deleteProjectMutation.mutateAsync(originalProject?._id);
            navigate("/panel/inventory/1");
            toast({
              title: "Project Deleted",
              description: "The project was successfully deleted.",
            });
          }
        } catch (error) {
          console.log(error);
          const err = error as CustomAxiosError;
          toast({
            title: "Error Occurred",
            description:
              err.response?.data.error ||
              err.message ||
              "unkown error occurred while deleting project",
            variant: "destructive",
          });
        }
      },
    });
  }

  function handleEditToggle() {
    if (isEditable == true) handleUpdateProject();
    setIsEditable(!isEditable);
  }

  // useEffects
  useEffect(() => {
    setBreadcrumbs([
      { label: "Inventory", to: `/panel/inventory/${pageNo}` },
      {
        label: "Details",
      },
    ]);
  }, [setBreadcrumbs, pageNo]);

  useEffect(() => {
    if (data?.data) {
      setEditableProject(data.data);
      setOriginalProject(data.data);
    }
  }, [data?.data]);

  if (!id || error) {
    const { response, message } = (error as CustomAxiosError) || {};
    let errMsg = response?.data?.error ?? message;
    if (errMsg === "Access denied. No token provided") {
      errMsg = "Access denied. No token provided please login again";
    } else if (errMsg === "Network Error") {
      errMsg =
        "Connection issue detected. Please check your internet or try again later.";
    }
    return (
      <CenterWrapper className="px-2 gap-2 text-center">
        <ErrorCard
          title="Error occurred"
          description={errMsg || "An unknown error occurred"}
          btnTitle="Go to Login"
          onAction={handleLogout}
        />
      </CenterWrapper>
    );
  }

  if (isLoading) {
    return (
      <CenterWrapper>
        <Loader />
      </CenterWrapper>
    );
  }

  return (
    <Card className="w-[90svw] lg:w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Box className="h-5 w-5" />
          {originalProject?.name}
        </CardTitle>
        <CardDescription>
          {`Inventory overview for the ${originalProject?.name || "selected"} project`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectInfo
          project={editableProject}
          onProjectChange={handleProjectChange}
          isEditable={isEditable}
        />

        <WingInfo wings={editableProject?.wings || []} />
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <ProjectDetailsFooter
          isEditable={isEditable}
          handleEditToggle={handleEditToggle}
          handleDeleteProject={handleDeleteProject}
        />
      </CardFooter>
      <dialog.AlertDialog />
    </Card>
  );
}
