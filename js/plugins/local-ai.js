/**
 * Local AI Plugin - Support for Ollama and LM Studio
 */

const LocalAIPlugin = {
  name: 'local-ai',
  
  async discoverModels() {
    const endpoints = [
      { url: 'http://localhost:11434/api/tags', name: 'Ollama', type: 'ollama' },
      { url: 'http://localhost:1234/v1/models', name: 'LM Studio', type: 'openai' }
    ];
    
    const availableModels = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          if (endpoint.type === 'ollama') {
            (data.models || []).forEach(m => {
              availableModels.push({
                id: m.name,
                name: m.name + ' (Ollama)',
                actualId: m.name,
                provider: 'ollama',
                url: 'http://localhost:11434/api/generate'
              });
            });
          } else {
            (data.data || []).forEach(m => {
              availableModels.push({
                id: m.id,
                name: m.id + ' (LM Studio)',
                actualId: m.id,
                provider: 'lmstudio',
                url: 'http://localhost:1234/v1'
              });
            });
          }
        }
      } catch (e) {
        // console.log(`[LocalAI] ${endpoint.name} not found at ${endpoint.url}`);
      }
    }
    
    return availableModels;
  },

  async callLocal(model, prompt, options = {}) {
    if (model.provider === 'ollama') {
      return this.callOllama(model.actualId, prompt, options);
    } else {
      return this.callLMStudio(model.actualId, prompt, options);
    }
  },

  async callOllama(modelId, prompt, options) {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: modelId,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7
        }
      })
    });
    const data = await res.json();
    return data.response;
  },

  async callLMStudio(modelId, prompt, options) {
    const res = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }
};

window.LocalAIPlugin = LocalAIPlugin;
