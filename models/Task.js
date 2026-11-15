class Tasks {
    constructor(title, description, category,priority , status, deadline) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.deadline = deadline; 

        const timestamp = new Date().getTime(); 
        const random = Math.floor(Math.random() * 1000);
        this.id = timestamp + "" + random.toString().padStart(3, '0');
    }
}

module.exports = { Tasks };
