/**
 * Search Plugin - Advanced Free Search System (2026 Edition)
 * Sources: DuckDuckGo, Wikipedia, arXiv, PubMed
 * No API Keys required.
 */

const SearchPlugin = {
  name: 'search',
  
  async search(query, type = 'general') {
    console.log(`[SearchPlugin] Searching for: ${query} (Type: ${type})`);
    
    const results = [];
    
    // Parallel fetching
    const promises = [];
    
    if (type === 'general' || type === 'news') {
      promises.push(this.searchDuckDuckGo(query));
      promises.push(this.searchWikipedia(query));
    }
    
    if (type === 'scientific' || type === 'research') {
      promises.push(this.searchArxiv(query));
      promises.push(this.searchPubMed(query));
      promises.push(this.searchWikipedia(query));
    }
    
    if (type === 'coding' || type === 'tech') {
      promises.push(this.searchDuckDuckGo(query + ' programming solution site:stackoverflow.com OR site:github.com'));
    }

    const allResults = await Promise.all(promises);
    return allResults.flat().filter(r => r && r.content).slice(0, 10);
  },

  /**
   * DuckDuckGo search via HTML parsing (No API)
   * Uses a fallback if CORS is blocked, or assumes a proxy is used in production.
   */
  async searchDuckDuckGo(query) {
    try {
      // In a real browser-only app, we might need a public CORS proxy.
      // We'll try the "lite" version which is easier to parse.
      const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const html = data.contents;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const results = [];
      
      const links = doc.querySelectorAll('.result__a');
      const snippets = doc.querySelectorAll('.result__snippet');
      
      links.forEach((link, i) => {
        if (i < 5) {
          results.push({
            title: link.textContent.trim(),
            url: link.href,
            content: snippets[i] ? snippets[i].textContent.trim() : '',
            source: 'DuckDuckGo'
          });
        }
      });
      
      return results;
    } catch (e) {
      console.error('DuckDuckGo search failed', e);
      return [];
    }
  },

  async searchWikipedia(query) {
    try {
      const url = `https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      
      return (data.query.search || []).map(r => ({
        title: r.title,
        url: `https://ar.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
        content: r.snippet.replace(/<[^>]*>/g, ''),
        source: 'Wikipedia'
      }));
    } catch (e) {
      return [];
    }
  },

  async searchArxiv(query) {
    try {
      const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=3`;
      const response = await fetch(url);
      const text = await response.text();
      
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const entries = xml.querySelectorAll('entry');
      const results = [];
      
      entries.forEach(entry => {
        results.push({
          title: entry.querySelector('title').textContent.trim(),
          url: entry.querySelector('id').textContent.trim(),
          content: entry.querySelector('summary').textContent.trim(),
          source: 'arXiv'
        });
      });
      
      return results;
    } catch (e) {
      return [];
    }
  },

  async searchPubMed(query) {
    try {
      // PubMed requires two steps: esearch then esummary
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult.idlist;
      
      if (!ids || ids.length === 0) return [];
      
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.slice(0, 3).join(',')}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      const summaryData = await summaryRes.json();
      
      const results = [];
      for (const id of ids.slice(0, 3)) {
        const item = summaryData.result[id];
        if (item) {
          results.push({
            title: item.title,
            url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
            content: item.source + ' (' + item.pubdate + ')',
            source: 'PubMed'
          });
        }
      }
      return results;
    } catch (e) {
      return [];
    }
  },

  filterResults(results) {
    // Remove spam or useless results
    return results.filter(r => {
      if (!r.title || r.title.length < 5) return false;
      if (!r.content || r.content.length < 10) return false;
      const spamKeywords = ['buy', 'cheap', 'discount', 'free download', 'torrent'];
      return !spamKeywords.some(k => r.title.toLowerCase().includes(k) || r.content.toLowerCase().includes(k));
    });
  }
};

window.SearchPlugin = SearchPlugin;
