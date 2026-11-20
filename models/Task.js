class Task {
  constructor(title, description, category, priority, status, deadline) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    this.id = timestamp + "" + random.toString().padStart(3, "0");
    this.title = title;
    this.description = description;
    this.category = category;
    this.priority = priority; // High | Medium | Low
    this.status = status; // Pending | In Progress | Completed
    this.deadline = deadline; // YYYY-MM-DD
  }
}

module.exports = { Task };
