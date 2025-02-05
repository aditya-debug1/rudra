import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";

const Task = () => {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Task",
      },
    ]);
  }, [setBreadcrumbs]);
  return <div>Dummy Task</div>;
};

export default Task;
