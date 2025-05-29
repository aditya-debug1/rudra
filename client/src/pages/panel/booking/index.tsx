import { CenterWrapper } from "@/components/custom ui/center-page";
import ErrorCard from "@/components/custom ui/error-display";
import { Loader } from "@/components/custom ui/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/store/auth";
import { useClientBookings } from "@/store/client-booking/query";
import { useBookingStore } from "@/store/client-booking/store";
import { CustomAxiosError } from "@/utils/types/axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookingFooter } from "./booking-footer";
import { BookingHeader } from "./booking-header";
import { BookingTable } from "./booking-table";

const BookingList = () => {
  // Hooks
  const { setBreadcrumbs } = useBreadcrumb();
  const { pageno } = useParams<{ pageno: string }>();
  const PageNo = Number(pageno) ? Number(pageno) : 1;
  const { filters, setFilters, resetFilters } = useBookingStore();
  const [searchTerm, setSearchTerm] = useState<string>(filters.search || "");
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const navigate = useNavigate();
  const { data, isLoading, error } = useClientBookings(filters);
  const { logout: handleLogout } = useAuth(true);
  console.log(filters);

  // Event Handlers
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters({ search: value });
  }, 600);

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
    navigate(`/panel/booking/${newPage}`);
  };

  const handleSearch = (value: string) => {
    handlePageChange(1);
    debouncedSetSearch(value);
    setSearchTerm(value);
    setIsFiltered(true);
    setIsFiltered(!!value || !!status);
  };

  const handleClearFilter = () => {
    setSearchTerm("");
    resetFilters();
    setStatus("");
    setIsFiltered(false);
    setFilters({ page: 1, limit: 5 });
  };

  const handleSetStatus = (newStatus: string) => {
    setFilters({ status: newStatus, page: 1 });
    setStatus(newStatus || "");
    setIsFiltered(!!newStatus || !!searchTerm);
  };

  // useEffects
  useEffect(() => {
    setBreadcrumbs([{ label: "Booking List" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (filters.status) setStatus(filters.status);
  }, [filters]);

  useEffect(() => {
    handlePageChange(PageNo);
    if (PageNo) {
      setFilters({ page: PageNo });
    } else resetFilters();
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
        <CardTitle>Booking List</CardTitle>
        <CardDescription>
          A comprehensive list of all customer booking details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BookingHeader
          setIsFiltered={setIsFiltered}
          data={data}
          isFiltered={isFiltered}
          handleClearFilter={handleClearFilter}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          status={status}
          handleSetStatus={handleSetStatus}
          handlePageChange={handlePageChange}
        />
        <BookingTable data={data} />
        <BookingFooter data={data} />
      </CardContent>
    </Card>
  );
};

export default BookingList;
