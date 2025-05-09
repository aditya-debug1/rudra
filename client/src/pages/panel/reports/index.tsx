import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";
import { ClientReport } from "./client";
import { InventoryReport } from "./inventory";
import { useAuth } from "@/store/auth";
import { hasPermission } from "@/hooks/use-role";

const Reports = () => {
  // Hooks
  const { setBreadcrumbs } = useBreadcrumb();
  const { combinedRole } = useAuth(true);

  // Helper functions
  const showReport = (perm: string) => {
    return hasPermission(combinedRole, "Reports", perm);
  };

  // useEffects
  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Reports",
      },
    ]);
  }, [setBreadcrumbs]);

  return (
    <div className="w-full grid place-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {showReport("client-report") && <ClientReport />}
      {showReport("inventory-report") && <InventoryReport />}
    </div>
  );
};

export default Reports;
