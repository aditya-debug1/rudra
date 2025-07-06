import { CenterWrapper } from "@/components/custom ui/center-page";
import ErrorCard from "@/components/custom ui/error-display";
import { Loader } from "@/components/custom ui/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreadcrumb, useBreadcrumbStore } from "@/hooks/use-breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { hasPermission } from "@/hooks/use-role";
import { useAuth, useAuthStore } from "@/store/auth";
import { useClients, useClientStore } from "@/store/client";
import { CustomAxiosError } from "@/utils/types/axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClientFooter } from "./client-footer";
import { ClientHeader } from "./client-header";
import { ClientTable } from "./client-table";

const ClientsList = () => {
  // Hooks
  const { filters, setFilters, resetFilters, setSelectedClientId } =
    useClientStore();
  const navigate = useNavigate();
  const { pageno } = useParams<{ pageno: string }>();
  const PageNo = Number(pageno) ? Number(pageno) : 1;
  const [isFiltered, setIsFiltered] = useState(false);
  const [status, setStatus] = useState(filters.status || "");
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const { setBreadcrumbs } = useBreadcrumb();
  const { setBreadcrumbItems } = useBreadcrumbStore();
  const { useClientsList } = useClients();
  const { data, isLoading, error } = useClientsList(filters);
  const { logout: handleLogout, combinedRole } = useAuth(true);
  const { user: currUser } = useAuthStore();

  const showAllClients = hasPermission(
    combinedRole,
    "Clients",
    "view-all-clients",
  );

  const showContactInfo = hasPermission(
    combinedRole,
    "Clients",
    "view-contact-info",
  );

  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters({ search: value, page: 1 });
  }, 600);

  // Event Handlers
  const handleClearFilter = () => {
    setSearchInput("");
    setStatus("");
    resetFilters();
    setIsFiltered(false);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
    setIsFiltered(!!value || !!status);
  };

  const handleSetStatus = (
    newStatus: "lost" | "cold" | "warm" | "hot" | "booked" | undefined,
  ) => {
    setFilters({ status: newStatus, page: 1 });
    setStatus(newStatus || "");
    setIsFiltered(!!newStatus || !!searchInput);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
    navigate(`/panel/clients/${newPage}`);
  };

  const handleOpenDetails = (id: string) => {
    navigate(`details/${id}`);
    setSelectedClientId(id);
  };

  // useEffects
  useEffect(() => {
    // Set up breadcrumbs on mount
    setBreadcrumbs([{ label: "Client List" }]);
    setBreadcrumbItems(undefined);
  }, [setBreadcrumbs, setBreadcrumbItems]);

  useEffect(() => {
    handlePageChange(PageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNo]);

  useEffect(() => {
    if (filters.status) setStatus(filters.status);
  }, [filters]);

  useEffect(() => {
    if (!showAllClients) {
      setFilters({ manager: currUser?.username });
    } else {
      // Clear the manager filter when user has showAllClients permission
      setFilters({ manager: undefined });
    }
  }, [showAllClients, currUser, setFilters]);

  // JSX Part
  if (isLoading) {
    return (
      <CenterWrapper>
        <Loader />
      </CenterWrapper>
    );
  }

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

  return (
    <Card className="w-[90svw] lg:w-[95svw] xl:w-full">
      <CardHeader>
        <CardTitle>Client List</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientHeader
          isFiltered={isFiltered}
          setIsFiltered={setIsFiltered}
          searchInput={searchInput}
          handleSearch={handleSearch}
          handleClearFilter={handleClearFilter}
          data={data}
          handlePageChange={handlePageChange}
          status={status}
          handleSetStatus={handleSetStatus}
        />

        <ClientTable
          data={data}
          openDetails={handleOpenDetails}
          showContactInfo={showContactInfo}
        />

        {data && <ClientFooter data={data} />}
      </CardContent>
    </Card>
  );
};

export default ClientsList;
