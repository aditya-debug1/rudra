// src/components/inventory/ProjectsTable.tsx
import { CenterWrapper } from "@/components/custom ui/center-page";
import ErrorCard from "@/components/custom ui/error-display";
import { Loader } from "@/components/custom ui/loader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/store/auth";
import { ProjectSummaryType, useInventory } from "@/store/inventory";
import { useInventoryStore } from "@/store/inventory/store";
import { toProperCase } from "@/utils/func/strUtils";
import { CustomAxiosError } from "@/utils/types/axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // For React Router
import { ProjectHeader } from "./project-header";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "planning":
      return "bg-yellow-100 hover:bg-yellow-100 text-yellow-800";
    case "under-construction":
      return "bg-blue-100 hover:bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 hover:bg-green-100 text-green-800";
    default:
      return "bg-gray-100 hover:bg-gray-100 text-gray-800";
  }
};

export default function ProjectsTable() {
  // Hooks
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumb();
  const { useProjectsList } = useInventory();
  const { pageno } = useParams();
  const PageNo = Number(pageno) || 1;
  const { logout: handleLogout } = useAuth(true);
  const { filters, setFilters, resetFilters } = useInventoryStore();
  const { data: projectsData, isLoading, error } = useProjectsList(filters);

  // States
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isFiltered, setIsFiltered] = useState(false);

  // useEffects
  useEffect(() => {
    setBreadcrumbs([{ label: "Inventory" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    handlePageChange(PageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNo]);

  // Debounce hook
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters({ search: value, page: 1 });
  }, 600);

  // Event Handler
  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
    navigate(`/panel/inventory/${newPage}`);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
    setIsFiltered(!!value);
  };

  const handleClearFilter = () => {
    setSearchInput("");
    resetFilters();
    setIsFiltered(false);
  };

  /* const handleOpenDetails = (id: string) => {
    navigate(`details/${id}`);
  }; */

  // Error handling
  if (error) {
    const { response, message } = (error as CustomAxiosError) || {};
    let errMsg = response?.data.error ?? message;

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
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Manage your real estate projects</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Header */}
        <ProjectHeader
          search={searchInput}
          handleSearch={handleSearch}
          isFiltered={isFiltered}
          handleClearFilter={handleClearFilter}
          data={projectsData}
          handlePageChange={handlePageChange}
        />

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-card">
                <TableHead className="text-center">Project Name</TableHead>
                <TableHead className="text-center">Developer</TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Start Date
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Wings</TableHead>
                <TableHead className="text-center">Residential</TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Available Residential
                </TableHead>
                <TableHead className="text-center">Commercial</TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Available Commercial
                </TableHead>
                {/* <TableHead className="text-center">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectsData?.data.length === 0 ? (
                <TableRow className="hover:bg-card">
                  <TableCell colSpan={10} className="text-center py-8">
                    No projects found. Create your first project to get started.
                  </TableCell>
                </TableRow>
              ) : (
                projectsData?.data.map((project: ProjectSummaryType) => (
                  <TableRow className="hover:bg-card" key={project._id}>
                    <TableCell className="font-medium text-center">
                      {project.name}
                    </TableCell>
                    <TableCell className="text-center">{project.by}</TableCell>
                    <TableCell className="text-center">
                      {formatDate(project.startDate)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(project.status)}>
                        {toProperCase(project.status.replace("-", " "))}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {project.totalWings}
                    </TableCell>
                    <TableCell className="text-center">
                      {project.totalUnits}
                    </TableCell>
                    <TableCell className="text-center">
                      {project.totalAvailableUnits}
                      <span className="text-gray-500 text-xs pl-1">
                        (
                        {Math.round(
                          (project.totalAvailableUnits / project.totalUnits) *
                            100,
                        ) || 0}
                        %)
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {project.totalCommercialUnits}
                    </TableCell>
                    <TableCell className="text-center">
                      {project.totalAvailableCommercialUnits}
                      <span className="text-gray-500 text-xs pl-1">
                        (
                        {Math.round(
                          (project.totalAvailableCommercialUnits /
                            project.totalCommercialUnits) *
                            100,
                        ) || 0}
                        %)
                      </span>
                    </TableCell>
                    {/* <TableCell className="text-center">
                      <Button variant="secondary" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        {`Showing ${projectsData?.data.length} of ${projectsData?.pagination.totalProjects} clients`}
      </CardFooter>
    </Card>
  );
}
