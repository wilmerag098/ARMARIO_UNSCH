import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    theme?: 'light' | 'dark';
}

export default function Pagination({ currentPage, totalPages, onPageChange, theme = 'light' }: PaginationProps) {
    if (totalPages <= 1) {
return null;
}

    // Generate page numbers
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    const pages = getPageNumbers();
    const isDark = theme === 'dark';

    // CSS Classes based on Light/Dark Theme
    const containerClass = isDark
        ? "flex items-center justify-center gap-2 py-5 px-6 border-t border-[#290a0f]"
        : "flex items-center justify-center gap-2 py-5 px-6 border-t border-[#ebd7da]";

    const getButtonClass = (page: number | string) => {
        const isSelected = page === currentPage;

        if (isSelected) {
            return isDark
                ? "w-9 h-9 flex items-center justify-center rounded-xl bg-[#350e18] border border-[#ffb6c5]/35 text-[#ffb6c5] font-extrabold transition-all duration-200 shadow-md shadow-[#350e18]/40"
                : "w-9 h-9 flex items-center justify-center rounded-xl bg-[#350e18] border border-[#350e18] text-[#ffb6c5] font-extrabold transition-all duration-200 shadow-md shadow-[#350e18]/25";
        }

        return isDark
            ? "w-9 h-9 flex items-center justify-center rounded-xl border border-[#ffb6c5]/15 bg-transparent hover:bg-[#290a0f]/40 text-[#d2a9b1] hover:text-[#fdeaea] font-semibold transition-all duration-200 cursor-pointer"
            : "w-9 h-9 flex items-center justify-center rounded-xl border border-[#ebd7da] bg-transparent hover:bg-[#ebd7da]/20 text-[#571e26] hover:text-[#94344c] font-semibold transition-all duration-200 cursor-pointer";
    };

    const getNavButtonClass = (disabled: boolean) => {
        if (disabled) {
            return isDark
                ? "w-9 h-9 flex items-center justify-center rounded-xl border border-[#ffb6c5]/5 bg-transparent text-[#d2a9b1]/20 cursor-not-allowed"
                : "w-9 h-9 flex items-center justify-center rounded-xl border border-[#ebd7da]/40 bg-transparent text-[#571e26]/30 cursor-not-allowed";
        }

        return isDark
            ? "w-9 h-9 flex items-center justify-center rounded-xl border border-[#ffb6c5]/15 bg-transparent hover:bg-[#290a0f]/40 text-[#d2a9b1] hover:text-[#fdeaea] font-semibold transition-all duration-200 cursor-pointer"
            : "w-9 h-9 flex items-center justify-center rounded-xl border border-[#ebd7da] bg-transparent hover:bg-[#ebd7da]/20 text-[#571e26] hover:text-[#94344c] font-semibold transition-all duration-200 cursor-pointer";
    };

    const ellipsisClass = isDark
        ? "px-2 text-[#d2a9b1]/60 font-semibold"
        : "px-2 text-[#571e26]/60 font-semibold";

    return (
        <div className={containerClass}>
            {/* Prev Button */}
            <button
                type="button"
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={getNavButtonClass(currentPage === 1)}
                aria-label="Página anterior"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Pages */}
            {pages.map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`ellipsis-${index}`} className={ellipsisClass}>
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        type="button"
                        key={`page-${page}`}
                        onClick={() => onPageChange(page as number)}
                        className={getButtonClass(page)}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Next Button */}
            <button
                type="button"
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={getNavButtonClass(currentPage === totalPages)}
                aria-label="Página siguiente"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
