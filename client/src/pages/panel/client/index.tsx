import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { useClients, useClientStore } from "@/store/client";
import { useEffect, useState } from "react";
import { ClientTable } from "./client-table";
import { ClientFooter } from "./client-footer";
import { ClientHeader } from "./client-header";
import { useNavigate } from "react-router-dom";

const ClientsList = () => {
  const { filters, setFilters, setSelectedClientId } = useClientStore();
  const navigate = useNavigate();
  const [isFiltered, setIsFiltered] = useState(false);
  const [status, setStatus] = useState(filters.status || "");
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const { setBreadcrumbs } = useBreadcrumb();
  const { useClientsList } = useClients();
  const { data, isLoading, isError } = useClientsList(filters);

  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters({ search: value, page: 1 });
  }, 600);

  // Reset all filters
  const handleClearFilter = () => {
    setSearchInput("");
    setStatus("");
    setFilters({ status: undefined, search: "", page: 1 });
    setIsFiltered(false);
  };

  // Handle search input changes
  const handleSearch = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
    setIsFiltered(!!value || !!status);
  };

  // Handle status filter changes
  const handleSetStatus = (
    newStatus: "lost" | "cold" | "warm" | "hot" | "booked" | undefined,
  ) => {
    setFilters({ status: newStatus, page: 1 });
    setStatus(newStatus || "");
    setIsFiltered(!!newStatus || !!searchInput);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  // Handle client selection
  const handleOpenDetails = (id: string) => {
    navigate(`details/${id}`);
    setSelectedClientId(id);
  };

  // Set up breadcrumbs on mount
  useEffect(() => {
    setBreadcrumbs([{ label: "Client List" }]);
  }, [setBreadcrumbs]);

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading clients...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-6">Error loading clients</div>;
  }

  return (
    <Card className="w-[90svw] lg:w-full">
      <CardHeader>
        <CardTitle>Client List</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientHeader
          isFiltered={isFiltered}
          searchInput={searchInput}
          handleSearch={handleSearch}
          handleClearFilter={handleClearFilter}
          data={data}
          handlePageChange={handlePageChange}
          status={status}
          handleSetStatus={handleSetStatus}
        />

        <ClientTable data={data} openDetails={handleOpenDetails} />

        {data && <ClientFooter data={data} />}
      </CardContent>
    </Card>
  );
};

export default ClientsList;
