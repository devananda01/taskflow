const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'utils', 'tasks.json');
const templateFile = path.join(__dirname, '..', 'utils', 'tasks.template.json');

if (fs.existsSync(dataFile)) {
    console.log('utils/tasks.json already exists, leaving it unchanged.');
} else {
    fs.copyFileSync(templateFile, dataFile);
    console.log('Created utils/tasks.json from utils/tasks.template.json.');
}