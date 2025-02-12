import { useEffect, useState } from "react";
import { useAuditLogs } from "@/store/audit";
import { AuditHeader } from "./audit-header";
import { AuditLogTable } from "./audit-table";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { AuditFooter } from "./audit-footer";
import { useAuth } from "@/store/auth";
import { hasPermission } from "@/hooks/use-role";
import { CenterWrapper } from "@/components/custom ui/center-page";
import { AccessDenied } from "@/components/custom ui/error-display";

interface QueryParams {
  page: number;
  limit: number;
  search: string;
  source: string;
  action: string;
  startDate: string;
  endDate: string;
}

export default function AuditLogPage() {
  const limit = 5;
  const { setBreadcrumbs } = useBreadcrumb();
  const { combinedRole } = useAuth(false);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: limit,
    search: "",
    source: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  const showAudits = hasPermission(combinedRole, "Settings", "read-audit");

  useEffect(() => {
    setBreadcrumbs([
      { label: "Settings", to: "/panel/settings" },
      { label: "Audit" },
    ]);
  }, [setBreadcrumbs]);

  const { data, isLoading, refetch } = useAuditLogs(queryParams);

  const debouncedRefetch = useDebounce(() => {
    refetch();
  }, 1000);

  const handleFilterChange = (
    key: keyof Omit<QueryParams, "page" | "limit">,
    value: string,
  ) => {
    const updatedParams = {
      ...queryParams,
      [key]: value,
      page: 1, // Reset page to 1 when any filter changes
    };
    setQueryParams(updatedParams);
    debouncedRefetch();
  };

  const handleClearFilters = () => {
    const clearedParams = {
      ...queryParams,
      search: "",
      source: "",
      action: "",
      startDate: "",
      endDate: "",
      page: 1,
    };
    setQueryParams(clearedParams);
    refetch();
  };

  const Pagination = {
    next: () => {
      if (queryParams.page < (data?.totalPages || 1)) {
        setQueryParams((prev) => ({
          ...prev,
          page: prev.page + 1,
        }));
        refetch();
      }
    },
    prev: () => {
      if (queryParams.page > 1) {
        setQueryParams((prev) => ({
          ...prev,
          page: prev.page - 1,
        }));
        refetch();
      }
    },
    nth: (page: number) => {
      if (page >= 1 && page <= (data?.totalPages || 1)) {
        setQueryParams((prev) => ({
          ...prev,
          page,
        }));
        refetch();
      }
    },
  };

  const actionOptions = ["create", "update", "delete", "locked", "unlocked"];
  const sourceOptions = ["Users", "Roles"];

  if (isLoading) return <div>Loading...</div>;

  if (!showAudits)
    return (
      <CenterWrapper>
        <AccessDenied />
      </CenterWrapper>
    );

  return (
    <div className="w-full flex items-center flex-col gap-2">
      <AuditHeader
        filters={queryParams}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        actionOptions={actionOptions}
        sourceOptions={sourceOptions}
      />
      <AuditLogTable logs={data?.logs || []} />
      <AuditFooter
        currPage={+queryParams.page || 0}
        totalPages={data?.totalPages || 0}
        limit={limit}
        totalLogs={data?.totalLogs || 0}
        onNext={Pagination.next}
        onPrevious={Pagination.prev}
        onPageChange={Pagination.nth}
      />
    </div>
  );
}
