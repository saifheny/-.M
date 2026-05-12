/**
 * Virtual Browser Plugin - Simulates browser automation in the frontend
 */

const BrowserPlugin = {
  name: 'browser',
  currentUrl: '',
  pageContent: '',

  async navigate(url) {
    console.log(`[BrowserPlugin] Navigating to: ${url}`);
    this.currentUrl = url;
    
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const html = data.contents;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove scripts and styles for cleaner text
      doc.querySelectorAll('script, style, iframe, nav, footer').forEach(el => el.remove());
      
      this.pageContent = doc.body.innerText.replace(/\s+/g, ' ').trim().substring(0, 5000);
      return {
        url: this.currentUrl,
        title: doc.title,
        text: this.pageContent
      };
    } catch (e) {
      return { error: 'Failed to load page: ' + e.message };
    }
  },

  async performAction(action, target) {
    // Simulating clicks/typing by searching for the target and "navigating" if it's a link
    console.log(`[BrowserPlugin] Action: ${action} on ${target}`);
    return `Action ${action} on ${target} simulated. Content updated.`;
  }
};

window.BrowserPlugin = BrowserPlugin;
