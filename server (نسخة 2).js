const crypto = require('crypto');
const { Postgres } = require('n8n-nodes-base').Postgres.node;

// استعلام لجلب المقالات المنشورة خلال آخر 30 يومًا
const query = `
  SELECT url_hash FROM tech_news.articles 
  WHERE created_at > NOW() - INTERVAL '30 days'
`;

const pg = new Postgres();
const existingArticles = await pg.execute({
  connection: $credentials.postgres,
  query: query
});

const existingHashes = new Set(existingArticles.map(item => item.url_hash));

// معالجة المقالات الواردة
const processedItems = [];
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

items.forEach(item => {
  // استخراج البيانات
  const title = item.json.title;
  const link = item.json.link || item.json.url;
  const pubDate = new Date(item.json.pubDate || item.json.published || item.json.isoDate);
  
  // إنشاء hash فريد
  const hash = crypto.createHash('sha256').update(link).digest('hex');
  
  // التحقق من التكرار والتاريخ
  if (!existingHashes.has(hash) && pubDate > oneDayAgo) {
    processedItems.push({
      json: {
        ...item.json,
        url_hash: hash,
        processed_date: new Date().toISOString(),
        title: title,
        link: link,
        published: pubDate.toISOString(),
        source: extractSource(item.json)
      }
    });
  }
});

function extractSource(item) {
  if (item.source) return item.source;
  if (item.source_name) return item.source_name;
  if (item.rss && item.rss.channel && item.rss.channel.title) 
    return item.rss.channel.title;
  return 'Unknown Source';
}

return processedItems;
