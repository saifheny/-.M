
const MemoryPlugin = {
  name: 'memory',
  dbName: 'AI_Agent_Memory',
  dbVersion: 1,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('facts')) {
          db.createObjectStore('facts', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = (e) => reject(e);
    });
  },

  async saveFact(content, tags = []) {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction('facts', 'readwrite');
      const store = tx.objectStore('facts');
      store.add({
        content,
        tags,
        timestamp: Date.now()
      });
      tx.oncomplete = () => resolve(true);
    });
  },

  async recall(query) {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction('facts', 'readonly');
      const store = tx.objectStore('facts');
      const request = store.getAll();

      request.onsuccess = () => {
        const facts = request.result;
        const words = query.toLowerCase().split(/\s+/);
        const matches = facts.filter(f =>
          words.some(w => f.content.toLowerCase().includes(w) || f.tags.some(t => t.includes(w)))
        );
        resolve(matches.slice(-5));
      };
    });
  },

  async processDocument(file, content) {
    UI.toast(`جاري معالجة المستند: ${file.name} وإضافته لقاعدة المعرفة المحلية...`, 'info');

    const chunks = content.split('\n\n').filter(c => c.trim().length > 20);
    let processed = 0;

    for (const chunk of chunks) {
      await this.saveFact(chunk, [file.name, 'document', 'rag']);
      processed++;
    }

    UI.toast(`تم بنجاح أرشفة ${processed} فقرة من المستند في الذاكرة المحلية (RAG).`, 'success');
  }
};

window.MemoryPlugin = MemoryPlugin;
