// fills the "All Categories" dropdown with the categories found in the tasks
// (If the page also has an element with id="categoryList", it is filled with clickable categories and task counts as well.)
function viewCategories() {
    var response = '';
    var request = new XMLHttpRequest();
    request.open('GET', '/view-categories', true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);

        if (request.status !== 200) {
            alert('Unable to load categories!');
            return;
        }

        var total = 0;
        var listHtml = '';
        var optionsHtml = '<option value="">All Categories</option>';

        for (var i = 0; i < response.length; i++) {
            total += response[i].count;
            var name = escapeHtml(response[i].name);

            listHtml += '<a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" ' +
                'onclick="selectCategory(\'' + name + '\')">' + name +
                '<span class="badge badge-primary badge-pill">' + response[i].count + '</span></a>';

            optionsHtml += '<option value="' + name + '">' + name + '</option>';
        }

        listHtml = '<a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" ' +
            'onclick="selectCategory(\'\')">All Tasks<span class="badge badge-primary badge-pill">' + total + '</span></a>' + listHtml;

        var list = document.getElementById('categoryList');
        if (list) {
            list.innerHTML = listHtml;
        }

        // Keep the dropdown's current selection after refreshing
        var dropdown = document.getElementById('filterCategory');
        if (dropdown) {
            var current = dropdown.value;
            dropdown.innerHTML = optionsHtml;
            dropdown.value = current;
        }
    };

    request.send();
}

// called when a category in the optional sidebar is clicked
function selectCategory(category) {
    document.getElementById('filterCategory').value = category;
    filterSortTasks(1);
}
