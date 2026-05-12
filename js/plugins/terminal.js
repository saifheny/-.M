const Terminal = {
  history: [],
  historyIndex: -1,

  focus() {
    const term = document.getElementById('editor-terminal');
    if (term) {
      term.style.display = 'flex';
      document.getElementById('terminal-input').focus();
    }
  },

  close() {
    const term = document.getElementById('editor-terminal');
    if (term) term.style.display = 'none';
  },

  clear() {
    const output = document.getElementById('terminal-output');
    if (output) {
      output.innerHTML = `
        <div style="color:#3B82F6;">AI Agent Pro Terminal v2.0</div>
        <div style="color:#A3A3A3;">Type 'help' for available commands.</div>
      `;
    }
  },

  print(text, type = 'normal') {
    const output = document.getElementById('terminal-output');
    if (!output) return;

    const div = document.createElement('div');
    div.style.marginTop = '4px';
    div.style.wordBreak = 'break-all';

    if (type === 'error') {
      div.style.color = '#EF4444';
    } else if (type === 'success') {
      div.style.color = '#10B981';
    } else if (type === 'system') {
      div.style.color = '#3B82F6';
    } else if (type === 'warning') {
      div.style.color = '#F59E0B';
    } else {
      div.style.color = '#A3A3A3';
    }

    div.textContent = text;
    output.appendChild(div);

    const body = document.getElementById('terminal-body');
    body.scrollTop = body.scrollHeight;
  },

  handleInput(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target;
      const cmd = input.value.trim();

      if (!cmd) return;

      const output = document.getElementById('terminal-output');
      const echo = document.createElement('div');
      echo.style.marginTop = '8px';
      echo.innerHTML = `<span style="color:#10B981;">user@ai-agent:~$</span> <span style="color:#fff;">${cmd}</span>`;
      output.appendChild(echo);

      this.history.push(cmd);
      this.historyIndex = this.history.length;
      input.value = '';

      this.execute(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        e.target.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        e.target.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        e.target.value = '';
      }
    }
  },

  execute(cmd) {
    const args = cmd.split(' ');
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help':
        this.print('Available commands:');
        this.print('  help     - Show this message');
        this.print('  clear    - Clear terminal output');
        this.print('  date     - Show current date and time');
        this.print('  echo     - Print text to terminal');
        this.print('  js       - Evaluate JavaScript code');
        this.print('  theme    - Set theme (dark/light)');
        this.print('  models   - List available AI models');
        this.print('  autofix  - Trigger the Auto-Fix Agent for code errors');
        this.print('  ping     - Check connection status');
        break;
      case 'clear':
        this.clear();
        break;
      case 'date':
        this.print(new Date().toString(), 'system');
        break;
      case 'echo':
        this.print(args.slice(1).join(' '));
        break;
      case 'js':
      case 'eval':
        try {
          const code = args.slice(1).join(' ');
          const result = eval(code);
          this.print(String(result), 'success');
        } catch (err) {
          this.print(err.toString(), 'error');
        }
        break;
      case 'theme':
        if (args[1] === 'dark' || args[1] === 'light') {
          UI.setTheme(args[1]);
          this.print(`Theme set to ${args[1]}`, 'success');
        } else {
          this.print('Usage: theme dark | light', 'warning');
        }
        break;
      case 'models':
        if (typeof Main !== 'undefined' && Main.ALL_MODELS) {
          const m = Main.ALL_MODELS.map(x => x.id).join(', ');
          this.print(m, 'system');
        } else {
          this.print('Models list not available', 'error');
        }
        break;
      case 'autofix':
        if (typeof AgentSystem !== 'undefined') {
          AgentSystem.runAutoFix();
        } else {
          this.print('AgentSystem not loaded.', 'error');
        }
        break;
      case 'ping':
        this.print('Pong! System is online.', 'success');
        break;
      default:
        this.print(`Command not found: ${command}. Type 'help' for a list of commands.`, 'error');
    }
  }
};

window.Terminal = Terminal;
