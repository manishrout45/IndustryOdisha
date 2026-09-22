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
