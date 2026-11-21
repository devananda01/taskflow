const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join('utils', 'tasks.json');

// returns every distinct category with the number of tasks in it,
// e.g. [ { "name": "School", "count": 2 }, { "name": "Work", "count": 1 } ]
async function viewCategories(req, res) {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const allTasks = JSON.parse(data);

        const counts = {};
        allTasks.forEach(function (task) {
            const name = task.category || 'Uncategorised';
            counts[name] = (counts[name] || 0) + 1;
        });

        const categories = Object.keys(counts)
            .sort()
            .map(function (name) {
                return { name: name, count: counts[name] };
            });

        return res.status(200).json(categories);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(200).json([]);
        }
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { viewCategories };
