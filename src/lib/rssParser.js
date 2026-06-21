/**
 * Browser-native RSS 2.0 / Atom parser. Uses localName and namespace-agnostic
 * lookups so prefix-heavy feeds (arXiv, Vercel) parse the same as plain ones.
 */

function text(parent, tagName) {
  const node = parent.getElementsByTagNameNS('*', tagName)[0]
  return node?.textContent.trim() ?? ''
}

function atomLink(entry) {
  const links = [...entry.getElementsByTagNameNS('*', 'link')]
  const alternate = links.find((l) => l.getAttribute('rel') === 'alternate')
  return (alternate ?? links[0])?.getAttribute('href')?.trim() ?? ''
}

function parseRssItem(item) {
  const guid = text(item, 'guid')
  return {
    title: text(item, 'title'),
    link: text(item, 'link') || (guid.startsWith('http') ? guid : ''),
    publishedAt: text(item, 'pubDate') || text(item, 'date'),
    body: text(item, 'description') || text(item, 'encoded'),
  }
}

function parseAtomEntry(entry) {
  return {
    title: text(entry, 'title'),
    link: atomLink(entry),
    publishedAt: text(entry, 'published') || text(entry, 'updated'),
    body: text(entry, 'summary') || text(entry, 'content'),
  }
}

/** @returns {{title: string, link: string, publishedAt: string, body: string}[]} */
export function parseFeed(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml')
  if (doc.querySelector('parsererror')) {
    throw new Error('Feed is not valid XML')
  }
  if (doc.documentElement.localName === 'feed') {
    return [...doc.getElementsByTagNameNS('*', 'entry')].map(parseAtomEntry)
  }
  return [...doc.getElementsByTagNameNS('*', 'item')].map(parseRssItem)
}
