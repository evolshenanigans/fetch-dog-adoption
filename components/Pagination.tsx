interface PaginationProps {
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onPageChange: (page: number) => void;
  }
  
  export default function Pagination({
    currentPage,
    hasNextPage,
    hasPrevPage,
    onPageChange,
  }: PaginationProps) {
    return (
      <div className="flex justify-center items-center mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
          Page {currentPage}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  }