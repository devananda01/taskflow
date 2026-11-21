// fills the summary cards, Total, Pending, In Progress, Completed
function viewTaskStats() {
    var response = '';
    var request = new XMLHttpRequest();
    request.open('GET', '/view-task-stats', true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);

        if (request.status !== 200) {
            alert('Unable to load task summary!');
            return;
        }

        setText('statTotal', response.total);
        setText('statPending', response.pending);
        setText('statInProgress', response.inProgress);
        setText('statCompleted', response.completed);
        setText('pctPending', response.pendingPct + '% load');
        setText('pctInProgress', response.inProgressPct + '% load');
        setText('pctCompleted', response.completedPct + '% done');
    };

    request.send();
}

// writes text into an element if it exists on the page
function setText(id, text) {
    var element = document.getElementById(id);
    if (element) {
        element.innerHTML = text;
    }
}