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
import ErrorCard, { AccessDenied } from "@/components/custom ui/error-display";
import { CustomAxiosError } from "@/utils/types/axios";
import { AuditSkeleton } from "./audit-skeleton";

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
  const { combinedRole, logout: handleLogout } = useAuth(false);
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

  const { data, isLoading, error, refetch } = useAuditLogs(queryParams);

  const debouncedRefetch = useDebounce(() => {
    refetch();
  }, 1000);

  const handleFilterChange = (
    key: keyof Omit<QueryParams, "page" | "limit">,
    value: string,
  ) => {
    setQueryParams((prev) => {
      const updatedParams = {
        ...prev,
        [key]: value,
        page: 1,
      };
      return updatedParams;
    });
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

  if (isLoading) return <AuditSkeleton />;

  if (error) {
    const { response, message } = error as CustomAxiosError;
    let errMsg = response?.data.error ?? message;

    if (errMsg === "Access denied. No token provided")
      errMsg = "Access denied. No token provided please login again";

    if (errMsg === "Network Error")
      errMsg =
        "Connection issue detected. Please check your internet or try again later.";

    return (
      <CenterWrapper className="px-2 gap-2 text-center">
        <ErrorCard
          title="Error occured"
          description={errMsg}
          btnTitle="Go to Login"
          onAction={handleLogout}
        />
      </CenterWrapper>
    );
  }

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
