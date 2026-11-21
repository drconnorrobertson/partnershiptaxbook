// Normalize only local Article/BlogPosting identity references for the same page.
function normalizeArticleIdentities(data, canonical) {
  const owner = new URL(canonical);
  const hosts = new Set([owner.hostname, owner.hostname.replace(/^www\./, '')]);
  const pagePath = u => u.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/';
  let changed = 0;
  function aligned(value) {
    if (typeof value !== 'string') return value;
    let ref;
    try { ref = new URL(value, owner); } catch { return value; }
    if (!['http:', 'https:'].includes(ref.protocol) || !hosts.has(ref.hostname) || ref.search || pagePath(ref) !== pagePath(owner)) return value;
    return canonical + ref.hash;
  }
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (!Array.isArray(node)) {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      if (types.some(t => ['Article', 'BlogPosting'].includes(t))) {
        for (const key of ['url', 'mainEntityOfPage']) {
          if (typeof node[key] === 'string') {
            const next = aligned(node[key]);
            if (next !== node[key]) { node[key] = next; changed++; }
          } else if (key === 'mainEntityOfPage' && node[key] && typeof node[key]['@id'] === 'string') {
            const next = aligned(node[key]['@id']);
            if (next !== node[key]['@id']) { node[key]['@id'] = next; changed++; }
          }
        }
      }
    }
    for (const child of Object.values(node)) visit(child);
  }
  visit(data);
  return changed;
}
module.exports = {normalizeArticleIdentities};
