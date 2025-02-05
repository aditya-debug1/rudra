import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";

const Reports = () => {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Reports",
      },
    ]);
  }, [setBreadcrumbs]);
  return <div>Dummy Reports</div>;
};

export default Reports;
