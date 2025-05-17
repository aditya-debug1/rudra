import { Tooltip } from "@/components/custom ui/tooltip-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClients, useClientStore } from "@/store/client";
import { useClientPartners } from "@/store/client-partner";
import { projectOptions, requirementOptions } from "@/store/data/options";
import { useUsersSummary } from "@/store/users";
import { Download, FileSpreadsheet } from "lucide-react";
import { useEffect } from "react";
import { ClientFilter } from "../../client/client-filter";
import { exportClientToExcel } from "./excel";

export function ClientReport() {
  // Fetch data from stores
  const { useClientsList } = useClients();
  const { filters, resetFilters } = useClientStore();
  const { data } = useClientsList({
    ...filters,
    page: 1,
    limit: 100000,
    search: "",
  });
  const { data: managers } = useUsersSummary();
  const { useReferenceWithDelete } = useClientPartners();
  const { data: refData } = useReferenceWithDelete();

  const countAppliedFilters = (filterObj: typeof filters) => {
    // List of keys to exclude
    const excludedKeys = ["managers", "page", "search", "limit"];

    const count = Object.entries(filterObj)
      .filter(([key]) => !excludedKeys.includes(key)) // Remove unwanted fields
      .reduce((total, [key, value]) => {
        // Handle budget logic
        if (key === "maxBudget" && !filterObj.minBudget) return total;
        if (key === "minBudget" && filterObj.maxBudget) return total + 1;
        return value ? total + 1 : total;
      }, 0);

    return count;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => resetFilters(), []);

  // Prepare the lists for export
  const lists = {
    requirementList: requirementOptions,
    projectList: projectOptions,
    managerList: managers ?? [],
    referenceList: refData?.references ?? [],
  };

  // Handle export action
  const handleDownload = () => {
    if (data?.clients && data.clients.length > 0) {
      exportClientToExcel(data.clients, lists);
    } else {
      console.log("No client data available");
    }
  };

  return (
    <Card className="w-72 flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <FileSpreadsheet className="text-gray-500" />
          <span className="text-sm text-gray-500 uppercase">XLSX</span>
        </div>
        <CardTitle className="mt-4">Client Report</CardTitle>
        <CardDescription>Detailed client list in a spreadsheet</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">{/* Your content here */}</CardContent>
      <CardFooter className="mt-auto flex-col gap-3">
        <ClientFilter>
          <Tooltip content="More filter options">
            <Button
              className="w-full flex-shrink-0 relative"
              variant="outline"
              disabled={!data?.clients || data.clients.length === 0}
            >
              {countAppliedFilters(filters) > 0 && (
                <Badge className="bg-red-500 text-white absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {countAppliedFilters(filters)}
                </Badge>
              )}
              Apply Filter
            </Button>
          </Tooltip>
        </ClientFilter>

        <Button
          className="w-full"
          variant="default"
          onClick={handleDownload}
          disabled={!data?.clients || data.clients.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </CardFooter>
    </Card>
  );
}
