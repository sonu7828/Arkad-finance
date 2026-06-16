/** React Router 7: use explicit `search: ''` so base routes clear prior query strings. */
export function pathStringToTo(path) {
  const q = path.indexOf('?');
  if (q === -1) return { pathname: path, search: '' };
  return { pathname: path.slice(0, q), search: path.slice(q) };
}

/**
 * Active state for sidebar items (exact match; disambiguate same pathname + different ?query).
 * @param {{ pathname: string, search: string }} location
 * @param {string} path - e.g. '/admin/loans' or '/admin/loans?status=pending'
 * @param {string[]} allPaths - every nav item path for the role (for sibling rules)
 */
export function isSidebarItemActive(location, path, allPaths) {
  const q = path.indexOf('?');
  const pathOnly = q === -1 ? path : path.slice(0, q);
  if (location.pathname !== pathOnly) return false;

  if (q !== -1) {
    const want = new URLSearchParams(path.slice(q + 1));
    const have = new URLSearchParams(location.search);
    for (const [k, v] of want) {
      if (have.get(k) !== v) return false;
    }
    return true;
  }

  for (const sib of allPaths) {
    if (sib === path) continue;
    const si = sib.indexOf('?');
    if (si === -1) continue;
    if (sib.slice(0, si) !== pathOnly) continue;
    const want = new URLSearchParams(sib.slice(si + 1));
    const have = new URLSearchParams(location.search);
    let siblingMatches = true;
    for (const [k, v] of want) {
      if (have.get(k) !== v) {
        siblingMatches = false;
        break;
      }
    }
    if (siblingMatches) return false;
  }
  return true;
}

export function isMobileNavItemActive(location, path) {
  const q = path.indexOf('?');
  const base = q === -1 ? path : path.slice(0, q);
  if (location.pathname !== base) return false;

  if (q === -1) return true;

  const want = new URLSearchParams(path.slice(q + 1));
  const have = new URLSearchParams(location.search);
  for (const [k, v] of want) {
    if (have.get(k) !== v) return false;
  }
  return true;
}
