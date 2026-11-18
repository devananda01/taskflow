const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join('utils', 'tasks.json');

async function viewTaskDetails(req, res) {
    try {
        const id = req.params.id;
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const allTasks = JSON.parse(data);

        const task = allTasks.find(function (t) {
            return String(t.id) === String(id);
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        return res.status(200).json(task);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: 'Task not found' });
        }
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { viewTaskDetails };