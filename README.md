# RSS Feed Viewer (n8n → Website)

Simple Node.js app that receives RSS feed items (with AI summaries) from n8n and displays them on a web page.

## n8n Workflow Overview

This project includes an n8n workflow that automatically processes RSS feeds and generates AI summaries:

![n8n RSS Workflow](https://github.com/user/repo/blob/main/workflow-diagram.png)

### Workflow Components:

1. **RSS Feed Sources**: Multiple RSS readers (Engadget, The Verge, etc.)
2. **Feed Merger**: Combines items from multiple RSS sources
3. **Item Processing**: Sets index and prepares summary prompts
4. **AI Summarization**: Uses Google Gemini to generate intelligent summaries
5. **Data Extraction**: Formats and structures the summarized content
6. **Website Integration**: Sends processed items to this Node.js server

## How it works
1. n8n reads RSS feeds from multiple sources (Engadget, The Verge, etc.)
2. Merges and processes feed items 
3. Generates AI summaries using Google Gemini Chat Model
4. POSTs the enriched results to this server
5. Server caches the items in `cache.json`
6. Web UI at http://localhost:3000/ displays the cached items with summaries

## Features

- 🤖 **AI-Powered Summaries**: Uses Google Gemini to generate intelligent summaries
- 📰 **Multi-Source RSS**: Supports multiple RSS feeds (Engadget, The Verge, etc.)
- ⚡ **Real-time Updates**: Automatic feed processing via n8n workflow
- 💾 **Smart Caching**: Efficient storage and retrieval of processed items  
- 🌐 **Clean Web Interface**: Simple, responsive UI to view summaries
- 🔄 **Automated Processing**: Hands-off RSS monitoring and summarization

## n8n Workflow Setup

The included n8n workflow processes RSS feeds and generates AI summaries. The workflow includes:

### Key Nodes:
- **RSS Read (Engadget)** - Fetches latest tech news from Engadget
- **RSS Read (The Verge)** - Fetches latest tech news from The Verge
- **Merge RSS Feeds** - Combines items from multiple sources
- **Set Item Index** - Adds indexing for processing
- **Prepare Summary Prompt** - Formats content for AI processing
- **AI Agent (Summarizer)** - Uses Google Gemini to create summaries
- **Extract Summary** - Processes AI response
- **Add Summary to Item** - Merges summary with original item
- **Your Website HTTP Request** - Sends to this Node.js server

### Workflow Configuration:
1. Import the workflow JSON into your n8n instance
2. Configure RSS feed URLs in the RSS Read nodes
3. Set up Google Gemini API credentials for the AI Agent
4. Update the HTTP Request node URL to point to your server: `http://localhost:3000/feeds`
5. Configure the execution schedule (recommended: every 30 minutes)

## Quick start

1. Install dependencies
```powershell
cd "C:\Users\Windows\Desktop\rss feed"
npm install
```

2. Run the server
```powershell
npm start
```

3. Open the web UI
- http://localhost:3000/

4. Configure n8n workflow
- Import the provided n8n workflow
- In the "Your Website HTTP Request" node:
  - Method: **POST**
  - URL: **http://localhost:3000/feeds**
  - Send Body: **ON**
  - Body Content Type: **JSON**
  - Body: The workflow automatically formats the data as:
    ```json
    {
      "items": [
        {
          "title": "Article title",
          "link": "https://...",
          "pubDate": "2025-10-02T12:00:00Z",
          "contentSnippet": "Brief description",
          "summary": "AI generated summary from Gemini"
        }
      ]
    }
    ```

## Fixing n8n "batchInterval" error

If you see: `Cannot read properties of undefined (reading 'batchInterval')`

**Root cause:** The HTTP Request node is missing required configuration or receiving unexpected input format.

**Solutions:**

1. **Check HTTP Request node settings (most common fix):**
   - Open the HTTP Request node settings
   - Click the **Settings** tab (not Parameters)
   - Scroll to **Batching** section
   - Make sure it's either:
     - Disabled (toggle OFF), or
     - Properly configured with batch size/interval if enabled

2. **Verify the node receives valid input:**
   - Add a **Code** or **Set** node before the HTTP Request
   - Shape the output to match what the server expects:
     ```javascript
     // In a Code node (Set all items):
     return items.map(item => ({
       json: {
         title: item.json.title,
         link: item.json.link,
         pubDate: item.json.pubDate || item.json.isoDate,
         contentSnippet: item.json.contentSnippet || item.json.content,
         summary: item.json.summary || item.json.output
       }
     }));
     ```

3. **Use Expression mode for the body:**
   - In HTTP Request → Send Body → Specify Body
   - Switch to **Expression** mode
   - Use: `{{ { "items": $json } }}`
   - Or to send all items: `{{ { "items": $items.map(i => i.json) } }}`

4. **Test with a simple static body first:**
   - Temporarily set a static JSON body to isolate the issue:
     ```json
     {
       "items": [
         {
           "title": "Test",
           "link": "https://example.com",
           "summary": "Test summary"
         }
       ]
     }
     ```

## Testing the endpoint

Run the test script:
```powershell
node test-endpoint.js
```

Or use curl/PowerShell:
```powershell
# POST test data
$body = @{
  items = @(
    @{
      title = "Test Article"
      link = "https://example.com"
      summary = "AI summary here"
    }
  )
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:3000/feeds -Body $body -ContentType "application/json"

# GET cached items
Invoke-RestMethod -Uri http://localhost:3000/feeds
```

## Project Structure

```
├── server.js          # Main Node.js server
├── package.json       # Dependencies and scripts
├── cache.json         # RSS items cache (auto-generated)
├── public/
│   └── index.html     # Web interface
└── README.md         # This file
```

## Requirements

- **Node.js** (v14 or higher)
- **n8n** workflow automation platform
- **Google Gemini API** access for AI summaries

## API Endpoints

- **GET /feeds** - Returns cached items from n8n
- **POST /feeds** - Accept items from n8n (saves to cache)
- **POST /push** - Alias for POST /feeds
- **POST /clear-cache** - Delete cached items
- **GET /** - Web UI to view items

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
