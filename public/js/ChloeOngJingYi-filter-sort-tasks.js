var searchTimer;
var MAX_SEARCH_LENGTH = 50;

// waits until the user stops typing before searching
function debounceSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
        filterSortTasks(1);
    }, 300);
}

// the search box in the top bar uses the same search as the one above the table
function searchFromTopBar() {
    document.getElementById('searchInput').value = document.getElementById('topSearch').value;
    debounceSearch();
}

// reads the search box, filters and sort dropdown, checks them, asks the backend
// for the matching tasks and redraws the table
// the sort dropdown values look like "deadline:asc", "priority:desc", "title:asc"
function filterSortTasks(page) {
    var search = document.getElementById('searchInput').value.trim();
    var status = document.getElementById('filterStatus').value;
    var category = document.getElementById('filterCategory').value;
    var priority = document.getElementById('filterPriority').value;
    var sort = document.getElementById('sortBy').value.split(':');
    var sortField = sort[0];
    var sortOrder = sort[1];

    // validate the values before sending anything (frontend validation)
    if (search.length > MAX_SEARCH_LENGTH) {
        showError('Search text must be ' + MAX_SEARCH_LENGTH + ' characters or fewer.');
        return;
    }
    if (category.length > MAX_SEARCH_LENGTH) {
        showError('Category is too long.');
        return;
    }
    if (status != '' && status != 'Pending' && status != 'In Progress' && status != 'Completed') {
        showError('Invalid status selected. Choose Pending, In Progress or Completed.');
        return;
    }
    if (priority != '' && priority != 'High' && priority != 'Medium' && priority != 'Low') {
        showError('Invalid priority selected. Choose High, Medium or Low.');
        return;
    }
    if (['title', 'category', 'priority', 'status', 'deadline'].indexOf(sortField) === -1 ||
        ['asc', 'desc'].indexOf(sortOrder) === -1) {
        showError('Invalid sort option selected.');
        return;
    }
    clearError();

    // build the query string, leaving out empty filters
    var params = [];
    if (search != '') params.push('search=' + encodeURIComponent(search));
    if (status != '') params.push('status=' + encodeURIComponent(status));
    if (category != '') params.push('category=' + encodeURIComponent(category));
    if (priority != '') params.push('priority=' + encodeURIComponent(priority));
    params.push('sortBy=' + encodeURIComponent(sortField));
    params.push('order=' + encodeURIComponent(sortOrder));
    params.push('page=' + (page || 1));
    params.push('limit=' + PAGE_SIZE);

    var response = '';
    var request = new XMLHttpRequest();
    request.open('GET', '/filter-sort-tasks?' + params.join('&'), true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);

        // show the error message if the backend rejected the request (400) or failed (500)
        if (request.status !== 200) {
            showError(response.message || 'Unable to filter/sort tasks!');
            return;
        }

        // build the table rows
        var tasks = response.tasks;
        var html = '';
        for (var i = 0; i < tasks.length; i++) {
            html += '<tr>' +
                '<td>' +
                    '<input type="checkbox" disabled> ' +
                    '<span class="task-title ' + (tasks[i].status === 'Completed' ? 'task-done' : '') + '" onclick="viewTaskDetails(\'' + tasks[i].id + '\')">' + escapeHtml(tasks[i].title) + '</span>' +
                    (tasks[i].description ? '<div class="task-description">' + escapeHtml(tasks[i].description) + '</div>' : '') +
                '</td>' +
                '<td>' + escapeHtml(tasks[i].category) + '</td>' +
                '<td>' + escapeHtml(tasks[i].priority) + '</td>' +
                '<td>' + escapeHtml(tasks[i].status) + '</td>' +
                '<td>' + formatDate(tasks[i].deadline) + '</td>' +
                '<td>' +
    '<button type="button" onclick="viewTaskDetails(\'' + tasks[i].id + '\')">Details</button> ' + taskActionButtons(tasks[i]) + '</td>'+
            '</tr>';
        }
        document.getElementById('tableContent').innerHTML = html;

        // "12 tasks" and "Showing 1 to 5 of 12 tasks"
        var from = response.total === 0 ? 0 : (response.page - 1) * response.limit + 1;
        var to = (response.page - 1) * response.limit + tasks.length;
        document.getElementById('taskCount').innerHTML = response.total + ' tasks';
        document.getElementById('showingText').innerHTML = 'Showing <b>' + from + '</b> to <b>' + to + '</b> of <b>' + response.total + '</b> tasks';

        // page buttons: Previous 1 2 3 Next (the current page is disabled)
        var buttons = '<button type="button" ' +
            (response.page <= 1 ? 'disabled' : 'onclick="filterSortTasks(' + (response.page - 1) + ')"') + '>Previous</button> ';
        for (var p = 1; p <= response.totalPages; p++) {
            buttons += '<button type="button" ' +
                (p === response.page ? 'disabled' : 'onclick="filterSortTasks(' + p + ')"') + '>' + p + '</button> ';
        }
        buttons += '<button type="button" ' +
            (response.page >= response.totalPages ? 'disabled' : 'onclick="filterSortTasks(' + (response.page + 1) + ')"') + '>Next</button>';
        document.getElementById('pagination').innerHTML = buttons;

        // show "No tasks found" instead of the table when nothing matches
        if (tasks.length === 0) {
            var message = "You don't have any tasks yet. Create your first task to get started.";
            if (search != '') {
                message = "We couldn't find any tasks matching <code>“" + escapeHtml(search) + "”</code>. " +
                    "Try adjusting your search query, clearing filters, or create a brand new task.";
            } else if (status != '' || category != '' || priority != '') {
                message = "We couldn't find any tasks matching your filters. Try adjusting or clearing them, or create a brand new task.";
            }
            document.getElementById('emptyMessage').innerHTML = message;
            document.getElementById('tableWrapper').classList.add('d-none');
            document.getElementById('emptyState').classList.remove('d-none');
        } else {
            document.getElementById('tableWrapper').classList.remove('d-none');
            document.getElementById('emptyState').classList.add('d-none');
        }
    };

    request.onerror = function () {
        showError('Unable to reach the server. Please try again.');
    };

    request.send();
}

// the "x" button inside the search box
function clearSearch() {
    document.getElementById('searchInput').value = '';
    filterSortTasks(1);
}

// the "Clear" button and "Clear Filters & Search": resets search, filters and sort
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('sortBy').value = 'deadline:asc';
    filterSortTasks(1);
}