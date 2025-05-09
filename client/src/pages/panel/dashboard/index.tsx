import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";
import BookingChart from "./booking";
import StatusChart from "./status-pie";
import { useAuth, useAuthStore } from "@/store/auth";
import { hasPermission } from "@/hooks/use-role";

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
    <div className="w-full grid gap-3 grid-cols-1 lg:grid-cols-3">
      <BookingChart manager={manager} />
      <StatusChart manager={manager} />
    </div>
  );
};

export default Dashboard;
