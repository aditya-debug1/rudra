import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClients } from "@/store/client";
import { useClientPartners } from "@/store/client-partner";
import { projectOptions, requirementOptions } from "@/store/data/options";
import { useUsersSummary } from "@/store/users";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportClientToExcel } from "./excel";

export function ClientReport() {
  // Fetch data from stores
  const { useClientsList } = useClients();
  const { data } = useClientsList({ page: 1, limit: 100000, search: "" });
  const { data: managers } = useUsersSummary();
  const { useReferenceWithDelete } = useClientPartners();
  const { data: refData } = useReferenceWithDelete();

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
      <CardFooter className="mt-auto flex-col gap-2">
        {/* <Button
          className="w-full"
          variant="secondary"
          disabled={!data?.clients || data.clients.length === 0}
        >
          Apply Filter
        </Button> */}
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
