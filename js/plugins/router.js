/**
 * AI Routing System - Smart Tool Selector and Task Analyzer
 */

const RouterPlugin = {
  name: 'router',

  async analyze(query) {
    const q = query.toLowerCase();
    
    // Simple heuristic-based routing for speed, 
    // can be upgraded to an LLM call for "Smart Routing"
    
    const taskTypes = {
      CODING: ['code', 'برمجة', 'أكواد', 'javascript', 'python', 'html', 'css', 'react', 'node', 'sql', 'database', 'api', 'json', 'function', 'bug', 'fix', 'develop', 'برمجة', 'موقع'],
      RESEARCH: ['research', 'paper', 'arxiv', 'pubmed', 'scientific', 'بحث علمي', 'دراسة', 'أبحاث', 'تعلم', 'دراسات'],
      WEB_SEARCH: ['search', 'find', 'latest', 'news', 'weather', 'who is', 'what happened', 'بحث', 'أخبار', 'سعر', 'متى', 'كم', 'اين'],
      FILE_TASK: ['analyze file', 'summary of this pdf', 'read', 'تحليل ملف', 'لخص الملف', 'محتوى الـ'],
      AUTOMATION: ['browser', 'click', 'go to', 'website', 'navigate', 'تصفح', 'موقع', 'افتح'],
      IMAGE_TASK: ['image', 'photo', 'analyze picture', 'vision', 'صورة', 'حلل الصورة'],
    };

    let selectedTask = 'GENERAL';
    
    for (const [type, keywords] of Object.entries(taskTypes)) {
      if (keywords.some(k => q.includes(k))) {
        selectedTask = type;
        break;
      }
    }

    return selectedTask;
  },

  async route(query, model) {
    const task = await this.analyze(query);
    console.log(`[Router] Detected task: ${task}`);
    
    let result = { task, toolUsed: null, data: null };

    switch (task) {
      case 'WEB_SEARCH':
      case 'RESEARCH':
        const searchType = task === 'RESEARCH' ? 'scientific' : 'general';
        const searchData = await SearchPlugin.search(query, searchType);
        result.toolUsed = 'search';
        result.data = searchData;
        break;
      
      case 'AUTOMATION':
        // Simulating browser automation
        result.toolUsed = 'browser';
        result.data = "The user wants to navigate the web. Suggesting browser actions.";
        break;
        
      default:
        result.toolUsed = 'none';
    }

    return result;
  }
};

window.RouterPlugin = RouterPlugin;
