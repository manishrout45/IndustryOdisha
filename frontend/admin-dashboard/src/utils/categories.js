/** Normalize category ids so `wp-12` and `12` match */
export function normalizeCategoryId(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/^wp-/i, "").trim().toLowerCase();
}

/** True if article belongs to selected category (id, slug, or name). */
export function articleMatchesCategory(article, categoryFilter, categories = []) {
  if (!categoryFilter || categoryFilter === "all") return true;

  const selected = categories.find(
    (c) => String(c._id) === String(categoryFilter)
  );
  const filterId = normalizeCategoryId(categoryFilter);
  const filterSlug = String(selected?.slug || "").toLowerCase();
  const filterName = String(selected?.name || "").toLowerCase();

  const cat = article?.category;
  const catId = normalizeCategoryId(
    typeof cat === "object" ? cat?._id : cat
  );
  const catSlug = String(
    (typeof cat === "object" ? cat?.slug : "") || ""
  ).toLowerCase();
  const catName = String(
    (typeof cat === "object" ? cat?.name : cat) || ""
  ).toLowerCase();

  if (filterId && catId && filterId === catId) return true;
  if (filterSlug && catSlug && filterSlug === catSlug) return true;
  if (filterName && catName && filterName === catName) return true;
  return false;
}

/** Flatten nested category tree for select dropdowns */
export function flattenCategories(tree = [], prefix = "") {
  const list = [];
  (Array.isArray(tree) ? tree : []).forEach((cat) => {
    if (!cat) return;
    const label = prefix ? `${prefix} › ${cat.name}` : cat.name;
    list.push({ ...cat, label });
    if (Array.isArray(cat.children) && cat.children.length) {
      list.push(...flattenCategories(cat.children, cat.name));
    }
  });
  return list;
}
