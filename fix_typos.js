const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'data/menu.json',
  'data/Claude_menu_yeni.json',
  'fluted_mushroom_menu.json'
];

for (const file of filesToUpdate) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Corn and Crab Fritter -> Corn and Crab Fitter
    content = content.replace(/Corn and Crab Fritter/g, 'Corn and Crab Fitter');
    
    // 2. balsamic-thyme -> balsamicthyme
    content = content.replace(/balsamic-thyme/g, 'balsamicthyme');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
