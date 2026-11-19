var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 5050;
var startPage = "index.html";
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

const { viewTasks } = require('./utils/ChloeOngJingYi-ViewTaskUtil')
const { viewCategories } = require('./utils/ChloeOngJingYi-ViewCategoriesUtil')
const { viewTaskDetails } = require('./utils/ChloeOngJingYi-ViewTaskDetailsUtil')
const { viewTaskStats } = require('./utils/ChloeOngJingYi-ViewTaskStatsUtil')
const { filterSortTasks } = require('./utils/ChloeOngJingYi-FilterSortTaskUtil')

app.get('/view-tasks', viewTasks)
app.get('/view-task-stats', viewTaskStats)
app.get('/view-categories', viewCategories)
app.get('/view-task-details/:id', viewTaskDetails)
app.get('/filter-sort-tasks', filterSortTasks)

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/" + startPage);
});

const { addTask} = require('./utils/LeongLokYeeUtil')
app.post('/add-task', addTask);

const {
  updateTask,
  deleteTask,
} = require("./utils/DevanandaThayyullathilUtil");

app.put("/update-task/:id", updateTask);
app.delete("/delete-task/:id", deleteTask);

server = app.listen(PORT, function () {
  const address = server.address();
  const baseUrl = `http://${
    address.address == "::" ? "localhost" : address.address
  }:${address.port}`;
  console.log(`Demo project at: ${baseUrl}`);
});
module.exports = { app, server };
