// معالجة وتحليل استجابة LLM
const aiResponse = items[0].json.choices[0].message.content;

// تنظيف الاستجابة من أي علامات Markdown
let cleanResponse = aiResponse
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim();

let analysis;
try {
  analysis = JSON.parse(cleanResponse);
} catch (error) {
  // إذا فشل التحليل، استخدم نموذجاً افتراضياً
  analysis = {
    summary: items[0].json.description || 'No summary available',
    tags: ['technology'],
    status: 'announced',
    significance: 2,
    key_entities: [],
    sentiment: 'neutral'
  };
}

// دمج التحليل مع المقال الأصلي
return items.map((item, index) => ({
  json: {
    ...item.json,
    ai_summary: analysis.summary || item.json.description,
    ai_tags: analysis.tags || [],
    ai_status: analysis.status || 'unknown',
    ai_significance: analysis.significance || 1,
    ai_entities: analysis.key_entities || [],
    ai_sentiment: analysis.sentiment || 'neutral',
    processed_at: new Date().toISOString()
  }
}));
