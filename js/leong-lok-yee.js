function addTask() {
    var response = "";

    // Create an object to hold form data
    var jsonData = new Object();
    jsonData.title = document.getElementById("title").value;
    jsonData.description = document.getElementById("description").value;
    jsonData.category = document.getElementById("category").value;
    jsonData.priority = document.getElementById("priority").value;
    jsonData.status = document.getElementById("status").value;
    jsonData.deadline = document.getElementById("deadline").value;

    // Validate required fields (all must be filled in)
    if (jsonData.title == "" || jsonData.description == "" || jsonData.deadline == "") {
        alert('All fields are required!');
        return; // Stop execution if validation fails
    }



    // Configure the request to POST data to /add-task
    var request = new XMLHttpRequest();
    request.open("POST", "/add-task", true);
    request.setRequestHeader('Content-Type', 'application/json');

    // Define what happens when the server responds
    request.onload = function () {
        response = JSON.parse(request.responseText); // Parse JSON response
        console.log(response)

        // If no error message is returned → success
        if (response.message == undefined) {
            alert('Added Task: ' + jsonData.title + '!');

            // Clear form fields after success
            document.getElementById("title").value = "";
            document.getElementById("description").value = "";
            document.getElementById("deadline").value = "";

            // Close modal
            $('#resourceModal').modal('hide');

            // Reload table content
            viewResources();
        } else {
            // Show error if resource could not be added
            alert('Unable to add task!');
        }
    };
    // Send the request with JSON-formatted data
    request.send(JSON.stringify(jsonData));
}
