const Canvas = {
  ctx: null,
  isDrawing: false,
  color: '#FFFFFF',
  brushSize: 3,

  init() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;
    
    this.ctx = canvas.getContext('2d');
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
    
    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    
    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchend', (e) => {
      const mouseEvent = new MouseEvent('mouseup', {});
      canvas.dispatchEvent(mouseEvent);
    });
  },

  resize() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    // Fill with background
    this.ctx.fillStyle = '#0F172A'; // dark bg
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  startDrawing(e) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(
      e.clientX - e.target.getBoundingClientRect().left,
      e.clientY - e.target.getBoundingClientRect().top
    );
  },

  draw(e) {
    if (!this.isDrawing) return;
    
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.color;
    
    this.ctx.lineTo(
      e.clientX - e.target.getBoundingClientRect().left,
      e.clientY - e.target.getBoundingClientRect().top
    );
    this.ctx.stroke();
  },

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
  },

  clear() {
    this.resize(); // resets and fills bg
  },

  setColor(c) {
    this.color = c;
    document.querySelectorAll('.canvas-color-btn').forEach(btn => {
      btn.style.border = btn.dataset.color === c ? '2px solid #fff' : '2px solid transparent';
    });
  },

  setBrushSize(size) {
    this.brushSize = size;
  },

  exportToChat() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'drawing.png', { type: 'image/png' });
      if (typeof Main !== 'undefined' && Main.handleFileSelection) {
        Main.handleFileSelection(file);
        UI.closeModal('canvas-modal');
      }
    }, 'image/png');
  }
};

window.Canvas = Canvas;
