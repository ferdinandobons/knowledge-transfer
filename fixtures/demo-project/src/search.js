function findByIngredient(recipes, ingredient) {
  const needle = ingredient.toLowerCase();
  return recipes.filter((recipe) =>
    recipe.ingredients.some((item) => item.toLowerCase().includes(needle))
  );
}

module.exports = { findByIngredient };
