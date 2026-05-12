const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('.env.local not found');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncMenu() {
  console.log('🚀 Starting sync to Supabase...');

  // 1. Load menu data
  const menuPath = path.resolve(process.cwd(), 'fluted_mushroom_menu.json');
  if (!fs.existsSync(menuPath)) {
    console.error('fluted_mushroom_menu.json not found');
    return;
  }
  const data = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
  const menu = data.menu;

  // 2. Extract and sync categories
  const categoryNames = Object.keys(menu).map(key => menu[key].label);
  console.log(`📂 Found ${categoryNames.length} categories.`);

  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const { error: catError } = await supabase
      .from('categories')
      .upsert({ 
        name, 
        slug, 
        display_order: i,
        is_active: true
      }, { onConflict: 'name' });

    if (catError) console.error(`❌ Error upserting category ${name}:`, catError.message);
  }
  console.log('✅ Categories synced.');

  // 3. Sync menu items
  console.log('🍕 Syncing menu items...');
  let totalItems = 0;

  for (const key of Object.keys(menu)) {
    const category = menu[key];
    const items = category.items || [];
    
    for (const item of items) {
      const priceStr = String(item.price || '0');
      const cleanPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

      const { error: itemError } = await supabase
        .from('menu_items')
        .insert({
          item_name: item.name,
          category_name: category.label,
          item_price: cleanPrice,
          is_active: true
        });

      if (itemError) {
        console.error(`❌ Error inserting item ${item.name}:`, itemError.message);
      } else {
        totalItems++;
      }
    }
  }

  console.log(`✅ Finished! Synced ${totalItems} items.`);
}

syncMenu();
