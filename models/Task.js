class Tasks {
    constructor(title, description, category,priority , status, deadline) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status || "Not Started"; // Default status if not provided
        this.deadline = deadline || new Date().toISOString().split('T')[0]; // Default to current date if not provided

        const timestamp = new Date().getTime(); 
        const random = Math.floor(Math.random() * 1000);
        this.id = timestamp + "" + random.toString().padStart(3, '0');
    }
}

module.exports = { Tasks };
