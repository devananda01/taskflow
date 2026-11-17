class Task {
    constructor(title, description, category, priority, status, deadline) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;   // High | Medium | Low
        this.status = status;       // Pending | In Progress | Completed
        this.deadline = deadline;   // YYYY-MM-DD
    }
}

module.exports = { Task };
