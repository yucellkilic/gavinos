const fs = require('fs');

const claudeMenuPath = 'data/Claude_menu_yeni.json';
const menuPath = 'data/menu.json';

const claudeData = JSON.parse(fs.readFileSync(claudeMenuPath, 'utf8'));
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

// 1. Extract Sit-Down Groups
const sdSalads = claudeData.menu.sit_down_selections.garnish_selection_pools.salads.items.map(s => ({
  id: `sd-salad-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: s.name,
  price: s.surcharge || 0,
  description: s.description || ''
}));
const sdStarches = claudeData.menu.sit_down_selections.garnish_selection_pools.starches.items.map(s => ({
  id: `sd-starch-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: s.name,
  price: 0
}));
const sdVegs = claudeData.menu.sit_down_selections.garnish_selection_pools.vegetables.items.map(s => ({
  id: `sd-veg-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: s.name,
  price: 0
}));

const sitDownGroups = [
  { id: 'salads', label: 'Choose One Salad', items: sdSalads },
  { id: 'starches', label: 'Choose One Starch', items: sdStarches },
  { id: 'vegetables', label: 'Choose One Vegetable', items: sdVegs }
];

// 2. Extract Buffet Groups
const buffSalads = claudeData.menu.buffet_dinner_selections.garnish_selection_pools.salads.items.map(s => ({
  id: `buff-salad-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: s.name,
  price: 0,
  description: s.description || ''
}));

const buffStarchesArr = [];
const buffStarchesCat = claudeData.menu.buffet_dinner_selections.garnish_selection_pools.starches.categories;
buffStarchesCat.rice.items.forEach(s => buffStarchesArr.push({ id: `buff-rice-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name: s.name, price: 0 }));
buffStarchesCat.pasta.items.forEach(s => buffStarchesArr.push({ id: `buff-pasta-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name: s.name, price: 0, description: s.description || '' }));
buffStarchesCat.potatoes.items.forEach(s => buffStarchesArr.push({ id: `buff-potato-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name: s.name, price: 0 }));

const buffVegs = claudeData.menu.buffet_dinner_selections.garnish_selection_pools.vegetables.items.map(s => ({
  id: `buff-veg-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: s.name,
  price: 0
}));

const buffetGroups = [
  { id: 'salads', label: 'Choose One Salad', items: buffSalads },
  { id: 'starches', label: 'Choose Two Starches', items: buffStarchesArr },
  { id: 'vegetables', label: 'Choose One Vegetable', items: buffVegs }
];

// 3. Inject into menu.json
let modified = 0;
menuData.forEach(item => {
  // Clean old fields
  delete item.supports_accompaniments;

  if (item.badges) {
    if (item.badges.includes('Sit-Down Entrée') || item.badges.includes('Duet Entrée')) {
      item.accompaniment_groups = sitDownGroups;
      modified++;
    } else if (item.badges.includes('Buffet Package')) {
      item.accompaniment_groups = buffetGroups;
      modified++;
    }
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2));
console.log(`Injected accompaniment_groups into ${modified} items.`);
