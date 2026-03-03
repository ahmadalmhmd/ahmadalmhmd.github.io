const express = require('express');
const fetch = require('node-fetch');
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
// serve static UI files from /public
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const FEEDS_FILE = path.join(__dirname, 'feeds.json');

const parser = new Parser();
const CACHE_FILE = path.join(__dirname, 'cache.json');

function saveCache(obj) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
        console.error('Failed to write cache', err);
    }
}

function loadCache() {
    try {
        if (!fs.existsSync(CACHE_FILE)) return null;
        const raw = fs.readFileSync(CACHE_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to read cache', err);
        return null;
    }
}

async function loadFeeds() {
    try {
        if (!fs.existsSync(FEEDS_FILE)) {
            // No feeds.json provided — assume n8n will push items to /feeds
            return [];
        }
        const raw = fs.readFileSync(FEEDS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Error reading feeds.json', err);
        return [];
    }
}

function withinLast24Hours(date) {
    const itemDate = new Date(date);
    const now = new Date();
    const diff = now - itemDate;
    return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
}

app.get('/feeds', async (req, res) => {
    // Return cached data pushed by n8n (n8n handles summarization)
    const cache = loadCache();
    if (cache && Array.isArray(cache.items) && cache.items.length) {
        return res.json({
            fetchedAt: cache.fetchedAt || new Date().toISOString(),
            count: cache.items.length,
            items: cache.items
        });
    }

    // No cache yet — return empty
    res.json({ fetchedAt: new Date().toISOString(), count: 0, items: [], message: 'No items cached yet. POST items from n8n to /feeds' });
});

// Accept pushed items from n8n (batch or single item). The body can be:
// { items: [...] } or an array of items or a single item object. We APPEND to cache.json
app.post('/push', (req, res) => {
    let body = req.body;
    console.log('POST /push received:', JSON.stringify(body, null, 2));

    if (!body) return res.status(400).json({ error: 'Empty body' });
    let items = null;

    // Tolerate many n8n output shapes
    if (Array.isArray(body)) items = body;
    else if (Array.isArray(body.items)) items = body.items;
    else if (Array.isArray(body.data)) items = body.data;
    else if (body.json && Array.isArray(body.json)) items = body.json;
    else if (typeof body === 'object' && (body.title || body.link || body.output)) {
        // Single item or n8n node output with 'output' field
        items = [body];
    }

    if (!items || items.length === 0) {
        console.warn('No items found in body');
        return res.status(400).json({ error: 'No items array found in body. Send { items: [...] } or an array.', received: body });
    }

    // Basic normalization: ensure pubDate is ISO string
    const newItems = items.map(it => ({
        source: it.source || it.feed || it.sourceName || 'n8n',
        title: it.title || it.output || null,
        link: it.link || it.url || null,
        pubDate: it.pubDate || it.isoDate || it.date || new Date().toISOString(),
        contentSnippet: it.contentSnippet || it.content || it.description || null,
        summary: it.summary || it.output || null
    }));

    // APPEND to existing cache instead of replacing
    const existingCache = loadCache();
    let allItems = existingCache && existingCache.items ? existingCache.items : [];

    // Add new items and remove duplicates (by link)
    newItems.forEach(newItem => {
        const exists = allItems.find(existing => existing.link === newItem.link && existing.title === newItem.title);
        if (!exists) {
            allItems.push(newItem);
        }
    });

    // Sort by pubDate, newest first
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const payload = { fetchedAt: new Date().toISOString(), items: allItems };
    saveCache(payload);
    console.log(`Appended ${newItems.length} new items. Total in cache: ${allItems.length}`);
    return res.json({ ok: true, saved: newItems.length, total: allItems.length });
});

// Alias POST /feeds -> accept pushed items from n8n (some workflows post to /feeds)
app.post('/feeds', (req, res) => {
    console.log('POST /feeds received:', JSON.stringify(req.body, null, 2));

    let body = req.body;
    if (!body) return res.status(400).json({ error: 'Empty body' });
    let items = null;

    // Tolerate many n8n output shapes
    if (Array.isArray(body)) items = body;
    else if (Array.isArray(body.items)) items = body.items;
    else if (Array.isArray(body.data)) items = body.data;
    else if (body.json && Array.isArray(body.json)) items = body.json;
    else if (typeof body === 'object' && (body.title || body.link || body.output)) {
        items = [body];
    }

    if (!items || items.length === 0) {
        console.warn('No items found in body');
        return res.status(400).json({ error: 'No items array found in body. Send { items: [...] } or an array.', received: body });
    }

    const newItems = items.map(it => ({
        source: it.source || it.feed || it.sourceName || 'n8n',
        title: it.title || it.output || null,
        link: it.link || it.url || null,
        pubDate: it.pubDate || it.isoDate || it.date || new Date().toISOString(),
        contentSnippet: it.contentSnippet || it.content || it.description || null,
        summary: it.summary || it.output || null
    }));

    // APPEND to existing cache instead of replacing
    const existingCache = loadCache();
    let allItems = existingCache && existingCache.items ? existingCache.items : [];

    // Add new items and remove duplicates (by link)
    newItems.forEach(newItem => {
        const exists = allItems.find(existing => existing.link === newItem.link && existing.title === newItem.title);
        if (!exists) {
            allItems.push(newItem);
        }
    });

    // Sort by pubDate, newest first
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const payload = { fetchedAt: new Date().toISOString(), items: allItems };
    saveCache(payload);
    console.log(`Appended ${newItems.length} new items. Total in cache: ${allItems.length}`);
    return res.json({ ok: true, saved: newItems.length, total: allItems.length });
});

// Optional endpoint to clear or refresh cache
app.post('/clear-cache', (req, res) => {
    try {
        if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE);
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    // serve the static index.html if present
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`RSS endpoint listening on http://localhost:${PORT}`);
    console.log(`Also accessible at: http://192.168.29.41:${PORT}`);
    console.log(`For n8n in Docker, use: http://host.docker.internal:${PORT}/feeds`);
});
