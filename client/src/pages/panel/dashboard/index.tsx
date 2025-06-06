import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { hasPermission } from "@/hooks/use-role";
import { useAuth, useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import BookingRegistrationChart from "./b2r";
import BookingChart from "./booking";
import StatusChart from "./status-pie";
import TargetChart from "./target";

const Dashboard = () => {
  // Hooks
  const { setBreadcrumbs } = useBreadcrumb();
  const { combinedRole } = useAuth(true);
  const { user: currUser } = useAuthStore();

  // Variables
  const showUnfiltered = hasPermission(
    combinedRole,
    "Dashboard",
    "view-dashboard-unfiltered",
  );
  const manager = showUnfiltered ? undefined : currUser?.username;

  // useEffect
  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Dashboard",
      },
    ]);
  }, [setBreadcrumbs]);
  return (
    <div className="w-full grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <BookingChart manager={manager} />
      <StatusChart manager={manager} />
      <TargetChart manager={manager} />
      <BookingRegistrationChart manager={manager} />
    </div>
  );
};

export default Dashboard;
