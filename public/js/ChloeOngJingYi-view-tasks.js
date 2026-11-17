var PAGE_SIZE = 5; // number of tasks shown per page

// replaces special characters so task text is shown as text, not as HTML
function escapeHtml(text) {
    return String(text === undefined || text === null ? '' : text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// changes "2026-11-10" into "10 Nov 2026"
function formatDate(dateString) {
    if (!dateString) return '-';
    var parts = dateString.split('-');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
}

// shows a message in the red error box on the page
function showError(message) {
    var box = document.getElementById('errorMessage');
    box.innerHTML = escapeHtml(message);
    box.classList.remove('d-none');
}

function clearError() {
    var box = document.getElementById('errorMessage');
    box.innerHTML = '';
    box.classList.add('d-none');
}

// loads the first page of tasks (soonest deadline first)
function viewTasks(page) {
    var response = '';
    var request = new XMLHttpRequest();
    request.open('GET', '/view-tasks?page=' + (page || 1) + '&limit=' + PAGE_SIZE, true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);

        // show the error message if the backend returned an error
        if (request.status !== 200) {
            showError(response.message || 'Unable to load tasks!');
            return;
        }
        clearError();

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
                '<td><button type="button" onclick="viewTaskDetails(\'' + tasks[i].id + '\')">Details</button></td>' +
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

        // show "No tasks found" instead of the table when there are no tasks
        if (tasks.length === 0) {
            document.getElementById('emptyMessage').innerHTML = "You don't have any tasks yet. Create your first task to get started.";
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