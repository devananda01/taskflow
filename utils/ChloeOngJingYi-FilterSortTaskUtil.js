const fs = require('fs').promises;
const path = require('path');
const { getPage, validatePaging } = require('./ChloeOngJingYi-PageUtil');

const TASKS_FILE = path.join('utils', 'tasks.json');

const PRIORITY_RANK = { 'High': 3, 'Medium': 2, 'Low': 1 };
const STATUS_RANK = { 'Pending': 1, 'In Progress': 2, 'Completed': 3 };
const SORTABLE_FIELDS = ['title', 'category', 'priority', 'status', 'deadline'];
const VALID_STATUS = ['Pending', 'In Progress', 'Completed'];
const VALID_PRIORITY = ['High', 'Medium', 'Low'];
const VALID_ORDER = ['asc', 'desc'];
const MAX_TEXT_LENGTH = 50;

// checks every value in the query string
// returns an error message for the first problem found, or null if all is fine
function validateQuery(query) {
    const { search, status, priority } = query;

    if (search !== undefined && String(search).length > MAX_TEXT_LENGTH) {
        return 'Search text must be ' + MAX_TEXT_LENGTH + ' characters or fewer';
    }
    if (status && !VALID_STATUS.includes(status)) {
        return 'Invalid status. Use Pending, In Progress or Completed';
    }
    if (priority && !VALID_PRIORITY.includes(priority)) {
        return 'Invalid priority. Use High, Medium or Low';
    }
    return null;
}

// sorts an array of tasks (returns a new array)
function sortTasks(tasks, sortBy, order) {
    const direction = order === 'desc' ? -1 : 1;

    return tasks.slice().sort(function (a, b) {
        let result;

        if (sortBy === 'priority') {
            result = (PRIORITY_RANK[a.priority] || 0) - (PRIORITY_RANK[b.priority] || 0);
        } else if (sortBy === 'status') {
            result = (STATUS_RANK[a.status] || 0) - (STATUS_RANK[b.status] || 0);
        } else if (sortBy === 'deadline') {
            // Tasks without a deadline always go last
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            result = new Date(a.deadline) - new Date(b.deadline);
        } else {
            result = String(a[sortBy] || '').localeCompare(String(b[sortBy] || ''), undefined, { sensitivity: 'base' });
        }

        return result * direction;
    });
}


async function filterSortTasks(req, res) {
    try {
        // reject bad values with a 400 and a clear message
        const validationError = validateQuery(req.query);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const { search, status, category, priority } = req.query;
        const sortBy = req.query.sortBy || 'deadline';
        const order = req.query.order === 'desc' ? 'desc' : 'asc';

        let tasks = [];
        try {
            const data = await fs.readFile(TASKS_FILE, 'utf8');
            tasks = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }

        // search
        if (search && search.trim() !== '') {
            const keyword = search.trim().toLowerCase();
            tasks = tasks.filter(function (t) {
                return String(t.title || '').toLowerCase().includes(keyword) ||
                       String(t.description || '').toLowerCase().includes(keyword) ||
                       String(t.category || '').toLowerCase().includes(keyword);
            });
        }

        // filter
        if (status) {
            tasks = tasks.filter(t => t.status === status);
        }
        if (category) {
            tasks = tasks.filter(t => (t.category || 'Uncategorised') === category);
        }
        if (priority) {
            tasks = tasks.filter(t => t.priority === priority);
        }

        // sort, then get the requested page
        tasks = sortTasks(tasks, sortBy, order);
        return res.status(200).json(getPage(tasks, req.query.page, req.query.limit));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { filterSortTasks, sortTasks };