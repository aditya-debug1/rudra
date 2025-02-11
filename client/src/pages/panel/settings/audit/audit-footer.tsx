import { PaginationControls } from "@/components/custom ui/pagination-controls";
import React from "react";

interface AuditFooterProps {
  currPage: number;
  totalPages: number;
  limit: number;
  totalLogs: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const AuditFooter = ({
  currPage,
  totalPages,
  limit,
  totalLogs,
  onPageChange,
  onPrevious,
  onNext,
}: AuditFooterProps) => {
  const total = totalLogs;
  const last = Math.min(limit * currPage, total);
  const first = limit * currPage - limit + 1;

  return (
    <div className="w-[90svw] md:w-full flex flex-wrap-reverse justify-around sm:justify-between items-center gap-2">
      <h3 className="text-primary/60 font-semibold text-center md:text-left px-1">
        {`Page no : ${currPage} of ${totalPages}`}
      </h3>

      <h3 className="text-primary/60 font-semibold text-center md:text-left px-1">
        {`Log Count: ${first} - ${last} of ${total}`}
      </h3>

      {totalPages > 1 && (
        <PaginationControls
          currPage={currPage}
          nPage={totalPages}
          nthClick={onPageChange}
          prevClick={onPrevious}
          nextClick={onNext}
        />
      )}
    </div>
  );
};
