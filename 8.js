// إعداد رسالة Telegram
const topArticles = items.slice(0, 5);

const message = `
🔥 *Top Tech News ${new Date().toLocaleDateString('en-US')}*

${topArticles.map((article, index) => `
*${index + 1}. ${article.json.title}*
📊 Significance: ${'⭐'.repeat(article.json.ai_significance)}
🏷️ Tags: ${article.json.ai_tags.join(', ')}
📰 ${article.json.source}

${article.json.ai_summary}

[Read more](${article.json.link})
`).join('\n---\n')}

_Powered by AI • Updated daily_
`;

return [{
  json: {
    chat_id: '@your_channel',
    text: message,
    parse_mode: 'Markdown',
    disable_web_page_preview: false
  }
}];
