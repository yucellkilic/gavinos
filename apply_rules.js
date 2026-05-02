const fs = require('fs');

const menuPath = 'data/menu.json';
const claudeMenuPath = 'data/Claude_menu_yeni.json';

let menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
const claudeData = JSON.parse(fs.readFileSync(claudeMenuPath, 'utf8'));

// Update items
menuData = menuData.map(item => {
  // 1. Market Price
  if (item.name.includes("Lobster Roll")) {
    item.base_price = null;
    item.pricing_type = "market_price";
  }

  // 2. Custom Services
  if (item.name.includes("Full Bar Service") || item.name.includes("Bar Service (client provides all beverages)")) {
    item.base_price = null;
    item.pricing_type = "custom_per_client_request";
    item.description = item.description ? item.description + " (Müşteri talebine göre özel fiyatlandırılır)" : "Müşteri talebine göre özel fiyatlandırılır";
  }

  // 3. Mevsimsel Ürünler
  if (item.name.includes("Arancini") || item.name.includes("Crostini")) {
    const note = "Mevsimsel olarak değişiklik gösterir";
    if (item.description && !item.description.includes(note)) {
      item.description += ` - ${note}`;
    } else if (!item.description) {
      item.description = note;
    }
  }

  // 4. Sıfır Dolar Temizliği (accompaniment_groups)
  if (item.accompaniment_groups) {
    item.accompaniment_groups.forEach(group => {
      group.items.forEach(acc => {
        if (acc.price === 0 || acc.price === 0.00 || acc.surcharge === 0) {
          acc.price = null;
          acc.surcharge = null;
          acc.no_surcharge = true;
        }
      });
    });
  }

  return item;
});

// 5. Add Policies
const existingPolicyIndex = menuData.findIndex(item => item.id === 'disclaimers_and_policies');
const policyObject = {
  id: "disclaimers_and_policies",
  name: "Kurallar ve Politikalar",
  is_policy_object: true,
  description: "Catering hizmetlerimize ait genel kurallar ve politikalar",
  base_price: null,
  meal_type: [],
  image_url: "📄",
  policies: claudeData.disclaimers_and_policies,
  general_notes: claudeData.company.general_notes
};

if (existingPolicyIndex >= 0) {
  menuData[existingPolicyIndex] = policyObject;
} else {
  menuData.push(policyObject);
}

fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2));
console.log("menu.json updated successfully.");
