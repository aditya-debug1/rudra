import {
  FileBox,
  FileChartPie,
  FileSpreadsheet,
  Paperclip,
} from "lucide-react";
import { ReactNode } from "react";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";
import { ReportCard } from "./report-card";

export interface ReportType {
  title: string;
  description: string;
  icon: ReactNode;
  lastUpdated: string;
  fileSize: string;
  fileType: "PDF" | "XLSX" | "CSV" | "DOC" | string;
  onDownload: () => void;
}

const Reports = () => {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Reports",
      },
    ]);
  }, [setBreadcrumbs]);

  const reports: ReportType[] = [
    {
      title: "Monthly Sales Report",
      description: "Detailed breakdown of sales performance and metrics",
      icon: <Paperclip />,
      lastUpdated: "Last updated: Feb 13, 2025",
      fileSize: "Size: 2.4 MB",
      fileType: "PDF",
      onDownload: () => console.log("Downloading Monthly Sales Report"),
    },
    {
      title: "Customer Analytics",
      description: "Customer behavior and engagement statistics",
      icon: <FileChartPie />,
      lastUpdated: "Last updated: Feb 12, 2025",
      fileSize: "Size: 1.8 MB",
      fileType: "XLSX",
      onDownload: () => console.log("Downloading Customer Analytics"),
    },
    {
      title: "Inventory Status",
      description: "Current stock levels and inventory movements",
      icon: <FileBox />,
      lastUpdated: "Last updated: Feb 13, 2025",
      fileSize: "Size: 956 KB",
      fileType: "CSV",
      onDownload: () => console.log("Downloading Inventory Status"),
    },
    {
      title: "Inventory Status",
      description: "Current stock levels and inventory movements",
      icon: <FileSpreadsheet />,
      lastUpdated: "Feb 13, 2025",
      fileSize: "Size: 956 KB",
      fileType: "CSV",
      onDownload: () => console.log("Downloading Inventory Status"),
    },
  ];

  return (
    <div className="w-full grid place-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {reports.map((report, index) => (
        <ReportCard key={index} {...report} />
      ))}
    </div>
  );
};

export default Reports;
