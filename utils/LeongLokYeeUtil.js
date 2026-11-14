const { Tasks } = require('../models/Task');
const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join('utils', 'tasks.json');
const TEMPLATE_FILE = path.join('utils', 'tasks.template.json');

async function addTask(req, res) {
    try {
        const { title, description, category, priority, status, deadline } = req.body;
        const newTask = new Tasks(title, description, category, priority, status, deadline);

        let tasks = [];
        try {
            // Try reading the existing tasks.json
            const data = await fs.readFile(TASKS_FILE, 'utf8');
            tasks = JSON.parse(data);

            //error scenario #1: if there is already a task with the same title or description, return an error
            const existingTask = tasks.some((task) => task.title === title ||  task.description === description);
            if (existingTask) {
                return res.status(400).json({ message: "Task with the same title or description already exists." });
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                // If tasks.json doesn't exist, create it from the template
                const templateData = await fs.readFile(TEMPLATE_FILE, 'utf8');
                tasks = JSON.parse(templateData);
            } else {
                throw err;
            }
        }

        // Add new task and save to file
        tasks.push(newTask);
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');

        return res.status(201).json(tasks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { addTask };
