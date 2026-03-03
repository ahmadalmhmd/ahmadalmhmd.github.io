// عقدة Airtable لإضافة السجلات
{
  "parameters": {
    "operation": "create",
    "baseId": "{{$credentials.airtable.baseId}}",
    "table": "Articles",
    "fields": {
      "Title": "={{$json.title}}",
      "Link": "={{$json.link}}",
      "Source": "={{$json.source}}",
      "Published Date": "={{$json.published}}",
      "Description": "={{$json.description}}",
      "AI Summary": "={{$json.ai_summary}}",
      "AI Tags": "={{$json.ai_tags}}",
      "AI Status": "={{$json.ai_status}}",
      "AI Significance": "={{$json.ai_significance}}",
      "AI Entities": "={{$json.ai_entities}}",
      "AI Sentiment": "={{$json.ai_sentiment}}",
      "URL Hash": "={{$json.url_hash}}",
      "Image URL": "={{$json.image}}",
      "Author": "={{$json.author}}",
      "Categories": "={{$json.categories}}",
      "Word Count": "={{$json.word_count}}",
      "Data Quality": "={{$json.data_quality}}",
      "Requires Review": "={{$json.requires_review}}",
      "Days Since Published": "={{$json.days_since_published}}",
      "Quarter": "={{$json.quarter}}",
      "Processed At": "={{$now.toISO()}}"
    }
  }
}
