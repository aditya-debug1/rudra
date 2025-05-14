import { pdf } from "@react-pdf/renderer";
import { Download, FileBox, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// Components
import { Combobox, ComboboxOption } from "@/components/custom ui/combobox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Hooks and state
import { toast } from "@/hooks/use-toast";
import { ProjectType, useInventory } from "@/store/inventory";

// PDF Component
import { AvailabilityPDF } from "@/pdf-templates/inventory-chart";

export function InventoryReport() {
  // State hooks
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Inventory hooks
  const { useProjectsStructure, useProjectDetails } = useInventory();
  const { data: projectsData, isLoading: isLoadingProjects } =
    useProjectsStructure();
  const { data: projectData, isLoading: isLoadingProjectDetails } =
    useProjectDetails(selectedProject);

  // Memoize projects options to prevent unnecessary re-renders
  const projects: ComboboxOption[] = useMemo(
    () =>
      projectsData?.data?.map((project) => ({
        label: project.name,
        value: project._id!,
      })) || [],
    [projectsData?.data],
  );

  // Handler for project selection
  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProject(projectId);
    setError(null); // Reset any previous errors
  }, []);

  // Generate and show PDF
  const generateAndShowPDF = useCallback(async (project: ProjectType) => {
    if (!project) return;

    setIsGeneratingPDF(true);
    setError(null);

    try {
      // Create a blob from the PDF component
      const blob = await pdf(<AvailabilityPDF project={project} />).toBlob();

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Open PDF in new tab
      const newWindow = window.open(url, "_blank");

      // Check if popup was blocked
      if (!newWindow) {
        throw new Error("Pop-up blocked. Please allow pop-ups for this site.");
      }

      toast({
        title: "PDF Generated Successfully",
        description: "The availability chart PDF has been opened in a new tab.",
        variant: "success",
      });

      // Cleanup the blob URL when window unloads
      newWindow.addEventListener("unload", () => URL.revokeObjectURL(url));
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate PDF",
      );

      toast({
        title: "PDF Generation Error",
        description:
          "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  }, []);

  // Handle download button click
  const handleDownload = useCallback(() => {
    if (projectData?.data) {
      generateAndShowPDF(projectData.data);
    } else {
      setError("No project data available");
      toast({
        title: "Error",
        description: "No project data available. Please try again.",
        variant: "destructive",
      });
    }
  }, [projectData, generateAndShowPDF]);

  // Determine button state
  const isButtonDisabled =
    !selectedProject || isGeneratingPDF || isLoadingProjectDetails;

  return (
    <Card className="w-72 flex flex-col h-full shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <FileBox className="text-gray-500 h-5 w-5" />
          <span className="text-sm text-muted-foreground font-medium">PDF</span>
        </div>
        <CardTitle className="mt-4">Availability Chart</CardTitle>
        <CardDescription>
          Detailed availability chart in PDF format
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        {error && (
          <Alert variant="destructive" className="mb-3 py-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {isLoadingProjects ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects available.
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto flex-col gap-3 pt-2">
        <Combobox
          value={selectedProject}
          options={projects}
          onChange={handleProjectSelect}
          width="w-full"
          placeholder="Select Projects"
          disabled={isLoadingProjects || projects.length === 0}
        />

        <Button
          className="w-full"
          variant="default"
          onClick={handleDownload}
          disabled={isButtonDisabled}
        >
          {isGeneratingPDF || isLoadingProjectDetails ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isGeneratingPDF ? "Generating..." : "Loading..."}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Chart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
