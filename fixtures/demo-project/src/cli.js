const { loadRecipes, saveRecipes } = require('./store');
const { findByIngredient } = require('./search');

const [, , command, ...rest] = process.argv;

function main() {
  if (command === 'add') {
    const name = rest[0];
    const flagIndex = rest.indexOf('--ingredients');
    const ingredients = flagIndex === -1 ? [] : rest[flagIndex + 1].split(',');
    const recipes = loadRecipes();
    recipes.push({ name, ingredients });
    saveRecipes(recipes);
    console.log(`Added "${name}" (${ingredients.length} ingredients)`);
  } else if (command === 'list') {
    for (const recipe of loadRecipes()) {
      console.log(`- ${recipe.name}: ${recipe.ingredients.join(', ')}`);
    }
  } else if (command === 'find') {
    for (const recipe of findByIngredient(loadRecipes(), rest[0])) {
      console.log(`- ${recipe.name}`);
    }
  } else {
    console.log('Usage: cli.js <add|list|find> ...');
    process.exitCode = 1;
  }
}

main();
