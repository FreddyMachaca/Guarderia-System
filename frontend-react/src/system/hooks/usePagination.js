import { useState, useCallback } from 'react';

const usePagination = (initialPage = 1, initialLimit = 9) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        per_page: initialLimit,
        has_next: false,
        has_previous: false
    });

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleLimitChange = useCallback((newLimit) => {
        setLimit(newLimit);
        setCurrentPage(1);
    }, []);

    const updatePagination = useCallback((paginationData) => {
        setPagination(paginationData);
        setCurrentPage(paginationData.current_page);
        setLimit(paginationData.per_page);
    }, []);

    const reset = useCallback(() => {
        setCurrentPage(1);
        setLimit(initialLimit);
        setPagination({
            current_page: 1,
            total_pages: 1,
            total_records: 0,
            per_page: initialLimit,
            has_next: false,
            has_previous: false
        });
    }, [initialLimit]);

    return {
        currentPage,
        limit,
        pagination,
        handlePageChange,
        handleLimitChange,
        updatePagination,
        reset
    };
};

export default usePagination;