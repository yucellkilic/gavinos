const fs = require('fs');

const claudeMenuPath = 'data/Claude_menu.json';
const menuPath = 'data/menu.json';

const claudeData = JSON.parse(fs.readFileSync(claudeMenuPath, 'utf8'));
const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

const newItems = [];

// 1. Sit-Down Salads
const sitDownSalads = claudeData.menu.sit_down_salads.items;
sitDownSalads.forEach(salad => {
  newItems.push({
    id: `salad-${salad.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: salad.name,
    description: salad.description || '',
    base_price: salad.surcharge || 0,
    meal_type: ['dinner'],
    image_url: '🥗',
    badges: ['Sit-Down Salad', 'Accompaniment']
  });
});

// 2. Sit-Down Accompaniments
const sitDownStarches = claudeData.menu.sit_down_accompaniments.starches.items;
sitDownStarches.forEach(item => {
  newItems.push({
    id: `starch-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: item,
    description: 'Plated Starch',
    base_price: 0,
    meal_type: ['dinner'],
    image_url: '🥔',
    badges: ['Sit-Down Accompaniment', 'Starch', 'Accompaniment']
  });
});

const sitDownVeg = claudeData.menu.sit_down_accompaniments.vegetables.items;
sitDownVeg.forEach(item => {
  newItems.push({
    id: `veg-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: item,
    description: 'Plated Vegetable',
    base_price: 0,
    meal_type: ['dinner'],
    image_url: '🥦',
    badges: ['Sit-Down Accompaniment', 'Vegetable', 'Accompaniment']
  });
});

// 3. Buffet Accompaniments
const buffetSalads = claudeData.menu.buffet_accompaniments.salads.items;
buffetSalads.forEach(salad => {
  newItems.push({
    id: `buffet-salad-${salad.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: salad.name,
    description: salad.description || '',
    base_price: 0,
    meal_type: ['dinner'],
    image_url: '🥗',
    badges: ['Buffet Accompaniment', 'Salad', 'Accompaniment']
  });
});

const buffetVeg = claudeData.menu.buffet_accompaniments.vegetables.items;
buffetVeg.forEach(item => {
  newItems.push({
    id: `buffet-veg-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: item,
    description: 'Buffet Vegetable',
    base_price: 0,
    meal_type: ['dinner'],
    image_url: '🥕',
    badges: ['Buffet Accompaniment', 'Vegetable', 'Accompaniment']
  });
});

const buffetRice = claudeData.menu.buffet_accompaniments.starches.categories.rice;
buffetRice.forEach(item => {
  newItems.push({
    id: `buffet-rice-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: item,
    description: 'Buffet Rice',
    base_price: 0,
    meal_type: ['dinner'],
    image_url: '🍚',
    badges: ['Buffet Accompaniment', 'Starch', 'Accompaniment']
  });
});

const buffetPasta = claudeData.menu.buffet_accompaniments.starches.categories.pasta;
buffetPasta.forEach(item => {
  newItems.push({
    id: `buffet-pasta-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: item.name,
    description: item.description || 'Buffet Pasta',
    base_price: 0,
    meal_type: ['dinner'],
    image_url: '🍝',
    badges: ['Buffet Accompaniment', 'Starch', 'Accompaniment']
  });
});

const buffetPotatoes = claudeData.menu.buffet_accompaniments.starches.categories.potatoes;
buffetPotatoes.forEach(item => {
  newItems.push({
    id: `buffet-potato-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: item,
    description: 'Buffet Potato',
    base_price: 0,
    meal_type: ['dinner'],
    image_url: '🥔',
    badges: ['Buffet Accompaniment', 'Starch', 'Accompaniment']
  });
});

// 4. Professional Service
const staff = claudeData.menu.professional_service.staff;
staff.forEach(s => {
  newItems.push({
    id: `staff-${s.role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: s.role,
    description: `Professional staff. Minimum ${s.minimum_hours} hours.`,
    base_price: s.hourly_rate,
    meal_type: ['dinner', 'lunch', 'breakfast'],
    image_url: '👨‍🍳',
    badges: ['Professional Service', 'Staff']
  });
});

const bar = claudeData.menu.professional_service.bar_services;
bar.forEach(b => {
  newItems.push({
    id: `bar-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: b.name,
    description: b.description || 'Bar Service',
    base_price: b.price || 0,
    meal_type: ['dinner', 'lunch', 'breakfast'],
    image_url: '🍸',
    badges: ['Professional Service', 'Bar']
  });
});

// Append to menuData
const existingIds = new Set(menuData.map(item => item.id));
newItems.forEach(item => {
  if (!existingIds.has(item.id)) {
    menuData.push(item);
  }
});

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2));
console.log('Merged successfully. Added ' + newItems.length + ' items.');
