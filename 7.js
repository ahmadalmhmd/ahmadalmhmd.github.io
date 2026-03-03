// إعداد النشرة البريدية
const articles = items;
const topStories = articles.filter(a => a.json.ai_significance >= 4).slice(0, 5);

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }
        .article { margin: 20px 0; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .significance-5 { background: #ff4757; color: white; padding: 3px 8px; border-radius: 4px; }
        .tags { display: flex; gap: 5px; margin: 10px 0; }
        .tag { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tech News Daily</h1>
            <p>AI-curated intelligence for professionals</p>
        </div>
        
        <h2>🔥 Top Stories</h2>
        ${topStories.map(article => `
            <div class="article">
                <div class="significance-5">Significance: ${article.json.ai_significance}/5</div>
                <h3><a href="${article.json.link}">${article.json.title}</a></h3>
                <p>${article.json.ai_summary}</p>
                <div class="tags">
                    ${article.json.ai_tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('')}
        
        <hr>
        
        <h2>📌 All News</h2>
        ${articles.map(article => `
            <div class="article">
                <h4><a href="${article.json.link}">${article.json.title}</a></h4>
                <p>${article.json.ai_summary.substring(0, 150)}...</p>
            </div>
        `).join('')}
        
        <p style="color: #666; margin-top: 30px;">
            Sent daily at 8:00 AM ET • Unsubscribe anytime
        </p>
    </div>
</body>
</html>
`;

return [{
  json: {
    to: 'newsletter@example.com',
    subject: `Tech News Daily - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    html: htmlContent
  }
}];
