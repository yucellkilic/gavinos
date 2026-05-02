const fs = require('fs');

const menuPath = 'data/menu.json';
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

// Delete existing fields if any (for cleanliness)
menuData.forEach(item => {
  delete item.supports_accompaniments;
  delete item.selectedAccompaniments;
  delete item.garnishes;
  delete item.accompaniments;
});

let modifiedCount = 0;
let cleanCount = 0;

menuData.forEach(item => {
  let supports = false;
  if (item.badges) {
    if (item.badges.includes('Sit-Down Entrée') || 
        item.badges.includes('Duet Entrée') || 
        item.badges.includes('Buffet Package')) {
      supports = true;
    }
  }
  
  if (supports) {
    item.supports_accompaniments = true;
    modifiedCount++;
  } else {
    cleanCount++;
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2));
console.log(`Added supports_accompaniments to ${modifiedCount} items.`);
console.log(`Cleaned/Ignored ${cleanCount} items.`);
