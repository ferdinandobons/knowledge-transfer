const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'recipes.json');

function loadRecipes() {
  if (!fs.existsSync(STORE_PATH)) return [];
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

// Write via temp file + rename so a crash mid-write never corrupts the store.
function saveRecipes(recipes) {
  const tmpPath = STORE_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(recipes, null, 2));
  fs.renameSync(tmpPath, STORE_PATH);
}

module.exports = { loadRecipes, saveRecipes, STORE_PATH };
