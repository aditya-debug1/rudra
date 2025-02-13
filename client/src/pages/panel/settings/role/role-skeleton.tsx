import { Skeleton } from "@/components/ui/skeleton";
import styles from "@/scss/layout/SettingsLayout.module.scss";

export const RoleSkeleton = () => {
  return (
    <div
      className={`flex items-start gap-4 flex-col md:flex-row w-full overflow-hidden ${styles.SettingsLayout}`}
    >
      <Skeleton className="w-full h-[80svh] md:h-full md:max-w-sm" />
      <Skeleton className="w-full h-full" />
    </div>
  );
};
