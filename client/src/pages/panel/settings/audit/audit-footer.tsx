import { Button } from "@/components/ui/button";

interface AuditFooterProps {
  currPage: number;
  totalPages: number;
  limit: number;
  totalLogs: number;
  onPageChange: (page: number) => void;
}

export const AuditFooter = ({
  currPage,
  totalPages,
  limit,
  totalLogs,
  onPageChange,
}: AuditFooterProps) => {
  const total = totalLogs;
  const last = Math.min(limit * currPage, total);
  const first = limit * currPage - limit + 1;

  return (
    <div className="w-[90svw] md:w-full flex flex-wrap-reverse justify-around sm:justify-between items-center gap-2">
      <h3 className="text-primary/60 font-semibold text-center md:text-left px-1">
        {`Log Count: ${first} - ${last} of ${total}`}
      </h3>
      {totalPages > 1 && (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={currPage <= 1}
            onClick={() => onPageChange(currPage - 1)}
          >
            Previous
          </Button>

          <span className="px-2 text-sm whitespace-nowrap">
            Page {currPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currPage >= totalPages}
            onClick={() => onPageChange(currPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
