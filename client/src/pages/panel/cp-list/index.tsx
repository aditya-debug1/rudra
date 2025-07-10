import { CenterWrapper } from "@/components/custom ui/center-page";
import ErrorCard from "@/components/custom ui/error-display";
import { Loader } from "@/components/custom ui/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/store/auth";
import {
  useClientPartners,
  useClientPartnerStore,
} from "@/store/client-partner";
import { CustomAxiosError } from "@/utils/types/axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClientPartnerFooter } from "./cp-footer";
import { ClientPartnerHeader } from "./cp-header";
import { ClientPartnerTable } from "./cp-table";

const ClientPartnerList = () => {
  // Hooks
  const { setBreadcrumbs } = useBreadcrumb();
  const navigate = useNavigate();
  const { pageno } = useParams<{ pageno: string }>();
  const PageNo = Number(pageno) ? Number(pageno) : 1;
  const { logout: handleLogout } = useAuth(true);
  const { filters, setFilters, resetFilters, setSelectedClientPartnerId } =
    useClientPartnerStore();
  const { useClientPartnersList } = useClientPartners();
  const { data, isLoading, error } = useClientPartnersList(filters);

  // States
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [createdBy, setCreatedBy] = useState<string>(filters.createdBy || "");
  const [isFiltered, setIsFiltered] = useState(false);

  // Debounce hook
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters({ search: value, page: 1 });
    handlePageChange(1);
  }, 600);

  // Event Handler
  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
    navigate(`/panel/client-partners/${newPage}`);
  };

  const handleCreatedBySelect = (user: string) => {
    setCreatedBy(user);
    setFilters({ createdBy: user });
    setIsFiltered(true);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
    setIsFiltered(!!value);
  };

  const handleClearFilter = () => {
    setSearchInput("");
    setCreatedBy("");
    resetFilters();
    setIsFiltered(false);
  };

  const handleOpenDetails = (id: string) => {
    navigate(`details/${id}`);
    setSelectedClientPartnerId(id);
  };

  // useEffects
  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Channel Partner List",
      },
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    handlePageChange(PageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNo]);

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
    <Card className="w-[90svw] lg:w-full">
      <CardHeader>
        <CardTitle>Channel Partner List</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Client Partner Header */}
        <ClientPartnerHeader
          searchInput={searchInput}
          handleSearch={handleSearch}
          createdBy={createdBy}
          setCreatedBy={handleCreatedBySelect}
          isFiltered={isFiltered}
          handleClearFilter={handleClearFilter}
          data={data}
          handlePageChange={handlePageChange}
        />

        {/* Client Partner Table */}
        <ClientPartnerTable data={data} handleOpenDetails={handleOpenDetails} />

        {/* Client Partner Footer */}
        <ClientPartnerFooter data={data} />
      </CardContent>
    </Card>
  );
};

export default ClientPartnerList;
