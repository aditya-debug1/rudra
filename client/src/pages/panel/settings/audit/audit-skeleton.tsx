import { Skeleton } from "@/components/ui/skeleton";

export const AuditSkeleton = () => {
  return (
    <div className="w-full flex items-center flex-col gap-2">
      <div className="w-full">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12 items-start">
          <div className="flex gap-2 lg:col-span-3">
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <Skeleton className="h-10 w-full sm:w-[300px]" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 lg:col-span-5 lg:justify-end">
            <Skeleton className="h-10 w-full  sm:w-[30%]" />
            <Skeleton className="h-10 w-full  sm:w-[30%]" />
          </div>
        </div>
      </div>
      <Skeleton className="h-96 w-full" />
      <div className="w-[90svw] md:w-full flex flex-wrap-reverse justify-around sm:justify-between items-center gap-2">
        <div />
        <div />
        <Skeleton className="h-10 w-full  sm:w-64" />
      </div>
    </div>
  );
};
