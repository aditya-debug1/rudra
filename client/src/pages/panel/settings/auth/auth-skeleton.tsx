// AuthPageSkeleton.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";

export function AuthHeaderSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12 items-start">
        {/* Search and Clear Filters Section */}
        <div className="flex gap-2 lg:col-span-3">
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Date Range Picker Section */}
        <div className="lg:col-span-4 flex justify-center">
          <Skeleton className="h-10 w-full lg:w-[240px]" />
        </div>
        {/* Select Filters Section */}
        <div className="flex flex-col sm:flex-row gap-2 lg:col-span-5 lg:justify-end">
          <Skeleton className="h-10 w-full sm:w-[180px]" />
        </div>
      </div>
    </div>
  );
}

export function AuthTableSkeleton() {
  return (
    <Card className="w-full overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-card">
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function AuthFooterSkeleton() {
  return (
    <div className="w-full flex flex-wrap-reverse justify-around sm:justify-between items-center gap-2">
      <Skeleton className="h-5 w-40" />
      <div className="flex gap-2 items-center">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export default function AuthPageSkeleton() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Settings", to: "/panel/settings" },
      { label: "Auth Logs" },
    ]);
  }, [setBreadcrumbs]);

  return (
    <Card className="w-[90svw] lg:w-full">
      <CardHeader>
        <CardTitle>Auth Logs</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <AuthHeaderSkeleton />
        <AuthTableSkeleton />
        <AuthFooterSkeleton />
      </CardContent>
    </Card>
  );
}
