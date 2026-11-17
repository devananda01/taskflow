// gets one task by its id and shows it in the details pop-up
function viewTaskDetails(id) {
    var response = '';
    var request = new XMLHttpRequest();
    request.open('GET', '/view-task-details/' + encodeURIComponent(id), true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);

        // "Task not found" (404)
        if (request.status !== 200) {
            showError(response.message || 'Unable to load task details!');
            return;
        }

        clearError();

        var html =
            '<table>' +
                '<tr><th>Title</th><td>' + escapeHtml(response.title) + '</td></tr>' +
                '<tr><th>Description</th><td>' + (response.description ? escapeHtml(response.description) : 'No description') + '</td></tr>' +
                '<tr><th>Category</th><td>' + escapeHtml(response.category) + '</td></tr>' +
                '<tr><th>Priority</th><td>' + escapeHtml(response.priority) + '</td></tr>' +
                '<tr><th>Status</th><td>' + escapeHtml(response.status) + '</td></tr>' +
                '<tr><th>Deadline</th><td>' + formatDate(response.deadline) + '</td></tr>' +
            '</table>';

        document.getElementById('taskDetailsContent').innerHTML = html;

        // open the pop-up
        $('#taskDetailsModal').modal('show');
    };

    request.send();
}