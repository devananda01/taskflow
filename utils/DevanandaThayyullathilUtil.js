const fs = require("fs").promises;
const path = require("path");

const TASKS_FILE = path.join(__dirname, "tasks.json");

const VALID_PRIORITY = ["High", "Medium", "Low"];
const VALID_STATUS = ["Pending", "In Progress", "Completed"];

// Read tasks from tasks.json
async function readTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, "utf8");
    const tasks = JSON.parse(data);

    if (!Array.isArray(tasks)) {
      throw new Error("Invalid tasks.json format.");
    }

    return tasks;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

// Validate the six editable task fields
function validateTaskFields(body) {
  const { title, description, category, priority, status, deadline } = body;

  const fields = [title, description, category, priority, status, deadline];

  if (
    fields.some((field) => typeof field !== "string" || field.trim() === "")
  ) {
    return "All fields are required.";
  }

  if (!VALID_PRIORITY.includes(priority)) {
    return "Invalid priority. Use High, Medium or Low.";
  }

  if (!VALID_STATUS.includes(status)) {
    return "Invalid status. Use Not Started, Pending, In Progress or Completed.";
  }

  // Check deadline format and whether it is a real calendar date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return "Invalid deadline. Use the format YYYY-MM-DD.";
  }

  const date = new Date(deadline + "T00:00:00Z");

  if (isNaN(date.getTime()) || date.toISOString().split("T")[0] !== deadline) {
    return "Invalid deadline. Please enter a valid calendar date.";
  }

  return null;
}

// PUT /update-task/:id
async function updateTask(req, res) {
  try {
    const id = req.params.id;
    const body = req.body || {};

    const tasks = await readTasks();

    // Find the task using its ID
    const taskIndex = tasks.findIndex((task) => String(task.id) == String(id));

    if (taskIndex === -1) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    // Validate the submitted fields
    const fieldError = validateTaskFields(body);

    if (fieldError) {
      return res.status(400).json({
        message: fieldError,
      });
    }

    const { title, description, category, priority, status, deadline } = body;

    const existingTask = tasks[taskIndex];

    // Check whether another task uses the same title or description
    const duplicate = tasks.some(function (task) {
      return (
        String(task.id) !== String(id) &&
        (task.title === title.trim() || task.description === description.trim())
      );
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Task with the same title or description already exists.",
      });
    }

    // Allow the existing deadline to remain unchanged,
    // but do not allow a changed deadline to be in the past
    const today = new Date().toISOString().split("T")[0];

    if (deadline !== existingTask.deadline && deadline < today) {
      return res.status(400).json({
        message: "Deadline cannot be earlier than today.",
      });
    }

    // Update the task while preserving its original ID
    tasks[taskIndex] = {
      ...existingTask,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority: priority,
      status: status,
      deadline: deadline,
    };

    // Save updated tasks to tasks.json
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf8");

    return res.status(200).json({
      message: "Task updated successfully!",
      task: tasks[taskIndex],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

// DELETE /delete-task/:id
async function deleteTask(req, res) {
  try {
    const id = req.params.id;

    const tasks = await readTasks();

    // Find the task using its ID
    const taskIndex = tasks.findIndex((task) => String(task.id) === String(id));

    if (taskIndex === -1) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    // Remove the task from the array
    const deletedTask = tasks.splice(taskIndex, 1)[0];

    // Save the remaining tasks
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf8");

    return res.status(200).json({
      message: "Task deleted successfully!",
      task: deletedTask,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = { updateTask, deleteTask };
