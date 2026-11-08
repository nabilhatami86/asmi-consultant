"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize
}: PaginationProps) {
  let startPage = Math.max(1, currentPage - 7);
  let endPage = Math.min(totalPages, startPage + 14);
  if (endPage - startPage < 14) {
    startPage = Math.max(1, endPage - 14);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-xs">
      {totalItems !== undefined && pageSize !== undefined ? (
        <span className="text-stone-500">
          Halaman <strong className="text-stone-800">{currentPage}</strong> dari <strong className="text-stone-800">{totalPages}</strong> (Total {totalItems} data)
        </span>
      ) : <div />}

      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition"
        >
          &laquo; Prev
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium hover:bg-stone-50">1</button>
            {startPage > 2 && <span className="text-stone-400 px-1">...</span>}
          </>
        )}

        {Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 rounded-lg font-bold transition text-xs ${
              currentPage === p
                ? "bg-stone-900 text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-stone-400 px-1">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium hover:bg-stone-50">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition"
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
}
