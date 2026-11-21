// Remember the original deadline so an unchanged (already past) deadline is still allowed
var originalDeadline = "";

// Edit + Delete buttons for one table row (call this from the row builders with the task object)
function taskActionButtons(task) {
    var data = encodeURIComponent(JSON.stringify(task)).replace(/'/g, '%27');
    return '<button type="button" class="btn btn-warning" onclick="editTask(\'' + data + '\')">Edit</button> ' +
        '<button type="button" class="btn btn-danger" onclick="deleteTask(\'' + data + '\')">Delete</button>';
}

// Reload the table, categories and stats after an edit or delete
function refreshTaskViews() {
    filterSortTasks(1);
    viewCategories();
    viewTaskStats();
}

// Function to open the edit modal and pre-fill it with the selected task's data
function editTask(data) {
    var selectedTask;

    try {
        selectedTask = JSON.parse(decodeURIComponent(data));
    } catch (e) {
        alert('Unable to load task!');
        return;
    }

    // Pre-fill the modal input fields with the current task details
    document.getElementById("editTitle").value = selectedTask.title;
    document.getElementById("editDescription").value = selectedTask.description;
    document.getElementById("editCategory").value = selectedTask.category;
    document.getElementById("editPriority").value = selectedTask.priority;
    document.getElementById("editStatus").value = selectedTask.status;
    document.getElementById("editDeadline").value = selectedTask.deadline;
    originalDeadline = selectedTask.deadline;

    // Set update button's onclick attribute to call updateTask() with task's ID
    document.getElementById("updateButton").setAttribute(
        "onclick",
        'updateTask("' + selectedTask.id + '")'
    );

    // Show the edit modal using Bootstrap's modal method
    $('#editTaskModal').modal('show');
}

// Function to send updated task data to the backend API
function updateTask(id) {
    var response = "";

    // Create a JSON object from the modal input fields
    var jsonData = {
        title: document.getElementById("editTitle").value.trim(),
        description: document.getElementById("editDescription").value.trim(),
        category: document.getElementById("editCategory").value.trim(),
        priority: document.getElementById("editPriority").value,
        status: document.getElementById("editStatus").value,
        deadline: document.getElementById("editDeadline").value
    };

    // Basic validation to ensure all fields are filled
    if (jsonData.title == "" || jsonData.description == "" || jsonData.category == "" ||
        jsonData.priority == "" || jsonData.status == "" || jsonData.deadline == "") {
        alert('All fields are required!');
        return; // Stop execution if validation fails
    }

    // A changed deadline cannot be earlier than today
    var today = new Date().toISOString().split('T')[0];
    if (jsonData.deadline !== originalDeadline && jsonData.deadline < today) {
        alert('Deadline cannot be earlier than today!');
        return;
    }

    // Configure the request as PUT to the edit-task endpoint with the task ID
    var request = new XMLHttpRequest();
    request.open("PUT", "/edit-task/" + id, true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        try {
            response = JSON.parse(request.responseText); // Parse JSON response
        } catch (e) {
            alert('Unable to edit task!');
            return;
        }

        // If the backend confirms success, show an alert and reload the table
        if (request.status === 200 && response.message == "Task updated successfully!") {
            alert('Edited Task: ' + jsonData.title + '!');
            $('#editTaskModal').modal('hide'); // Close modal
            refreshTaskViews(); // Reload table content
        } else {
            // Show error if update failed
            alert(response.message || 'Unable to edit task!');
        }
    };

    // Handle network errors (e.g. server not running)
    request.onerror = function () {
        alert('Unable to reach the server. Please try again.');
    };

    // Send the JSON data to the server
    request.send(JSON.stringify(jsonData));
}

// Function to open the delete confirmation modal for the selected task
function deleteTask(data) {
    var selectedTask;

    try {
        selectedTask = JSON.parse(decodeURIComponent(data));
    } catch (e) {
        alert('Unable to load task!');
        return;
    }

    // Show which task is about to be deleted (textContent keeps special characters safe)
    document.getElementById("deleteTaskName").textContent = selectedTask.title;

    // Reset the error message and the confirm button
    document.getElementById("deleteError").classList.add("d-none");
    document.getElementById("confirmDeleteButton").disabled = false;

    // Set confirm button's onclick attribute to call confirmDeleteTask() with task's ID
    document.getElementById("confirmDeleteButton").setAttribute(
        "onclick",
        'confirmDeleteTask("' + selectedTask.id + '")'
    );

    // Show the delete confirmation modal using Bootstrap's modal method
    $('#deleteTaskModal').modal('show');
}

// Function to send the delete request after the user confirms
function confirmDeleteTask(id) {
    var confirmButton = document.getElementById("confirmDeleteButton");
    var errorBox = document.getElementById("deleteError");

    // Stop double clicks while the request is running
    confirmButton.disabled = true;

    // Configure request as DELETE to the delete-task endpoint with the task ID
    var request = new XMLHttpRequest();
    request.open("DELETE", "/delete-task/" + id, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function () {
        var response;

        try {
            response = JSON.parse(request.responseText); // Parse JSON response from server
        } catch (e) {
            errorBox.textContent = 'Unable to delete task.';
            errorBox.classList.remove("d-none");
            confirmButton.disabled = false;
            return;
        }

        if (request.status === 200) {
            $('#deleteTaskModal').modal('hide'); // Close modal
            alert(response.message); // If deletion was success, show a confirmation alert
            refreshTaskViews(); // Refresh the table to reflect the deleted task
        } else {
            // Keep the modal open and show the error inside it
            errorBox.textContent = response.message || 'Unable to delete task.';
            errorBox.classList.remove("d-none");
            confirmButton.disabled = false;
        }
    };

    // Handle network errors (e.g. server not running)
    request.onerror = function () {
        errorBox.textContent = 'Unable to reach the server. Please try again.';
        errorBox.classList.remove("d-none");
        confirmButton.disabled = false;
    };

    request.send();
}