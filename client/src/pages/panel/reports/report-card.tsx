import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown, Calendar, Download } from "lucide-react";
import React, { useState } from "react";
import { ReportType } from ".";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ReportCardProps extends ReportType {}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  icon,
  lastUpdated,
  fileSize,
  fileType,
  onDownload,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Card className="w-72 hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          {icon && React.isValidElement(icon)
            ? React.cloneElement(
                icon as React.ReactElement<{ className?: string }>,
                {
                  className: "text-gray-500",
                },
              )
            : icon}
          <span className="text-sm text-gray-500 uppercase">{fileType}</span>
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{lastUpdated}</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">{fileSize}</div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onDownload}
          className="w-full relative overflow-hidden group"
          variant="default"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className="flex items-center justify-center">
            <span className="relative flex items-center">
              <ArrowDown
                className={`h-4 w-4 mr-2 transition-all duration-300 absolute 
                  ${isHovered ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"}`}
              />
              <Download
                className={`h-4 w-4 mr-2 transition-all duration-300 absolute
                  ${isHovered ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"}`}
              />
              <span className="ml-6">Download Report</span>
            </span>
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};
