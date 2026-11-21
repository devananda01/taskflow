// checks page and limit from the URL, returns an error message or null
function validatePaging(page, limit) {
    if (page !== undefined && page !== '' && !/^[1-9]\d*$/.test(String(page))) {
        return 'Invalid page. Page must be a whole number of 1 or more';
    }
    // limit must be a whole number from 1 to 50
    if (limit !== undefined && limit !== '') {
        if (!/^\d+$/.test(String(limit)) || Number(limit) < 1 || Number(limit) > 50) {
            return 'Invalid limit. Limit must be a whole number from 1 to 50';
        }
    }
    return null;
}

// returns one page of tasks plus the paging details
function getPage(items, page, limit) {
    limit = Math.min(50, Math.max(1, parseInt(limit) || 5));
    page = Math.max(1, parseInt(page) || 1);

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (page > totalPages) {
        page = totalPages;
    }

    const start = (page - 1) * limit;
    return {
        tasks: items.slice(start, start + limit),
        total: total,
        page: page,
        limit: limit,
        totalPages: totalPages
    };
}

module.exports = { getPage, validatePaging };