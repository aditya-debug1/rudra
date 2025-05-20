// AuthPage.tsx
import { CenterWrapper } from "@/components/custom ui/center-page";
import ErrorCard, { AccessDenied } from "@/components/custom ui/error-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { hasPermission } from "@/hooks/use-role";
import { AuthLogsParams, useAuth, useAuthLogs } from "@/store/auth";
import { CustomAxiosError } from "@/utils/types/axios";
import { useEffect, useState } from "react";
import { AuthFooter } from "./auth-footer";
import AuthHeader from "./auth-header";
import AuthPageSkeleton from "./auth-skeleton";
import { AuthTable } from "./auth-table";

const DEFAULT_FILTERS: AuthLogsParams = {
  page: 1,
  limit: 5,
  search: "",
  action: "",
  username: "",
  startDate: undefined,
  endDate: undefined,
};

export default function AuthPage() {
  // Hooks & States
  const [filters, setFilters] = useState<AuthLogsParams>(DEFAULT_FILTERS);
  const { setBreadcrumbs } = useBreadcrumb();
  const { combinedRole, logout: handleLogout } = useAuth(true);
  const { data, isLoading, error } = useAuthLogs(filters);
  const [searchTerm, setSearchTerm] = useState("");

  // Dynamic Variables
  const showAuthLogs = hasPermission(combinedRole, "Settings", "view-auth");

  // Event Handlers
  function handleSetFilters(newFilters: Partial<AuthLogsParams>) {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters, page: 1 }));
  }

  function handleResetFilters() {
    setSearchTerm(""); // Reset search term state
    setFilters(DEFAULT_FILTERS); // Reset filters to default
  }

  function onPageChange(n: number) {
    setFilters((prev) => ({ ...prev, page: n }));
  }

  const debouncedSearch = useDebounce((term: string) => {
    handleSetFilters({ search: term });
  }, 1000);

  function handleSearch(term: string) {
    setSearchTerm(term);
    debouncedSearch(term);
  }

  // useEffects
  useEffect(() => {
    setBreadcrumbs([
      { label: "Settings", to: "/panel/settings" },
      { label: "Auth Logs" },
    ]);
  }, [setBreadcrumbs]);

  if (isLoading) return <AuthPageSkeleton />;

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

  if (!showAuthLogs)
    return (
      <CenterWrapper>
        <AccessDenied />
      </CenterWrapper>
    );

  return (
    <Card className="w-[90svw] lg:w-full">
      <CardHeader>
        <CardTitle>Auth Logs</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <AuthHeader
          filters={filters}
          search={searchTerm}
          onSearch={handleSearch}
          onClearFilters={handleResetFilters}
          onFilterChange={handleSetFilters}
        />
        <AuthTable data={data?.logs || []} />
        <AuthFooter
          currPage={data?.currentPage || 1}
          totalPages={data?.totalPages || 1}
          limit={data?.limitNumber || filters.limit}
          totalLogs={data?.totalLogs || 0}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
