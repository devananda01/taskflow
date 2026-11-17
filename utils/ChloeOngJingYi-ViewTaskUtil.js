const fs = require('fs').promises;
const path = require('path');
const { sortTasks } = require('./ChloeOngJingYi-FilterSortTaskUtil');
const { getPage, validatePaging } = require('./ChloeOngJingYi-PageUtil');

const TASKS_FILE = path.join('utils', 'tasks.json');

async function viewTasks(req, res) {
    try {
        // page and limit must be valid numbers
        const pagingError = validatePaging(req.query.page, req.query.limit);
        if (pagingError) {
            return res.status(400).json({ message: pagingError });
        }

        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const allTasks = JSON.parse(data);
        const sorted = sortTasks(allTasks, 'deadline', 'asc');
        return res.status(200).json(getPage(sorted, req.query.page, req.query.limit));
    } catch (error) {
        // handle case where file does not exist yet
        if (error.code === 'ENOENT') {
            return res.status(200).json(getPage([], 1, 5)); // empty list if no file
        }
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { viewTasks };