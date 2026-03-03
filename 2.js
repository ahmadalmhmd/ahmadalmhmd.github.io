// توحيد بنية البيانات لجميع المصادر
return items.map(item => ({
  json: {
    title: item.json.title || item.json.headline || '',
    link: item.json.link || item.json.url || '',
    source: item.json.source || 'Tech News',
    published: item.json.published || item.json.pubDate || item.json.isoDate,
    description: cleanHtml(item.json.description || item.json.summary || ''),
    content: item.json.content || item.json.description || '',
    image: extractImage(item.json),
    author: item.json.author || item.json.creator || '',
    categories: item.json.categories || []
  }
}));

function cleanHtml(text) {
  if (!text) return '';
  return String(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractImage(item) {
  if (item.image) return item.image;
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  if (item['media:content'] && item['media:content'].url) return item['media:content'].url;
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  return '';
}
