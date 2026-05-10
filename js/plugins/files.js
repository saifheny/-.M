/**
 * File Processing Plugin - Extracts text from various formats in the browser
 */

const FilePlugin = {
  name: 'files',

  async processFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'pdf':
        return this.readPDF(file);
      case 'docx':
        return this.readDOCX(file);
      case 'csv':
      case 'json':
      case 'txt':
      case 'js':
      case 'py':
      case 'html':
      case 'css':
        return this.readText(file);
      default:
        return 'Format not supported for text extraction.';
    }
  },

  async readText(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  },

  async readPDF(file) {
    if (typeof pdfjsLib === 'undefined') return 'PDF.js library not loaded.';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      return fullText;
    } catch (e) {
      return 'Error reading PDF: ' + e.message;
    }
  },

  async readDOCX(file) {
    if (typeof mammoth === 'undefined') return 'Mammoth.js library not loaded.';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (e) {
      return 'Error reading DOCX: ' + e.message;
    }
  }
};

window.FilePlugin = FilePlugin;
