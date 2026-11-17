const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join('utils', 'ChloeOngJingYi-tasks.json');

// rounds down to 1 decimal place, e.g. 41.666 to 41.6
function pct(count, total) {
    if (total === 0) return 0;
    return Math.floor((count / total) * 1000) / 10;
}

// { total, pending, inProgress, completed, pendingPct, inProgressPct, completedPct }
async function viewTaskStats(req, res) {
    try {
        let tasks = [];
        try {
            const data = await fs.readFile(TASKS_FILE, 'utf8');
            tasks = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }

        const total = tasks.length;
        const pending = tasks.filter(t => t.status === 'Pending').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const completed = tasks.filter(t => t.status === 'Completed').length;

        return res.status(200).json({
            total: total,
            pending: pending,
            inProgress: inProgress,
            completed: completed,
            pendingPct: pct(pending, total),
            inProgressPct: pct(inProgress, total),
            completedPct: pct(completed, total)
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { viewTaskStats };
